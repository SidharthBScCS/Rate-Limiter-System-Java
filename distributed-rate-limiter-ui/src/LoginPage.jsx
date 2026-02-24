import "./LoginPage.css";
import { LogIn, Shield, Key, AlertCircle, Sparkles, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "./apiBase";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const timestamp = useMemo(() => {
    return new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 12000);
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify({ username, password }),
      });
      window.clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const payload = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const message =
          (typeof payload === "string" && payload) ||
          (payload && payload.message) ||
          "Login failed";
        throw new Error(message);
      }

      if (payload && typeof payload === "object") {
        localStorage.setItem("adminUser", JSON.stringify(payload));
      } else {
        localStorage.removeItem("adminUser");
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err && err.name === "AbortError"
          ? "Login request timed out. Please try again."
          : err instanceof Error && err.message
          ? err.message
          : "Login failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="grid-pattern"></div>
      <div className="login-background">
        <div className="matrix-grid" />
        <div className="scan-line" />
        <div className="glow-orb" />
        <div className="glow-orb-2" />
      </div>

      <Link className="login-back" to="/" aria-label="Back to landing page">
        <span>Back to home</span>
      </Link>

      <div className="login-card">
        <div className="shine"></div>

        <div className="login-badge">
          <Shield size={16} />
          <Zap size={16} />
          SECURE ACCESS PORTAL
        </div>

        <h1>Welcome Back</h1>
        <p>Enter your credentials to access the rate limiting dashboard and manage your API traffic</p>

        <form className="login-fields" onSubmit={handleSubmit}>
          <label>
            <span>Username / Operator ID</span>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label>
            <span>Password / Passphrase</span>
            <input
              type="password"
              placeholder="************"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <div className="login-error">
              <AlertCircle size={22} />
              <span>{error}</span>
            </div>
          )}

          <button className="login-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner">...</span>
                Authenticating...
              </>
            ) : (
              <>
                <LogIn size={22} />
                Sign In to Dashboard
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <span className="login-chip">
            <Key size={16} />
            Protected Area | Admin Only
          </span>
          <span className="login-timestamp">
            <Sparkles size={14} style={{ marginRight: "6px" }} />
            IST {timestamp}
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
