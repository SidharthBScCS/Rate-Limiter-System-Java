import "./LandingPage.css";
import { Link } from "react-router-dom";
import { Github, LogIn, Zap, Shield, Activity, Users, Code, Star } from "lucide-react";

function LandingPage() {
  return (
    <div className="landing-page">
      <div className="grid-pattern"></div>
      
      <header className="landing-header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <Zap size={28} />
          </div>
          <div className="brand-text">
            <p className="brand-title">RateLimiter Pro</p>
            <p className="brand-subtitle">Enterprise Grade | Distributed System</p>
          </div>
        </div>
        
        <div className="header-actions">
          <a
            className="github-button"
            href="https://github.com/SidharthBScCS/Front-End-MP2"
            target="_blank"
            rel="noreferrer"
            aria-label="Open GitHub repository"
          >
            <Github size={18} />
            GitHub
          </a>
          <Link className="login-button" to="/login" aria-label="Go to login page">
            <LogIn size={18} />
            Dashboard Login
          </Link>
        </div>
      </header>

      <main className="landing-hero">
        <div className="hero-text">
          <span className="eyebrow">Spring Loaded | Real-Time</span>
          <h1 className="hero-title">
            <span className="hero-highlight">Intelligent</span>
            <span className="hero-small"> Rate Limiting for </span>
            <span className="hero-highlight">Modern APIs</span>
            <span className="hero-small">
              <br />Protect your infrastructure with precision analytics
            </span>
          </h1>
          <p className="hero-subtext">
            A distributed rate-limiting system that prevents API abuse, balances load across
            nodes, and provides clear visibility into traffic patterns with an intuitive
            dashboard. Built for scale, designed for simplicity.
          </p>
          
          <div className="meta">
            <span><Zap size={14} style={{ marginRight: '6px', color: '#facc15' }} /> Sub-millisecond latency</span>
            <span><Shield size={14} style={{ marginRight: '6px', color: '#22c55e' }} /> Distributed consistency</span>
            <span><Activity size={14} style={{ marginRight: '6px', color: '#facc15' }} /> Real-time analytics</span>
          </div>
        </div>

        <div className="hero-panel">
          <div className="panel-grid">
            <div className="panel-card accent">
              <h4 className="panel-title">
                <Zap size={20} />
                Token Bucket
              </h4>
              <p className="panel-copy">Smooth traffic shaping with configurable burst handling for optimal performance</p>
            </div>
            <div className="panel-card">
              <h4 className="panel-title">
                <Activity size={20} />
                Sliding Window
              </h4>
              <p className="panel-copy">Precise time-based rate limiting with millisecond accuracy and zero drift</p>
            </div>
            <div className="panel-card">
              <h4 className="panel-title">
                <Code size={20} />
                Fixed Window
              </h4>
              <p className="panel-copy">Simple and efficient counter-based limiting at massive scale</p>
            </div>
            <div className="panel-card">
              <h4 className="panel-title">
                <Users size={20} />
                Redis Backed
              </h4>
              <p className="panel-copy">Distributed consistency across unlimited nodes with failover support</p>
            </div>
          </div>
        </div>
      </main>

      <section className="overview-section">
        <div className="overview-card">
          <h2>Project Overview</h2>
          <p>
            The Distributed Rate Limiter System is a production-ready solution designed for
            high-traffic applications. Built with enterprise-grade architecture, it protects
            APIs, ensures fair usage, prevents cascading failures, and gives organizations strong
            control over incoming traffic patterns.
          </p>
          <p>
            With clean service boundaries, distributed consistency via Redis, and an intuitive
            dashboard, it integrates seamlessly into modern backend infrastructure while
            providing real-time visibility into all traffic decisions.
          </p>
        </div>
        
        <div className="overview-card">
          <h3>Key Features</h3>
          <ul className="overview-list">
            <li><strong>Lightning Fast:</strong> Sub-millisecond decision making with optimized algorithms</li>
            <li><strong>Multi-Strategy:</strong> Token Bucket, Sliding Window, Fixed Window with dynamic switching</li>
            <li><strong>Real-time Dashboard:</strong> Live traffic visualization with detailed analytics</li>
            <li><strong>Distributed:</strong> Redis-backed consistency across all nodes</li>
            <li><strong>Developer First:</strong> Simple REST API with comprehensive documentation</li>
            <li><strong>Enterprise Ready:</strong> Role-based access control and audit logging</li>
          </ul>
        </div>
      </section>

      <section className="overview-section">
        <div className="overview-card">
          <h2>Tech Stack</h2>
          <ul className="overview-list">
            <li><strong>Backend:</strong> Java + Spring Boot </li>
            <li><strong>Frontend:</strong> React + BootStrap</li>
            <li><strong>Data Store:</strong> Redis for distributed rate limiting</li>
            <li><strong>Database:</strong> PostgreSQL for configuration and user data</li>
            <li><strong>Testing:</strong> Postman for API testing</li>
            <li><strong>Monitoring:</strong> Prometheus + Grafana integration ready</li>
          </ul>
        </div>
        
        <div className="overview-card">
          <h2>Performance</h2>
          <ul className="overview-list">
            <li><strong>Low Latency:</strong> 1ms decision path for each request</li>
            <li><strong>High Throughput:</strong> Handles 100K+ requests per second</li>
            <li><strong>Availability:</strong> 99.99% uptime with no single point of failure</li>
            <li><strong>Scalability:</strong> Horizontal scaling with Redis cluster</li>
            <li><strong>Consistency:</strong> Strong consistency across all nodes</li>
          </ul>
        </div>
      </section>

      <div className="divider"></div>

      <section className="student-section">
        <h2>Meet the Engineering Team</h2>
        <div className="student-grid">
          <article className="student-card">
            <Star size={24} style={{ color: '#facc15', marginBottom: '16px' }} />
            <p className="student-name">Sidharth</p>
            <p className="student-meta">Lead Backend Architect</p>
            <p className="student-meta">2401720003 | BSc CS</p>
            <p className="student-meta">Java | Spring | Redis</p>
          </article>
          
          <article className="student-card">
            <Star size={24} style={{ color: '#22c55e', marginBottom: '16px' }} />
            <p className="student-name">Ankit Kumar Yadav</p>
            <p className="student-meta">Lead Frontend Developer</p>
            <p className="student-meta">2401720012 | BSc CS</p>
            <p className="student-meta">React | UI/UX</p>
          </article>
          
          <article className="student-card">
            <Star size={24} style={{ color: '#facc15', marginBottom: '16px' }} />
            <p className="student-name">Diwakar</p>
            <p className="student-meta">Data Analyst</p>
            <p className="student-meta">2401720013 | BSc CS</p>
            <p className="student-meta">Analytics</p>
          </article>
          
          <article className="student-card">
            <Star size={24} style={{ color: '#22c55e', marginBottom: '16px' }} />
            <p className="student-name">Palak Kashyap</p>
            <p className="student-meta">Data Analyst</p>
            <p className="student-meta">2401840007 | BSc DS</p>
            <p className="student-meta">Analytics</p>
          </article>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
