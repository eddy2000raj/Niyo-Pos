import React from 'react';
import Modal from '../../layouts/Modal';

const VersionUpdateModal = () => {
  const updatePos = async () => {
    indexedDB.deleteDatabase('workbox-expiration');
    const cacheKeys = await caches.keys();
    for (const key of cacheKeys) {
      caches.delete(key);
    }
    const some = await navigator.serviceWorker.getRegistrations();
    console.log('navigator.serviceWorker.getRegistrations()', some);
    // unregister all registrations of servive worker
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length > 0) {
      for (const registration of registrations) {
        console.log('length');
        // registration.postMessage({ action: 'UNREGISTER' })
        registration.unregister();
      }
      location.reload();
    }
  };
  return (
    <Modal noExit>
      <div
        className="flex mt-md bg-orange"
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: '120px 100px',
          borderRadius: '3px',
        }}
      >
        <i style={{ transform: 'scale(6)' }} className="fas fa-sync"></i>
      </div>
      <div
        className="flex mt-md"
        style={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <button
          className="btn btn-orange"
          onClick={updatePos}
          style={{ borderRadius: '3px' }}
        >
          Update POS
        </button>
      </div>
    </Modal>
  );
};

export default VersionUpdateModal;
