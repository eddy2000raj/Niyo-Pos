import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import Dropdown from './Dropdown';
import { SyncStatus } from '../types/Sync';
import moment from 'moment';
import { useEffect } from 'react';
import AppAction from '../redux/actions/AppAction';
import styled from 'styled-components';
import useNetwork from '../hooks/useNetwork';
import Analytics from '../utils/Analytics';
import { Event } from '../types/Event';

const Sync = styled.div`
  .dd::before {
    right: 0;
  }
`;

const Info = styled.div`
  .dd {
    left: -124px;
    width: 250px;
  }
  .dd::before {
    left: 50%;
  }
`;

const mapRootState = (rootState: RootState) => {
  const syncs = rootState.appState.syncs;
  //const socket=rootState.appState.socketData;
  const syncInProgress = Object.keys(syncs).find(
    key => syncs[key].status == SyncStatus.IN_PROGRESS
  );
  return {
    isSyncing: !!syncInProgress,
    syncs: rootState.appState.syncs,
    message: rootState.appState.message,
    storeName: rootState.appState.store.name,
    productsProgess: rootState.appState.ui.productsProgress,
    ordersProgress: rootState.appState.ui.ordersProgress,
    customersProgress: rootState.appState.ui.customersProgress,
  };
};

const getSyncStatusIcon = (status: SyncStatus) => {
  if (status == SyncStatus.IN_PROGRESS) {
    return <i className="fas fa-sync fa-spin mr-sm"></i>;
  }

  if (status == SyncStatus.COMPLETED) {
    return <i className="fas fa-check"></i>;
  }

  if (status == SyncStatus.FAILED) {
    return <i className="fas fa-exclamation-triangle"></i>;
  }
  return null;
};

const getSyncs = (
  syncs,
  productsProgess,
  ordersProgress,
  customersProgress
) => {
  return (
    <>
      {Object.keys(syncs).map(key => {
        const sync = syncs[key];
        let time = moment
          .unix(sync.timestamp)
          .local()
          .format('DD MMM, YY hh:mm:ss A');
        let done = 1;
        let total = 1;
        if (sync.name == 'Products') {
          done = productsProgess.page;
          total = productsProgess.totalPages;
        } else if (sync.name == 'Server Orders') {
          done = ordersProgress.page;
          total = ordersProgress.totalPages;
        } else if (sync.name == 'Customers') {
          done = customersProgress.page;
          total = customersProgress.totalPages;
        } else if (sync.status == 'in_progress') {
          done = 0;
          total = 1;
        }
        const progress = (done / total) * 100;
        return (
          <div key={key} className="default" style={{ width: '215px' }}>
            <div className="p-md pv-sm">
              <div className="grid gutter-lg">
                <div>
                  <h3>{sync.name}</h3>
                  <div className="muted xs">{time}</div>
                </div>
                <div>{getSyncStatusIcon(sync.status)}</div>
              </div>
            </div>
            <hr className="hr light" />
            <div
              style={{
                height: '2px',
                backgroundColor: '#1dbb99',
                width: isNaN(progress) ? '0%' : progress + '%',
                transition: 'all 1s ease',
              }}
            ></div>
          </div>
        );
      })}
    </>
  );
};

const getInfo = () => {
  const info = [
    'Get app orders immediately',
    'Perform payments',
    'Fulfil app orders',
  ];
  return (
    <div className="p-md pv-sm default">
      <div className="bold">
        If you are connected to the internet you will be able to
      </div>
      <div className="mt-sm">
        {info.map((text, index) => (
          <div key={index} className="mt-sm">
            <i className="fa fa-check mr-sm"></i>
            <span>{`${text}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Header = ({ logout }) => {
  const isOnline = useNetwork();
  const {
    storeName,
    message,
    syncs,
    isSyncing,
    productsProgess,
    ordersProgress,
    customersProgress,
  } = useSelector(mapRootState);
  const dispatch = useDispatch();
  const sync = () => {
    Analytics.trackEvent(Event.SYNC);
    //dispatch(AppAction.sync());
    //dispatch(AppAction.connectFromSocketServer());
  };

  useEffect(() => {
    if (message) {
      const timeoutId = setTimeout(
        () => dispatch(AppAction.displayMessage(null, false)),
        message.milliseconds
      );
      return () => clearTimeout(timeoutId);
    }
  }, [message]);

  return (
    <header className="header">
      <div className="grid gutter-between c-center white sm semi-bold p-sm ph-md">
        <div>
          <div className="grid gutter-sm c-center">
            <div>
              <img src="/images/logo.png" height="30px" alt="1K" />
            </div>
            <div>{storeName}</div>
          </div>
        </div>
        <div>
          {/* Improve App Message displaying style */}
          {message && <p>{message.text}</p>}
        </div>
        <div>
          <div className="grid gutter-lg">
            <>
              {isOnline ? (
                <span className="green">
                  <i className="fa fa-wifi" aria-hidden="true"></i> Connected
                </span>
              ) : (
                <span className="red">
                  <span className="rel" style={{ left: '15px' }}>
                    <i className="fa fa-wifi" aria-hidden="true"></i>{' '}
                    <i
                      className="fas fa-slash rel"
                      style={{ right: '20px' }}
                    ></i>
                  </span>
                  No Internet
                </span>
              )}
            </>
            <Info>
              <Dropdown body={getInfo()}>
                <i className="far fa-question-circle fa-lg"></i>
              </Dropdown>
            </Info>
            <Sync>
              <Dropdown
                body={getSyncs(
                  syncs,
                  productsProgess,
                  ordersProgress,
                  customersProgress
                )}
                style={{ right: 0 }}
              >
                {isSyncing && getSyncStatusIcon(SyncStatus.IN_PROGRESS)}
                {!isSyncing && (
                  <i className="fas fa-sync mr-sm" onClick={sync}></i>
                )}
                <span className="mr-sm">SYNC</span>
                <i className="fas fa-chevron-down"></i>
              </Dropdown>
            </Sync>
            <div className="pointer" onClick={logout}>
              LOGOUT
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
