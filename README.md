# Distributed Rate Limiter

This repository contains a Spring Boot backend and a React/Vite frontend for a
simple distributed rate limiter. It also includes optional monitoring with
Prometheus and Grafana.

## Running the application (without Docker)

1. **Backend**
   ```powershell
   cd distributed-rate-limiter-backend
   ./mvnw spring-boot:run
   ```
   The service listens on port 8080 by default. Metrics are exposed at
   `/actuator/prometheus`.

2. **Prometheus**
   * Download Prometheus from https://prometheus.io/download and extract it.
   * Copy `monitoring/prometheus.yml` somewhere on your machine. This file
     already uses `${PROMETHEUS_TARGET}` with a default of `localhost:8080`.
   * Start Prometheus:
     ```powershell
     prometheus --config.file=/path/to/prometheus.yml
     ```
   * Browse `http://localhost:9090/targets` to verify the `ratelimiter-backend`
     target is **UP**.

3. **Grafana**
   * Install Grafana from https://grafana.com/grafana/download.
   * Log in at `http://localhost:3000` (`admin/admin`).
   * Add a Prometheus data source pointing at `http://localhost:9090` (or
     let the provisioning file do it automatically).
     The YAML under `monitoring/grafana/provisioning/datasources` now sets
     `uid: prometheus` and uses `${GF_DATASOURCE_PROMETHEUS_URL}`, so the
     dashboard JSON can refer to `prometheus` directly. If you create the
     data source manually, give it the UID or name **Prometheus**.
   * Import the dashboard located at
     `monitoring/grafana/dashboards/rate-limiter-overview.json`.
     If you previously imported it and saw a blank panel or "New panel",
     delete the old copy and re-import after updating the JSON.
   * Enable embedding by setting **Configuration → Preferences** (or
     add the following to `custom.ini`):
     ```ini
     [security]
     allow_embedding = true
     content_security_policy = false

     [auth.anonymous]
     enabled = true
     org_role = Viewer
     ```
   * **Troubleshooting:**
     - If panels say **No data**, make sure Prometheus is scraping your app
       (see step 2) and that you've generated some load. Visit
       `http://localhost:8080/actuator/prometheus` in a browser – you should
       see metrics such as `ratelimiter_requests_total`.
     - Refresh or re-import the dashboard after generating metrics.


4. **Frontend**
   * Install dependencies and start the development server:
     ```powershell
     cd distributed-rate-limiter-ui
     npm install
     npm run dev
     ```
   * Make sure `.env` contains a valid `VITE_GRAFANA_DASHBOARD_URL` (defaults
     to the local Grafana dashboard).

5. **Usage**
   Open `http://localhost:5173` and log in as the admin user. Navigate to
   **Analytics** to see the embedded Grafana dashboard.

## Docker (optional)

A `docker-compose.yml` under `monitoring/` can start Prometheus & Grafana in
containers. The configuration files above are compatible with both modes.

---

For details on the API and testing, see the Postman collection in
`documents/postman`.

