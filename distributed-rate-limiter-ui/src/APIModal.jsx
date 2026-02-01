import { Modal, Button, Form, Toast, ToastContainer } from "react-bootstrap";
import { useState } from "react";

function APIModal({ show, handleClose }) {

  const [ownerName, setOwnerName] = useState("");
  const [rateLimit, setRateLimit] = useState("");
  const [windowSeconds, setWindowSeconds] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleCreate = () => {
    const data = {
      ownerName,
      rateLimit: Number(rateLimit),
      windowSeconds: Number(windowSeconds),
    };

    fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
  })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      return res.text();
    })
    .then((msg) => {
      console.log("BACKEND RESPONSE:", msg);
      setShowToast(true);
      handleClose();
      setOwnerName("");
      setRateLimit("");
      setWindowSeconds("");
    })
    .catch((err) => {
      console.error("FRONTEND ERROR:", err);
      alert("What is this!!!");
    });
};


  return (
    <>
      <Modal show={show} onHide={handleClose}>

        <Modal.Header closebutton>
          <Modal.Title>Create API Key</Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-4 py-3">

          <Form>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Owner Name</Form.Label>
              <Form.Control type="text" placeholder="e.g. Google" value={ownerName} onChange={(e) => setOwnerName(e.target.value)}></Form.Control>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Rate Limit</Form.Label>
              <Form.Control type="number" placeholder="e.g. 1000" value={rateLimit} onChange={(e) => setRateLimit(e.target.value)}></Form.Control>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Window (seconds)</Form.Label>
              <Form.Control type="number" placeholder="e.g. 60" value={windowSeconds} onChange={(e) => setWindowSeconds(e.target.value)}></Form.Control>
            </Form.Group>

          </Form>

        </Modal.Body>

        <Modal.Footer className="px-4">
          <Button variant="danger" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate}>Create</Button>
        </Modal.Footer>

      </Modal>

      <ToastContainer position="top-center" className="mt-3">
        <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Body className="text-white">API Key created successfully!</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default APIModal;
