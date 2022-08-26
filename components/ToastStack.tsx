import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppAction from '../redux/actions/AppAction';
import { RootState } from '../redux/store';

const mapRootState = (rootState: RootState) => {
  if (rootState.appState.ui.toastStack) {
    return rootState.appState.ui.toastStack.length
      ? [...rootState.appState.ui.toastStack]
      : [];
  }
  return [
    {
      show: false,
      title: '',
      description: '',
      bgColor: '',
      position: '',
    },
  ];
};

const ToastStack = () => {
  const dispatch = useDispatch();
  const toastStack = useSelector(mapRootState);
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    setToasts(toastStack);
    const toastTime = setTimeout(() => {
      dispatch(AppAction.popToast());
    }, 1500);
    return () => {
      clearTimeout(toastTime);
    };
  }, [toastStack]);
  return (
    <>
      <div className={`notification-container top-right`}>
        {toasts.map(({ position, bgColor, title, description }, i) => (
          <div key={i} className={`notification toast ${position} ${bgColor}`}>
            <div>
              <p className="notification-title">{title}</p>
              <p className="notification-message">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ToastStack;
