import { Row, Col } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect, useState } from "react";

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

  return (
    <div className="mt-4">
      {loadError ? (
        <div className="text-danger mb-2">{loadError}</div>
      ) : null}
      <Row className="justify-content-center g-4">
        <Col md={4}>
          <div className="stat-card total">
            <i className="bi bi-activity fs-2"></i>
            <h6>Total_Requests</h6>
            <h2>{stats.totalRequests}</h2>
          </div>
        </Col>

        <Col md={4}>
          <div className="stat-card allowed">
            <i className="bi bi-shield-check fs-2"></i>
            <h6>Allowed_Requests</h6>
            <h2>{stats.allowedRequests}</h2>
          </div>
        </Col>

        <Col md={4}>
          <div className="stat-card blocked">
            <i className="bi bi-shield-lock-fill fs-2"></i>
            <h6>Blocked_Requests</h6>
            <h2>{stats.blockedRequests}</h2>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default Card;
