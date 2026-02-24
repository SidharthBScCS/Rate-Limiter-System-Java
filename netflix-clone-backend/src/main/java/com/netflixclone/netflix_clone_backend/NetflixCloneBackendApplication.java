package com.netflixclone.netflix_clone_backend;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class NetflixCloneBackendApplication {

	public static void main(String[] args) {
		normalizeCloudEnvironment();
		SpringApplication.run(NetflixCloneBackendApplication.class, args);
	}

	private static void normalizeCloudEnvironment() {
		normalizeDbConfig();
		normalizeRedisConfig();
	}

	private static void normalizeDbConfig() {
		String dbUrl = firstNonPlaceholder("SPRING_DATASOURCE_URL", "JDBC_DATABASE_URL", "DATABASE_URL", "DB_URL");
		if (isBlank(dbUrl)) {
			dbUrl = buildJdbcUrlFromPgParts();
		}
		if (dbUrl != null) {
			String normalized = normalizeDbUrl(dbUrl);
			System.setProperty("DB_URL", normalized);
			System.setProperty("spring.datasource.url", normalized);
			System.setProperty("jakarta.persistence.jdbc.url", normalized);

			if (normalized.startsWith("jdbc:postgresql:")) {
				System.setProperty("DB_DRIVER", "org.postgresql.Driver");
				System.setProperty("spring.datasource.driver-class-name", "org.postgresql.Driver");
			} else if (normalized.startsWith("jdbc:mysql:")) {
				System.setProperty("DB_DRIVER", "com.mysql.cj.jdbc.Driver");
				System.setProperty("spring.datasource.driver-class-name", "com.mysql.cj.jdbc.Driver");
			}
		}

		String user = firstNonPlaceholder(
				"SPRING_DATASOURCE_USERNAME",
				"PGUSER",
				"DATABASE_USER",
				"POSTGRES_USER",
				"DB_USERNAME");
		String pass = firstNonPlaceholder(
				"SPRING_DATASOURCE_PASSWORD",
				"PGPASSWORD",
				"DATABASE_PASSWORD",
				"POSTGRES_PASSWORD",
				"DB_PASSWORD");
		setIfMissingOrPlaceholder("DB_USERNAME", user);
		setIfMissingOrPlaceholder("DB_PASSWORD", pass);
		if (!isBlank(user)) {
			System.setProperty("spring.datasource.username", user);
			System.setProperty("jakarta.persistence.jdbc.user", user);
		}
		if (!isBlank(pass)) {
			System.setProperty("spring.datasource.password", pass);
			System.setProperty("jakarta.persistence.jdbc.password", pass);
		}
	}

	private static void normalizeRedisConfig() {
		String redisUrl = firstNonBlank("REDIS_URL", "REDIS_TLS_URL");
		if (isBlank(redisUrl)) {
			return;
		}

		try {
			URI uri = URI.create(redisUrl);
			if (!"redis".equalsIgnoreCase(uri.getScheme()) && !"rediss".equalsIgnoreCase(uri.getScheme())) {
				return;
			}

			setIfMissing("REDIS_HOST", uri.getHost());
			if (uri.getPort() > 0) {
				setIfMissing("REDIS_PORT", String.valueOf(uri.getPort()));
			}
			if ("rediss".equalsIgnoreCase(uri.getScheme())) {
				setIfMissing("REDIS_SSL_ENABLED", "true");
			}

			String userInfo = uri.getUserInfo();
			if (!isBlank(userInfo)) {
				String[] parts = userInfo.split(":", 2);
				if (parts.length == 2) {
					if (!isBlank(parts[0])) {
						setIfMissing("REDIS_USERNAME", parts[0]);
					}
					if (!isBlank(parts[1])) {
						setIfMissing("REDIS_PASSWORD", parts[1]);
					}
				} else if (!isBlank(parts[0])) {
					setIfMissing("REDIS_PASSWORD", parts[0]);
				}
			}
		} catch (IllegalArgumentException ignored) {
			// Keep original env values when REDIS_URL is malformed.
		}
	}

	private static String normalizeDbUrl(String raw) {
		String value = raw.trim();
		if (value.startsWith("jdbc:")) {
			return value;
		}
		if (value.startsWith("postgres://") || value.startsWith("postgresql://")) {
			return normalizePostgresUri(value);
		}
		if (!value.contains("://") && value.contains("/")) {
			return "jdbc:postgresql://" + value;
		}
		return value;
	}

	private static String normalizePostgresUri(String raw) {
		try {
			URI uri = URI.create(raw);
			String host = uri.getHost();
			if (isBlank(host)) {
				return raw;
			}

			if (uri.getUserInfo() != null) {
				String[] parts = uri.getUserInfo().split(":", 2);
				if (parts.length > 0 && !isBlank(parts[0])) {
					setIfMissingOrPlaceholder("DB_USERNAME", decodeUrlPart(parts[0]));
				}
				if (parts.length == 2 && !isBlank(parts[1])) {
					setIfMissingOrPlaceholder("DB_PASSWORD", decodeUrlPart(parts[1]));
				}
			}

			StringBuilder jdbc = new StringBuilder("jdbc:postgresql://").append(host);
			if (uri.getPort() > 0) {
				jdbc.append(':').append(uri.getPort());
			}
			String path = uri.getPath();
			if (isBlank(path) || "/".equals(path)) {
				path = "/postgres";
			}
			jdbc.append(path);
			if (!isBlank(uri.getQuery())) {
				jdbc.append('?').append(uri.getQuery());
			}
			return jdbc.toString();
		} catch (IllegalArgumentException ignored) {
			return raw;
		}
	}

	private static String decodeUrlPart(String value) {
		return URLDecoder.decode(value, StandardCharsets.UTF_8);
	}

	private static String buildJdbcUrlFromPgParts() {
		String host = firstNonBlank("PGHOST", "POSTGRES_HOST");
		String database = firstNonBlank("PGDATABASE", "POSTGRES_DB");
		if (isBlank(host) || isBlank(database)) {
			return null;
		}
		String port = firstNonBlank("PGPORT", "POSTGRES_PORT");
		String safePort = isBlank(port) ? "5432" : port.trim();
		return "jdbc:postgresql://" + host.trim() + ":" + safePort + "/" + database.trim() + "?sslmode=require";
	}

	private static void setIfMissing(String key, String value) {
		if (isBlank(value)) {
			return;
		}
		if (isBlank(firstNonBlank(key))) {
			System.setProperty(key, value);
		}
	}

	private static void setIfMissingOrPlaceholder(String key, String value) {
		if (isBlank(value) || isPlaceholderValue(value)) {
			return;
		}
		String current = firstNonBlank(key);
		if (isBlank(current) || isPlaceholderValue(current)) {
			System.setProperty(key, value);
		}
	}

	private static String firstNonPlaceholder(String... keys) {
		for (String key : keys) {
			String value = firstNonBlank(key);
			if (!isBlank(value) && !isPlaceholderValue(value)) {
				return value;
			}
		}
		return null;
	}

	private static String firstNonBlank(String... keys) {
		for (String key : keys) {
			String systemValue = System.getProperty(key);
			if (!isBlank(systemValue)) {
				return systemValue;
			}
			String envValue = System.getenv(key);
			if (!isBlank(envValue)) {
				return envValue;
			}
		}
		return null;
	}

	private static boolean isBlank(String value) {
		return value == null || value.trim().isEmpty();
	}

	private static boolean isPlaceholderValue(String value) {
		if (value == null) {
			return false;
		}
		String normalized = value.trim().toLowerCase();
		return normalized.contains("<host>")
				|| normalized.contains("<db>")
				|| normalized.contains("<database>")
				|| normalized.contains("<user>")
				|| normalized.contains("your_")
				|| "db user".equals(normalized)
				|| "db password".equals(normalized);
	}
}
