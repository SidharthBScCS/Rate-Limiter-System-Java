import { useState } from "react";
import "./LandingPage.css";

function LandingPage({
  onLogin = () => Promise.resolve(),
  onRegister = () => Promise.resolve(),
}) {
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ensureValidForm = () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return false;
    }
    return true;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!ensureValidForm()) return;

    setError("");
    setIsSubmitting(true);
    try {
      await onLogin({
        email: email.trim(),
        password,
      });
    } catch (submitError) {
      setError(submitError.message || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Name, email and password are required.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onRegister({
        fullName: name.trim(),
        email: email.trim(),
        password,
      });
    } catch (submitError) {
      setError(submitError.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateClick = async () => {
    if (!isCreateMode) {
      setError("");
      setIsCreateMode(true);
      return;
    }
    await handleRegister();
  };

  const handleBackToLogin = () => {
    setError("");
    setIsCreateMode(false);
    setName("");
  };

  return (
    <section className="landing">
      <div className="landing__overlay" />
      <div className="landing__card">
        <h1 className="landing__logo">NETFLIX</h1>
        <p className="landing__title">{isCreateMode ? "Create Account" : "Welcome Back"}</p>
        <p className="landing__subtitle">
          {isCreateMode
            ? "Enter your name to create your account."
            : "Sign in with your email and password."}
        </p>

        <form className="landing__form" onSubmit={handleLogin}>
          {isCreateMode ? (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          ) : null}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? <p className="landing__error">{error}</p> : null}
          <button
            type="submit"
            className="landing__button landing__button--primary"
            disabled={isSubmitting}
          >
            Sign In
          </button>
          <button
            type="button"
            className="landing__button landing__button--tertiary"
            onClick={handleCreateClick}
            disabled={isSubmitting}
          >
            {isCreateMode ? "Create Account" : "Create New Account"}
          </button>
          {isCreateMode ? (
            <button
              type="button"
              className="landing__button landing__button--secondary"
              onClick={handleBackToLogin}
              disabled={isSubmitting}
            >
              Back to Login
            </button>
          ) : null}
        </form>
      </div>
    </section>
  );
}

export default LandingPage;
