import { Row, Col } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect, useState } from "react";
import { Activity, ShieldCheck, Shield, Zap } from "lucide-react";
import './Cards.css';
import { apiUrl } from "./apiBase";

function Card({ refreshTick }) {
  const [stats, setStats] = useState({
    totalRequests: 0,
    allowedRequests: 0,
    blockedRequests: 0,
    allowedPercent: 0,
    blockedPercent: 0
  });
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetch(apiUrl("/api/view/dashboard"), { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          const next = data.stats ?? {};
          setStats({
            totalRequests: next.totalRequests ?? 0,
            allowedRequests: next.allowedRequests ?? 0,
            blockedRequests: next.blockedRequests ?? 0,
            allowedPercent: next.allowedPercent ?? 0,
            blockedPercent: next.blockedPercent ?? 0
          });
          setLoadError("");
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadError("Unable to load request stats.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [refreshTick]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  // calculate display percentages for progress bars
  const allowedPct = Math.min(100, Math.max(0, stats.allowedPercent));
  const blockedPct = Math.min(100, Math.max(0, stats.blockedPercent));

  return (
    <div className="stat-cards-container">
      {loadError ? (
        <div className="stat-alert" role="alert">
          <i className="bi bi-exclamation-triangle"></i>
          {loadError}
        </div>
      ) : null}
      
      <Row className="g-4">

        <Col md={4}>
          <div className="stat-card stat-card-total">
            <div className="stat-card-header">
              <div className="stat-icon-container">
                <Activity className="stat-icon" />
              </div>
              
              
            </div>
            
            <div>
              <h6 className="stat-card-title">
                Total Requests
              </h6>
              <h2 className="stat-card-value">
                {formatNumber(stats.totalRequests)}
              </h2>
              
              <div className="stat-card-footer">
                <span className="stat-description">
                  All traffic processed
                </span>
                <div className="stat-badge badge-total">
                  <Zap size={12} className="me-1" />
                  Live
                </div>
              </div>
            </div>
          </div>
        </Col>

        
        <Col md={4}>
          <div className="stat-card stat-card-allowed">
            <div className="stat-card-header">
              <div className="stat-icon-container">
                <ShieldCheck className="stat-icon" />
              </div>
            </div>
            
            <div>
              <h6 className="stat-card-title">
                Allowed Requests
              </h6>
              <h2 className="stat-card-value">
                {formatNumber(stats.allowedRequests)}
              </h2>
              {/* progress bar for allowed % */}
              <div className="progress-wrapper">
                <div className="progress-bar allowed" style={{ width: `${allowedPct}%` }} />
              </div>
              <div className="stat-card-footer">
                <span className="stat-description">
                  Success rate
                </span>
                <div className="stat-badge badge-allowed">
                  {Number(stats.allowedPercent).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </Col>

        
        <Col md={4}>
          <div className="stat-card stat-card-blocked">
            <div className="stat-card-header">
              <div className="stat-icon-container">
                <Shield className="stat-icon" />
              </div>
            </div>
            
            <div>
              <h6 className="stat-card-title">
                Blocked Requests
              </h6>
              <h2 className="stat-card-value">
                {formatNumber(stats.blockedRequests)}
              </h2>
              {/* progress bar for blocked % */}
              <div className="progress-wrapper">
                <div className="progress-bar blocked" style={{ width: `${blockedPct}%` }} />
              </div>
              <div className="stat-card-footer">
                <span className="stat-description">
                  Block rate
                </span>
                <div className="stat-badge badge-blocked">
                  {Number(stats.blockedPercent).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default Card;
