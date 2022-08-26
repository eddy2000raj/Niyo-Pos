import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppAction from '../redux/actions/AppAction';
import { RootState } from '../redux/store';

const mapRootState = (rootState: RootState) => {
  if (rootState.appState.ui.toast) {
    return rootState.appState.ui.toast;
  }
  return {
    show: false,
    title: '',
    description: '',
    bgColor: '',
    position: '',
  };
};

const Toast = () => {
  const dispatch = useDispatch();
  const toastData = useSelector(mapRootState);
  const { show, duration, title, position, description, bgColor, action } =
    toastData;
  const deleteToast = () => {
    dispatch(
      AppAction.toggleToast({
        show: false,
        title: '',
        description: '',
        bgColor: '',
        position: '',
      })
    );
  };

  useEffect(() => {
    if (!!duration) {
      setTimeout(() => {
        deleteToast();
      }, duration);
    }
  }, [toastData]);

  return (
    <>
      <div className={`notification-container ${position}`}>
        {show && (
          <div className={`notification toast ${position} ${bgColor}`}>
            <button onClick={deleteToast}>
              <i className="fa fa-times" aria-hidden="true"></i>
            </button>
            <div>
              <p className="notification-title">{title}</p>
              <p className="notification-message">{description}</p>
              {!!action && (
                <div>
                  <button
                    className="bg-black"
                    style={{ marginTop: '10px', padding: '10px' }}
                    onClick={action.method}
                  >
                    {action.type}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Toast;
