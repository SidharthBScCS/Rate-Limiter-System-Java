import { Modal, Button, Form,Toast,ToastContainer} from 'react-bootstrap';
import { useState } from 'react';

function APIModal({ show, handleClose }) {
    const [showToast, setShowToast] = useState(false);

    const handleCreate = () => {
        setShowToast(true);
        handleClose();
    }
    return (
        <>
            <Modal show={show} onHide={handleClose} size="lg">

                <Modal.Header>
                    <Modal.Title>Create API Keys</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>

                        <Form.Group className='mb-4'>
                            <Form.Label>Owner Name</Form.Label>
                            <Form.Control type="text" placeholder="Eg:Google"></Form.Control>
                        </Form.Group>

                        <Form.Group className='mb-4'>
                            <Form.Label>Rate Limit</Form.Label>
                            <Form.Control type="text" placeholder="Eg:100 req/min"></Form.Control>
                        </Form.Group>

                        <Form.Group className='mb-4'>
                            <Form.Label>Window Time</Form.Label>
                            <Form.Control type="text" placeholder='Eg:10 Min'></Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={handleClose} variant='danger'>CLOSE</Button>
                    <Button onClick={handleCreate} variant='success'>CREATE</Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer position="top-center" className='mt-3'>
                <Toast show={showToast} autohide delay={2500} onClose={() => setShowToast(false)} bg='dark'>
                    <Toast.Body className='d-flex align-items-center toast-body-custom'>API Key Created Successfully</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
}

export default APIModal;