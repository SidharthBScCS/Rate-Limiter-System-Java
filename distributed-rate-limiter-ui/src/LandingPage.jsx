import "./LandingPage.css";
import { Link } from "react-router-dom";
function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">RL</div>
          <div>
            <p className="brand-title">Distributed Rate Limiter</p>
            <p className="brand-subtitle">Mini Project 2</p>
          </div>
        </div>
        <Link className="login-button" to="/login" aria-label="Go to login page">
          Login
        </Link>
      </header>

      <main className="landing-hero">
        <div className="hero-text">
          <h1 className="hero-title">
            <span className="hero-highlight">Spring Loaded</span>
            <span className="hero-small"> delivers a </span>
            <span className="hero-highlight">Rate Limiter System</span>
            <span className="hero-small">
              {" "}
              that protects API traffic from overload and keeps performance
              stable.
            </span>
          </h1>
          <p className="hero-subtext">
            The objective of this project is to design and visualize a
            distributed rate-limiting system that prevents abuse, balances load
            across nodes, and delivers real-time visibility into traffic rules
            and analytics.
          </p>
          <div className="hero-actions">
            <div className="meta">
              <span>Low latency decisions</span>
              <span>Centralized policy control</span>
              <span>Actionable analytics</span>
            </div>
          </div>
        </div>
      </main>

      <section className="overview-section">
        <div className="overview-card">
          <h2>Project Overview</h2>
          <p>
            The Distributed Rate Limiter System is a modern solution designed for
            today’s high-traffic applications. It protects APIs, ensures fair usage,
            prevents crashes, and gives organizations complete control over incoming
            traffic.
          </p>
          <p>
            With its clean architecture, distributed consistency, and easy-to-use
            dashboard, it offers a highly practical and industry-ready tool that
            can be integrated into any modern backend.
          </p>
          <p>
            Its workflow is simple, intuitive, and powerful—making it not just a
            project, but a strong demonstration of backend engineering skills.
          </p>
        </div>
        <div className="overview-card">
          <h3>Key Goals</h3>
          <ul className="overview-list">
            <li>Build a fast and reliable rate limiting engine.</li>
            <li>Support strategies like Token Bucket, Sliding Window, and Fixed Window.</li>
            <li>Offer an admin dashboard with real-time monitoring.</li>
            <li>Ensure consistent rate limits across distributed servers.</li>
            <li>Make configuration easy for developers and organizations.</li>
          </ul>
        </div>
      </section>

      <section className="overview-section">
        <div className="overview-card">
          <h2>Tech Stack</h2>
          <ul className="overview-list">
            <li><strong>Backend:</strong> Java with Spring Boot for the rate limiter engine.</li>
            <li><strong>Frontend:</strong> React for the admin dashboard and visualization.</li>
            <li><strong>Data Store:</strong> Redis for fast in-memory storage of rate limit data and MYSQL </li>
            <li><strong>Communication:</strong> REST APIs for interaction between frontend and backend.</li>
          </ul>
        </div>
      </section>

      <section className="student-section">
        <h2>Student Details</h2>
        <div className="student-grid">
          <article className="student-card">
            <p className="student-name">Sidharth</p>
            <p className="student-meta">Roll No: 2401720003</p>
            <p className="student-meta">Course: BSc CS</p>
            <p className="student-meta">Role: Java Developer</p>
          </article>
          <article className="student-card">
            <p className="student-name">Ankit Kumar Yadav</p>
            <p className="student-meta">Roll No: 2401720012</p>
            <p className="student-meta">Course: BSc CS</p>
            <p className="student-meta">Role: React Developer</p>
          </article>
          <article className="student-card">
            <p className="student-name">Diwakar</p>
            <p className="student-meta">Roll No: 2401720013</p>
            <p className="student-meta">Course: BSc CS</p>
            <p className="student-meta">Role: Developer</p>
          </article>
          <article className="student-card">
            <p className="student-name">Palak Kashyap</p>
            <p className="student-meta">Roll No: 2401840007</p>
            <p className="student-meta">Course: BSc Data Science</p>
            <p className="student-meta">Role: Developer</p>
          </article>
          <article className="student-card">
            <p className="student-name">Devasaya Dahiya</p>
            <p className="student-meta">Roll No: 2401720001</p>
            <p className="student-meta">Course: BSc CS</p>
            <p className="student-meta">Role: Project Manager</p>
          </article>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
