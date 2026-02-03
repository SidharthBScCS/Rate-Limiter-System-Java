import { Button, Badge } from "react-bootstrap";
import { useState } from "react";
import APIModal from "./APIModal";
import { Activity, Shield } from "lucide-react";

function Heading({ onCreated }) {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <nav className="navbar navbar-dark glass-navbar">
        <div className="container-fluid mt-3 px-4">
          <div className="d-flex flex-column">
            <div className="d-flex align-items-center gap-3">
              <div className="header-icon-wrapper">
                <Activity size={24} className="text-primary" />
              </div>
              <div>
                <h4 className="text-white mb-0 fw-bold">Distributed Rate Limiter</h4>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <Badge bg="secondary" className="fw-normal d-flex align-items-center gap-1">
                    <Shield size={12} />
                    Token Bucket Algorithm
                  </Badge>
                  <Badge bg="info" className="fw-normal">
                    Limit: 10 req/min
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            variant="primary" 
            className="d-flex align-items-center gap-2 fw-semibold px-4 py-2"
            onClick={() => setShowModal(true)}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            Create API Key
          </Button>
        </div>
      </nav>
      
      <APIModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        onCreated={onCreated}
      />
    </>
  );
}

export default Heading;