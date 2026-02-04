import "./LoginPage.css";
import { Lock, Fingerprint } from "lucide-react";
import { useMemo, useState } from "react";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timestamp = useMemo(() => {
    return new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Login failed");
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Invalid credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-background">
        <div className="matrix-grid" />
        <div className="scan-line" />
        <div className="glow-orb" />
      </div>

      <div className="login-card">
        <div className="login-badge">SECURE ACCESS</div>
        <h1>RateLimit Control</h1>
        <p>Authorization required. Proceed with credentials.</p>

        <form className="login-fields" onSubmit={handleSubmit}>
          <label>
            <span>Operator ID</span>
            <input
              type="text"
              placeholder="id"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            <span>Passphrase</span>
            <input
              type="password"
              placeholder="......"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <div className="login-error">{error}</div> : null}
          <button className="login-btn" type="submit" disabled={isSubmitting}>
            <Lock size={16} />
            {isSubmitting ? "Authenticating..." : "Initialize Session"}
          </button>
        </form>

        <div className="login-footer">
          <span className="login-timestamp">IST {timestamp}</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
