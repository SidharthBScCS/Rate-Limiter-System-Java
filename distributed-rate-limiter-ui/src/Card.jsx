import { Row, Col } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity, ShieldCheck, Shield, Zap } from "lucide-react";
import './Cards.css';

function Card({ refreshTick }) {
  const [stats, setStats] = useState({
    totalRequests: 0,
    allowedRequests: 0,
    blockedRequests: 0,
  });
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetch("/api/stats")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setStats({
            totalRequests: data.totalRequests ?? 0,
            allowedRequests: data.allowedRequests ?? 0,
            blockedRequests: data.blockedRequests ?? 0,
          });
          setLoadError("");
        }
      })
      .catch((err) => {
        if (isMounted) {
          setLoadError("Unable to load request stats.");
          console.error("LOAD STATS ERROR:", err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [refreshTick]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  

  const getPercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return (value / total * 100).toFixed(1);
  };

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
              
              <div className="stat-card-footer">
                <span className="stat-description">
                  Success rate
                </span>
                <div className="stat-badge badge-allowed">
                  {getPercentage(stats.allowedRequests, stats.totalRequests)}%
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
              
              <div className="stat-card-footer">
                <span className="stat-description">
                  Block rate
                </span>
                <div className="stat-badge badge-blocked">
                  {getPercentage(stats.blockedRequests, stats.totalRequests)}%
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