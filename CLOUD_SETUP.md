# Cloud Setup (No Local DB Required)

## 1) Provision managed services
- Create a managed SQL database (MySQL or PostgreSQL-compatible JDBC URL).
- Create a managed Redis instance.

## 2) Configure backend environment variables
Use:
- `distributed-rate-limiter-backend/.env.example`
- `netflix-clone-backend/.env.example`

Set real values for:
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_SSL_ENABLED=true`
- `PORT`
- Cookie/domain/frontend URL variables for production.

## 3) Deploy backend(s)
Deploy each Spring Boot app to your cloud host (Render/Railway/Fly/EC2/etc.) and add the env vars in the platform settings.

## 4) Deploy frontend(s)
Deploy frontend apps and point their API base/proxy to your deployed backend URL(s).

## 5) Verify
- Backend health: `/api/health/redis` should return `UP`.
- Login and API calls should work from any machine/network.
