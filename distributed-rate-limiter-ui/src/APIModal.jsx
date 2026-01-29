import { Modal, Button, Form, Toast, ToastContainer } from "react-bootstrap";
import { useState } from "react";

function APIModal({ show, handleClose }) {

  const [ownerName, setOwnerName] = useState("");
  const [rateLimit, setRateLimit] = useState("");
  const [windowSeconds, setWindowSeconds] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleCreate = () => {

    const data = {
      ownerName: ownerName,
      rateLimit: Number(rateLimit),
      windowSeconds: Number(windowSeconds)
    };

    fetch("http://localhost:8080/api/create-key", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(() => {
        setShowToast(true);
        handleClose();
        setOwnerName("");
        setRateLimit("");
        setWindowSeconds("");
      })
      .catch(() => {
        alert("Error!!!");
      });
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header>
          <Modal.Title>Create API Key</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>

            <Form.Group className="mb-3">
              <Form.Label>Owner Name</Form.Label>
              <Form.Control type="text" placeholder="Eg: Google" value={ownerName} onChange={(e) => setOwnerName(e.target.value)}/>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rate Limit</Form.Label>
              <Form.Control type="number" placeholder="Eg: 100" value={rateLimit} onChange={(e) => setRateLimit(e.target.value)}/>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Window Time (seconds)</Form.Label>
              <Form.Control type="number" placeholder="Eg: 60" value={windowSeconds} onChange={(e) => setWindowSeconds(e.target.value)}/>
            </Form.Group>

          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>CLOSE</Button>
          <Button variant="success" onClick={handleCreate}>CREATE</Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-center" className="mt-3">
        <Toast bg="dark" show={showToast} onClose={() => setShowToast(false)}>
          <Toast.Body className="text-white text-center">API Key Created Successfully</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default APIModal;
