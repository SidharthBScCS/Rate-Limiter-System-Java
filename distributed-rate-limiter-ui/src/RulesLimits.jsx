import "./RulesLimits.css";
import "./Table_Box.css";
import {
  Shield,
  Sliders,
  Clock,
  Zap,
  Plus,
  Filter,
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
    </div>
  );
}

export default RulesLimits;
