# Rate-Limiter-System

## Project Structure

```text
Rate-Limiter-System/
+-- distributed-rate-limiter-backend/
+-- distributed-rate-limiter-ui/
+-- documents/
¦   +-- ppt/
¦   +-- report/
+-- README.md
```

## Run Locally

### Backend

```powershell
cd distributed-rate-limiter-backend
.\mvnw.cmd spring-boot:run
```

### UI

```powershell
cd distributed-rate-limiter-ui
npm install
npm run dev
```

UI default: `http://localhost:5173`
Backend default: `http://localhost:8080`
