import { Row, Col } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';

function Card() {
  return (
    <div className="mt-4">
      <Row className="justify-content-center g-4">
        <Col md={4}>
          <div className="stat-card total">
            <i className="bi bi-activity fs-2"></i>
            <h6>Total_Requests</h6>
            <h2>12,430</h2>
          </div>
        </Col>

        <Col md={4}>
          <div className="stat-card allowed">
            <i className="bi bi-shield-check fs-2"></i>
            <h6>Allowed_Requests</h6>
            <h2>11,980</h2>
          </div>
        </Col>

        <Col md={4}>
          <div className="stat-card blocked">
            <i className="bi bi-shield-lock-fill fs-2"></i>
            <h6>Blocked_Requests</h6>
            <h2>450</h2>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default Card;
