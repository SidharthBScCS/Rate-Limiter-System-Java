import { Button } from "react-bootstrap";
import { useState } from "react";
import APIModal from "./APIModal";

function Navigator() {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <nav className="navbar navbar-dark">
        <div className="container-fluid mt-4">
          <div className="text-start">
            <h5 className="text-white">Distributed Rate Limiter System</h5>
            <small className="text-secondary">Token Bucket | Limit: 100 req/min</small>
          </div>
          <Button onClick={() => setShowModal(true)}> + Create API Key </Button>
        </div>
      </nav>
      <APIModal show={showModal} handleClose={() => setShowModal(false)}/>
    </>
  );
}

export default Navigator;
