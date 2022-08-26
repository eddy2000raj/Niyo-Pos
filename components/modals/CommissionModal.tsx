import React from 'react';
import Modal from '../../layouts/Modal';

const CommissionModal = () => {
  return (
    <Modal>
      <h2 className="md bold">How do we calculate your store Commissions?</h2>
      <p className="sm mt-md">
        Commission is calculated on the product selling price to the customer as
        follows
        <ul className="p-sm">
          <li>Ghee, Atta, Sugar & Oil Products - 3%</li>
          <li>FMCG & Loose Products - 10%</li>
          <li>General Merchandise - 20%</li>
          <li>Home & Kitchen Appliances - 5%</li>
        </ul>
      </p>
      <p className="sm grey-dark">*Please contact us for more information</p>
    </Modal>
  );
};

export default CommissionModal;
