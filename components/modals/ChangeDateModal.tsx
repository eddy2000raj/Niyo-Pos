import moment from 'moment';
import React from 'react';
import Modal from '../../layouts/Modal';
import Storage, { StorageKey } from '../../utils/Storage';

const ChangeDateModal = () => {
  const currentDate = moment();
  const serverTime = Storage.get(StorageKey.SERVER_TIME, null);
  return (
    <Modal>
      <p className="">Your system time is: {currentDate.format('hh : mm a')}</p>
      <p className="">
        Server time is:{' '}
        {moment(serverTime)
          .add(5, 'hours')
          .add(30, 'minutes')
          .format('hh : mm a')}
      </p>
      <br />
      <p>For Android: Go to SETTINGS &#x2192; DATE and TIME </p>
      <p>
        For Windows: Go to SETTINGS &#x2192; Time and language &#x2192; DATE and
        TIME{' '}
      </p>
      <p className="center lg orange bold">
        Please Update Your System&apos;s Time!
      </p>
    </Modal>
  );
};

export default ChangeDateModal;
