import { useEffect, useState } from "react";
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { apiUrl } from "./apiBase";
import "./Cards.css";

function StatsCards({ refreshTick }) {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [refreshTick]);

  const fetchStats = async () => {
    try {
      const res = await fetch(apiUrl("/api/view/dashboard"), { credentials: "include" });
      const data = await res.json();
      setStats(data.stats);
    } catch {
      // Keep previous stats on fetch failures.
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Total Requests",
      value: stats.totalRequests,
      icon: Activity,
      change: `${stats.totalPercent}%`,
      trend: "up",
      color: "#8B949E",
      bgColor: "rgba(139, 148, 158, 0.16)"
    },
    {
      title: "Allowed Requests",
      value: stats.allowedRequests,
      icon: CheckCircle,
      change: `${stats.allowedPercent}%`,
      trend: "up",
      color: "#3FB950",
      bgColor: "rgba(63, 185, 80, 0.14)"
    },
    {
      title: "Blocked Requests",
      value: stats.blockedRequests,
      icon: XCircle,
      change: `${stats.blockedPercent}%`,
      trend: "down",
      color: "#F85149",
      bgColor: "rgba(248, 81, 73, 0.14)"
    }
  ];

  if (loading) {
    return <div className="cards-skeleton" />;
  }

  return (
    <div className="stats-grid">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const rawValue = card.value ?? "-";
        const formattedValue = rawValue === "-" ? rawValue : new Intl.NumberFormat().format(rawValue);

        return (
          <div 
            key={index} 
            className="stat-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="card-header">
              <div className="card-icon-wrapper" style={{ background: card.bgColor }}>
                <Icon size={22} color={card.color} />
              </div>
            </div>

            <div className="card-body">
              <h3 className="card-title">{card.title}</h3>
              <p className="card-value">{formattedValue}</p>
            </div>

            <div className="card-footer">
              <div className={`trend-badge ${card.trend}`}>
                {card.trend === "up" ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                <span>{card.change}</span>
              </div>
            </div>

            <div className="card-glow" style={{ background: card.color }} />
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;
