import "./LoginPage.css";
import { LogIn, AlertCircle, Shield, ArrowLeft, User, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiUrl } from "./apiBase";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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
      <Link className="login-back" to="/">
        <ArrowLeft size={14} />
        <span>Back</span>
      </Link>

      <div className="login-card">
        {/* Left side - Login Form */}
        <div className="login-left">
          <div className="login-header">
            <h1>Welcome back</h1>
            <p>Enter your credentials to access the rate limiting dashboard</p>
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>USERNAME</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label>PASSWORD</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button className="login-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner">⌛</span>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right side - Brand/Feature Section */}
        <div className="login-right">
          <div className="brand-header">
            <h2>Rate Limiting Dashboard</h2>
            <p>Monitor, analyze, and manage your API traffic with enterprise-grade rate limiting</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <Shield />
            </div>
            <span>Advanced rate limiting & throttling</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;