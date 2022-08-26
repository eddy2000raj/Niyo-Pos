import React from 'react';
import Modal from '../../layouts/Modal';

const CollectionModal = () => {
  return (
    <Modal>
      <h2 className="md bold">How do we calculate Sales Collection?</h2>
      <p className="sm mt-md">
        Sales Collection Amount = Sales via POS - Commissions - Loyalty Points -
        Direct payments to 1K - Sales collection amount paid to 1K
      </p>
    </Modal>
  );
};

export default CollectionModal;
