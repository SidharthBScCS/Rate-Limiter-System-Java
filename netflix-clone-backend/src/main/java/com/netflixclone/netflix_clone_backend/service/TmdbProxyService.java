package com.netflixclone.netflix_clone_backend.service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.StringJoiner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class TmdbProxyService {

    private final HttpClient httpClient;
    private final String apiKey;
    private final String language;

    public TmdbProxyService(
            @Value("${tmdb.api-key:}") String apiKey,
            @Value("${tmdb.language:en-US}") String language
    ) {
        this.httpClient = HttpClient.newHttpClient();
        this.apiKey = apiKey;
        this.language = language;
    }

    public ResponseEntity<String> fetch(String path, Map<String, String> params) {
        if (apiKey == null || apiKey.isBlank()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("{\"message\":\"TMDB API key is not configured\"}");
        }

        try {
            StringJoiner query = new StringJoiner("&");
            query.add("api_key=" + encode(apiKey));
            query.add("language=" + encode(language));
            for (Map.Entry<String, String> entry : params.entrySet()) {
                if (entry.getValue() == null || entry.getValue().isBlank()) continue;
                query.add(encode(entry.getKey()) + "=" + encode(entry.getValue()));
            }

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.themoviedb.org/3" + path + "?" + query))
                    .timeout(Duration.ofSeconds(8))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            HttpStatus status = HttpStatus.resolve(response.statusCode());
            if (status == null) {
                status = HttpStatus.BAD_GATEWAY;
            }
            return ResponseEntity.status(status).body(response.body());
        } catch (IOException | InterruptedException ex) {
            if (ex instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("{\"message\":\"Failed to fetch TMDB data\"}");
        }
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
