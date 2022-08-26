import React from 'react';
import Modal from '../../layouts/Modal';

const ReportsTnc = () => {
  return (
    <Modal>
      <div style={{ width: '98%' }}>
        <h2 className="md bold">Terms & Conditions</h2>
        <p className="sm mt-sm">
          * All the numbers in this reports section are based on{' '}
          <span style={{ fontWeight: 'bold' }}>POS Syncing</span>, Kindly SYNC
          your POS for accurate details in reports
        </p>
        <p className="sm mt-sm">
          * इस रिपोर्ट अनुभाग के सभी नंबर{' '}
          <span style={{ fontWeight: 'bold' }}>POS Syncing</span> पर आधारित हैं,
          कृपया रिपोर्ट में सटीक विवरण के लिए अपने POS को SYNC करें
        </p>
        <p className="sm mt-sm">
          * These are provisional commissions as per your current sales and
          filter selection, Actual commissions would be credited to the ledger
          at regular intervals
        </p>
        <p className="sm mt-sm">
          * ये आपकी वर्तमान बिक्री और फ़िल्टर चयन के अनुसार अस्थायी कमीशन हैं ,
          वास्तविक कमीशन को नियमित अंतराल पर खाता बही पर क्रेडिट किया जाएगा
        </p>
      </div>
    </Modal>
  );
};

export default ReportsTnc;
