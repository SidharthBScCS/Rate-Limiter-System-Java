import http from "k6/http";
import { check, sleep } from "k6";

const BASE = __ENV.BASE_URL || "http://localhost:8080";
const USERNAME = __ENV.AUTH_USER || "admin";
const PASSWORD = __ENV.AUTH_PASS || "admin";

// Comma-separated via env: API_KEYS=key1,key2,...,key10
const apiKeysEnv = __ENV.API_KEYS || "";
const API_KEYS = apiKeysEnv
  .split(",")
  .map((v) => v.trim())
  .filter((v) => v.length > 0);

if (API_KEYS.length === 0) {
  throw new Error("Set API_KEYS env var with real keys, e.g. API_KEYS=key1,key2,...");
}

export const options = {
  vus: 10,
  duration: "30s",
};

export default function () {
  const loginRes = http.post(
    `${BASE}/api/auth/login`,
    JSON.stringify({ username: USERNAME, password: PASSWORD }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(loginRes, { "login ok": (r) => r.status === 200 });

  const apiKey = API_KEYS[(__VU - 1) % API_KEYS.length];
  const body = JSON.stringify({ apiKey, route: "/api/test" });

  const res = http.post(`${BASE}/api/limit/check`, body, {
    headers: { "Content-Type": "application/json" },
  });

  check(res, {
    "200 or 429": (r) => r.status === 200 || r.status === 429,
  });

  sleep(0.2);
}