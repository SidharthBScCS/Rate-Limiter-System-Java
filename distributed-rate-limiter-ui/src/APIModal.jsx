import { Modal, Button, Form, Toast, ToastContainer } from "react-bootstrap";
import { useState } from "react";
import { Key, User, Clock, Hash, Zap } from "lucide-react";

function APIModal({ show, handleClose, onCreated }) {
  const [userName, setUserName] = useState("");
  const [rateLimit, setRateLimit] = useState("10");
  const [windowSeconds, setWindowSeconds] = useState("60");
  const [showToast, setShowToast] = useState(false);
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = () => {
    setFormError("");
    setIsLoading(true);
    
    const data = {
      userName: userName.trim(),
      rateLimit: Number(rateLimit),
      windowSeconds: Number(windowSeconds),
    };

    fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })
      .then(async (res) => {
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          const message = payload.message || "Failed to create API key.";
          throw new Error(message);
        }
        return payload;
      })
      .then(() => {
        setShowToast(true);
        if (onCreated) {
          onCreated();
        }
        handleClose();
        setUserName("");
        setRateLimit("10");
        setWindowSeconds("60");
        setFormError("");
      })
      .catch((err) => {
        console.error("FRONTEND ERROR:", err);
        setFormError(err?.message || "Failed to create API key. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <Modal 
        show={show} 
        onHide={handleClose} 
        centered
        size="lg"
      >
        <Modal.Header 
          closeButton 
          className="border-0"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '1.5rem'
          }}
        >
          <Modal.Title className="w-100">
            <div className="d-flex align-items-center gap-3">
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <Key size={24} />
              </div>
              <div>
                <h4 className="mb-1 fw-bold">Create API Key</h4>
                <p className="mb-0 opacity-90">Configure rate limiting for your application</p>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body 
          className="p-0"
          style={{ background: '#0f172a' }}
        >
          <div style={{ padding: '1.5rem' }}>
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={20} className="text-success" />
                </div>
                <div>
                  <h6 className="mb-0 text-white">User Information</h6>
                </div>
              </div>
              
              <Form.Group>
                <Form.Control 
                  type="text" 
                  placeholder="Enter company or user name..." 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)}
                  style={{ 
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px'
                  }}
                />
              </Form.Group>
            </div>

            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(102, 126, 234, 0.1)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Zap size={20} className="text-primary" />
                </div>
                <div>
                  <h6 className="mb-0 text-white">Rate Limit Settings</h6>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    borderRadius: '10px',
                    padding: '1rem'
                  }}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Hash size={16} className="text-primary" />
                      <label className="text-white fw-medium mb-0">Rate Limit</label>
                    </div>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="number"
                        min={1}
                        max={10}
                        value={rateLimit}
                        onChange={(e) => setRateLimit(e.target.value)}
                        className="border-0 bg-transparent text-white p-0"
                        style={{ fontSize: '1.25rem', fontWeight: 'bold', width: '60px' }}
                      />
                      <span className="ms-2">requests</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '10px',
                    padding: '1rem'
                  }}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Clock size={16} className="text-warning" />
                      <label className="text-white fw-medium mb-0">Time Window</label>
                    </div>
                    <div className="d-flex align-items-center">
                      <Form.Control 
                        type="number" 
                        min={1}
                        value={windowSeconds} 
                        onChange={(e) => setWindowSeconds(e.target.value)}
                        className="border-0 bg-transparent text-white p-0"
                        style={{ fontSize: '1.25rem', fontWeight: 'bold', width: '60px' }}
                      />
                      <span className="ms-2">seconds</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {formError && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-3 border-0" style={{ 
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px'
              }}>
                <div className="d-flex align-items-center gap-3">
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                    </svg>
                  </div>
                  <div>
                    <h6 className="mb-0 text-danger">Error</h6>
                    <p className="mb-0 text-danger">{formError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer 
          className="border-0"
          style={{ 
            background: 'rgba(30, 41, 59, 0.9)',
            padding: '1.5rem'
          }}
        >
          <div className="d-flex justify-content-between w-100 align-items-center">
            <Button 
              variant="outline-light" 
              onClick={handleClose}
              className="px-4"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px'
              }}
            >
              Cancel
            </Button>
            
            <Button 
              variant="primary" 
              onClick={handleCreate}
              disabled={isLoading}
              className="px-4 d-flex align-items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.625rem 1.5rem',
                fontWeight: '600'
              }}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  Creating...
                </>
              ) : (
                <>
                  <Key size={18} />
                  Create API Key
                </>
              )}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-center" className="mt-4">
        <Toast 
          bg="success" 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={3000} 
          autohide
          className="border-0 shadow-lg"
          style={{ borderRadius: '10px', overflow: 'hidden' }}
        >
          <Toast.Body 
            className="text-white p-3 d-flex align-items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
              </svg>
            </div>
            <div>
              <h6 className="mb-0">Success!</h6>
              <small className="opacity-90">API key created successfully</small>
            </div>
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default APIModal;
