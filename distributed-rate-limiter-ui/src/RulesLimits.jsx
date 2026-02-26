import "./RulesLimits.css";
import "./Table_Box.css";
import {
  Shield,
  Sliders,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Ban
} from "lucide-react";

const summaryCards = [
  {
    title: "Default Limit",
    value: "10 req/min",
    description: "Applied to new API keys",
    icon: <Sliders size={22} />,
    tone: "primary"
  },
  {
    title: "Default Window",
    value: "60 seconds",
    description: "Rolling window policy",
    icon: <Clock size={22} />,
    tone: "success"
  },
  {
    title: "Burst Capacity",
    value: "8 requests",
    description: "Short burst allowance",
    icon: <Zap size={22} />,
    tone: "warning"
  }
];

const policyPanels = [
  {
    title: "Global Policy",
    subtitle: "Baseline rules for every key",
    icon: <Shield size={18} />,
    rows: [
      { label: "Algorithm", value: "Sliding Window" },
      { label: "Default Limit", value: "10 req/min" },
      { label: "Status", value: "Active", tone: "active" }
    ]
  },
  {
    title: "Abuse Protection",
    subtitle: "High-traffic safety controls",
    icon: <AlertTriangle size={18} />,
    rows: [
      { label: "Warning Threshold", value: "80%" },
      { label: "Block Threshold", value: "100%" },
      { label: "Mode", value: "Warning", tone: "warning" }
    ]
  }
];

const routeRules = [
  {
    name: "Auth Endpoints",
    path: "/api/auth/*",
    limit: "8 req/min",
    window: "60s",
    burst: "5",
    algorithm: "SLIDING_WINDOW",
    status: "Active",
    tone: "active"
  },
  {
    name: "Payments",
    path: "/api/payments/*",
    limit: "6 req/min",
    window: "60s",
    burst: "3",
    algorithm: "TOKEN_BUCKET",
    status: "Warning",
    tone: "warning"
  },
  {
    name: "Admin Ops",
    path: "/api/admin/*",
    limit: "4 req/min",
    window: "120s",
    burst: "2",
    algorithm: "FIXED_WINDOW",
    status: "Blocked",
    tone: "blocked"
  }
];

function RulesLimits() {
  return (
    <div className="rules-page">
      <div className="rules-header">
        <div>
          <h1 className="page-title">Rules & Limits</h1>
          <p className="page-subtitle">Manage global policies and per-route overrides</p>
        </div>
      </div>

      <div className="rules-cards">
        {summaryCards.map((card) => (
          <div key={card.title} className={`rules-card ${card.tone}`}>
            <div className="rules-card-header">
              <div className="rules-card-icon">{card.icon}</div>
              <span className="rules-card-title">{card.title}</span>
            </div>
            <div className="rules-card-value">{card.value}</div>
            <p className="rules-card-description">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="rules-panels">
        {policyPanels.map((panel) => (
          <div key={panel.title} className="rules-panel">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">
                  {panel.icon}
                  <span>{panel.title}</span>
                </h3>
                <p className="panel-subtitle">{panel.subtitle}</p>
              </div>
            </div>
            <div className="panel-body">
              {panel.rows.map((row) => (
                <div className="panel-row" key={`${panel.title}-${row.label}`}>
                  <span className="panel-label">{row.label}</span>
                  {row.tone ? (
                    <span className={`panel-pill ${row.tone}`}>{row.value}</span>
                  ) : (
                    <span className="panel-value">{row.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rules-table-section">
        <span className="rules-summary-pill">
          <CheckCircle2 size={15} />
          {routeRules.length} active route rules
        </span>
        <div className="modern-table-container rules-table-container">
          <div className="table-wrapper rules-table-desktop">
            <table className="modern-table rules-table">
              <thead>
                <tr>
                  <th>Rule</th>
                  <th>Route</th>
                  <th>Limit</th>
                  <th>Window</th>
                  <th>Burst</th>
                  <th>Algorithm</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {routeRules.map((rule) => (
                  <tr key={rule.name}>
                    <td>
                      <div className="rule-name">
                        <span>{rule.name}</span>
                        <small>Priority override enabled</small>
                      </div>
                    </td>
                    <td>
                      <span className="rule-scope">{rule.path}</span>
                    </td>
                    <td className="rule-metric">{rule.limit}</td>
                    <td className="rule-metric">{rule.window}</td>
                    <td className="rule-metric">{rule.burst}</td>
                    <td>
                      <span className="algorithm-pill">{rule.algorithm}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${rule.tone}`}>
                        {rule.tone === "active" && <CheckCircle2 size={14} />}
                        {rule.tone === "warning" && <AlertTriangle size={14} />}
                        {rule.tone === "blocked" && <Ban size={14} />}
                        {rule.status}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="table-action-btn">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rules-mobile-list">
            {routeRules.map((rule) => (
              <div key={`mobile-${rule.name}`} className="rules-mobile-card">
                <div className="rules-mobile-card-top">
                  <div className="rule-name">
                    <span>{rule.name}</span>
                    <small>{rule.path}</small>
                  </div>
                  <span className={`status-pill ${rule.tone}`}>
                    {rule.tone === "active" && <CheckCircle2 size={14} />}
                    {rule.tone === "warning" && <AlertTriangle size={14} />}
                    {rule.tone === "blocked" && <Ban size={14} />}
                    {rule.status}
                  </span>
                </div>
                <div className="rules-mobile-metrics">
                  <span className="rule-metric">{rule.limit}</span>
                  <span className="rule-metric">{rule.window}</span>
                  <span className="rule-metric">Burst {rule.burst}</span>
                </div>
                <div className="rules-mobile-footer">
                  <span className="algorithm-pill">{rule.algorithm}</span>
                  <button type="button" className="table-action-btn">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RulesLimits;
