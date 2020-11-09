import React, { Component } from 'react';
import { Modal, ModalBody, ModalFooter } from 'react-bootstrap';
import './ModalWindow.scss';

type OwnProps = {
  isModalOpen: boolean;
  onClose: () => void;
  className: string;
  heading: string;
  // children: any;
};

class ModalWindow extends Component<OwnProps> {
  render() {
    const { isModalOpen, children, onClose, className, heading } = this.props;

    return (
      <Modal show={isModalOpen} onHide={onClose} className={className}>
        <Modal.Header closeButton>{heading}</Modal.Header>
        <ModalBody>{children}</ModalBody>
        <ModalFooter>here is modal footer</ModalFooter>
      </Modal>
    );
  }
}

export default ModalWindow;
