import { useState, useEffect } from 'react';
import Modal from '../../layouts/Modal';
import Storage, { StorageKey } from '../../utils/Storage';
import { useDispatch, useSelector } from 'react-redux';
import AppActions from '../../redux/actions/AppAction';
import { RootState } from '../../redux/store';
import Success from '../Success';

const ReloginModal = () => {
  const dispatch = useDispatch();
  const message = useSelector((state: RootState) => state.appState.message);
  const token = useSelector((state: RootState) => state.appState.token);
  const maxTimer = parseInt(process.env.NEXT_PUBLIC_OTP_TIMER) || 30;
  const [mob, setMob] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [otpRequested, setOtpRequested] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [jwtToken, setJwtToken] = useState<string>(token);
  const [loginCompleted, setLoginCompleted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(maxTimer);

  const handleLogin = e => {
    e.preventDefault();
    setLoading(true);
    dispatch(AppActions.login({ mobile: mob, otp }, true));
  };

  const sendOtp = () => {
    if (otpRequested) return;
    setOtpSent(false);
    const user = Storage.get(StorageKey.USER, null);
    if (user.mobile) {
      const mobile = user.mobile.substring(3);
      setMob(mobile);
      setOtpRequested(true);
      dispatch(AppActions.sendOtp({ mobile }, true));
    }
  };

  useEffect(() => {
    sendOtp();
  }, []);

  useEffect(() => {
    if (message) {
      if (message.text === 'OTP Sent successfully.') {
        setOtpSent(true);
        setOtpRequested(false);
        setTimer(maxTimer);
        toast('Success', 'bg-green', message.text, 5000);
      }
      if (message.isError) {
        setOtpRequested(false);
        setLoading(false);
        toast('Error', 'bg-red', message.text, 5000);
      }
    }
  }, [message]);

  useEffect(() => {
    if (timer <= 0) return;
    if (otpSent) {
      const interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer, otpSent]);

  useEffect(() => {
    if (token && !loginCompleted) {
      if (jwtToken !== token) {
        setLoginCompleted(true);
        setLoading(false);
        setTimeout(() => dispatch(AppActions.switchModal(null)), 1200);
      }
      setJwtToken(token);
    }
  }, [token]);

  const toast = (
    title: string,
    bgColor: string,
    text: string,
    duration: number
  ) => {
    dispatch(
      AppActions.pushToast({
        title: title,
        description: text,
        bgColor: bgColor,
        duration: duration,
      })
    );
  };

  return (
    <Modal noExit={true}>
      {loginCompleted ? (
        <Success type={'Login'} />
      ) : (
        <>
          <h2 className="title center">Session Expired!</h2>
          <h3 className="center">Please re-login to use the app</h3>
          <div className="mt-md sm"></div>
          <div className="mt-lg center" style={{ padding: '0 80px' }}>
            {otpRequested ? (
              <>
                Sending OTP to your mobile number{' '}
                <span style={{ fontWeight: 800 }}>{mob}</span>{' '}
                <i className="fas fa-spinner fa-spin"></i>
              </>
            ) : null}
            {otpSent && (
              <h4>
                Enter OTP we just sent to your mobile number{' '}
                <span style={{ fontWeight: 800 }}>{mob}</span>
              </h4>
            )}
            <form style={{ padding: '0 30px' }} onSubmit={handleLogin}>
              <div className="mt-md">
                <input
                  disabled={otpRequested || !otpSent}
                  type="password"
                  name="otp"
                  value={otp}
                  placeholder="Enter OTP"
                  className="input"
                  onChange={e => setOtp(e.target.value)}
                />
              </div>
              <span className="grey bold mt-sm" style={{ float: 'right' }}>
                {timer > 0 && timer <= maxTimer && otpSent ? (
                  <span>{`Resend OTP in ${timer} sec`}</span>
                ) : (
                  <span
                    onClick={sendOtp}
                    className={otpRequested ? 'grey' : 'orange'}
                    style={{ cursor: 'pointer' }}
                  >
                    Resend OTP
                  </span>
                )}
              </span>
              <button
                type="submit"
                disabled={otpRequested || !otpSent || loading}
                className="btn btn-orange mt-lg w-full"
              >
                {loading ? <i className="fas fa-spinner fa-spin"></i> : 'LOGIN'}
              </button>
            </form>
          </div>
        </>
      )}
    </Modal>
  );
};

export default ReloginModal;
