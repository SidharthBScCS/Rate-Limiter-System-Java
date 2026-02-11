import { useState } from "react";
import "./LandingPage.css";

function LandingPage({
  onLogin = () => Promise.resolve(),
  onRegister = () => Promise.resolve(),
  onGuest = () => {},
}) {
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

  const handleGuest = () => {
    setError("");
    onGuest();
  };

  return (
    <section className="landing">
      <div className="landing__overlay" />
      <div className="landing__card">
        <h1 className="landing__logo">NETFLIX</h1>
        <p className="landing__title">Welcome Back</p>
        <p className="landing__subtitle">
          Sign in to continue or explore the app as a guest.
        </p>

        <form className="landing__form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
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
            onClick={handleRegister}
            disabled={isSubmitting}
          >
            Create Account
          </button>
        </form>

        <button
          type="button"
          className="landing__button landing__button--secondary"
          onClick={handleGuest}
          disabled={isSubmitting}
        >
          Continue as Guest
        </button>
      </div>
    </section>
  );
}

export default LandingPage;
