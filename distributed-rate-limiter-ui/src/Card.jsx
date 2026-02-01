import { Row, Col } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';

function Card() {
  return (
    <Row className="g-4 mt-4">

      <Col md={4}>
        <Card>
          <Card.Body>
            <div>
              <i className="bi bi-activity"></i>
            </div>
            <div>
              <small>TOTAL REQUESTS</small>
              <h3>12,430</h3>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4}>
        <Card>
          <Card.Body>
            <div>
              <i className="bi bi-shield-check"></i>
            </div>
            <div>
              <small>ALLOWED REQUESTS</small>
              <h3>11,245</h3>
            </div>
          </Card.Body>
        </Card>
      </Col>


    </Row>
  );
}

export default Card;
