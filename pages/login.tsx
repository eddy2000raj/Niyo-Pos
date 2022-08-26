import React, { useState, FormEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppActions from '../redux/actions/AppAction';
import { RootState } from '../redux/store';
import { useRouter } from 'next/router';
import AppAction from '../redux/actions/AppAction';

const LoginPage = () => {
  const maxTimer = parseInt(process.env.NEXT_PUBLIC_OTP_TIMER) || 30;
  const token = useSelector((state: RootState) => state.appState.token);
  const message = useSelector((state: RootState) => state.appState.message);
  const router = useRouter();
  const dispatch = useDispatch();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState<boolean>(false);
  const [otpSubmitted, setOtpSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(maxTimer);
  const [startTimer, setStartTimer] = useState<boolean>(false);
  const [btnDisable, setBtnDisable] = useState<boolean>(true);

  useEffect(() => {
    if (!startTimer || timeLeft === 0) {
      return;
    }
    const timerInterval = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => {
      clearInterval(timerInterval);
    };
  }, [timeLeft, startTimer]);

  useEffect(() => {
    if (token) {
      router.push('/');
    }
    if (message) {
      setLoading(false);
    }
    if (message && message.isError && otpRequested) {
      dispatch(
        AppAction.pushToast({
          title: 'Error',
          description: message.text,
        })
      );
      if (!otpSubmitted) {
        setOtpRequested(false);
        setBtnDisable(false);
      } else {
        setOtpSubmitted(false);
      }
    }
  }, [token, message]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!otpRequested) {
      setOtpRequested(true);
      setTimeLeft(maxTimer);
      dispatch(AppActions.sendOtp({ mobile }));
      setStartTimer(true);
      if (otp.length === 0) {
        setBtnDisable(true);
      }
    } else {
      setOtpSubmitted(true);
      dispatch(AppActions.login({ mobile, otp }));
    }
  };

  const resetOtpLogin = () => {
    setMobile('');
    setOtp('');
    setOtpRequested(false);
    setOtpSubmitted(false);
  };

  const resendOtp = () => {
    if (timeLeft === 0) {
      dispatch(AppActions.sendOtp({ mobile }));
      setTimeLeft(maxTimer);
      setStartTimer(true);
    }
  };

  const handleNumberChange = (e: any) => {
    const number = e.target.value;
    if (number.length > 10) return;
    setMobile(number);
    if (number.length === 10) {
      setBtnDisable(false);
    } else {
      setBtnDisable(true);
    }
  };

  const handleOtpChange = (e: any) => {
    setOtp(e.target.value);
    if (e.target.value.length) {
      setBtnDisable(false);
    } else {
      setBtnDisable(true);
    }
  };

  return (
    <div className="grid c-center m-center h-full col grow">
      <div className="col-12 col-sm-6 col-lg-4">
        <div className="bg-white" style={{ padding: '70px 100px' }}>
          <div className="xl center bold">
            <img src="/images/logo.png" width="100px" alt="1K" />
          </div>
          <h1 className="md center mt-lg semi-bold">LOGIN</h1>
          <form onSubmit={submit}>
            <div className="input-group mt-lg">
              <div className="input-group-prepend">
                <span className="input-group-text">+91</span>
              </div>
              <input
                type="number"
                name="mobile"
                value={mobile}
                placeholder="Enter mobile number"
                className="input"
                onChange={handleNumberChange}
                disabled={otpRequested}
              />
            </div>
            {otpRequested && (
              <div className="mt-md">
                <input
                  type="password"
                  name="otp"
                  value={otp}
                  placeholder="Enter OTP"
                  className="input"
                  onChange={handleOtpChange}
                />
                <span
                  className={`mt-sm bold ${timeLeft === 0 ? 'orange' : 'grey'}`}
                  style={{
                    float: 'right',
                    cursor: timeLeft === 0 ? 'pointer' : 'default',
                  }}
                  onClick={resendOtp}
                >
                  {timeLeft === 0 ? 'Resend' : `Resend OTP in ${timeLeft} sec`}
                </span>
              </div>
            )}
            <button
              disabled={btnDisable || loading}
              type="submit"
              className="btn btn-orange mt-lg w-full"
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin mr-xs"></i>
              ) : otpRequested ? (
                'LOGIN'
              ) : (
                'REQUEST OTP'
              )}
            </button>
            {otpRequested && (
              <button
                type="button"
                className="btn btn-sm btn-default mt-lg w-full"
                onClick={resetOtpLogin}
              >
                Use Different Mobile Number
              </button>
            )}
          </form>
          <br></br>
          <div className="mt-xl xs muted center">
            &copy; Odicea Distribution Technologies Pvt. Ltd.{' '}
          </div>
          <div className="mt-xl xs muted center">
            <a
              href="https://www.1knetworks.com/privacy-policy"
              rel="noreferrer"
              target="_blank"
            >
              Privacy Policy{' '}
            </a>
            <span className="ph-xs">|</span>

            <a
              href="https://www.1knetworks.com/terms-of-use"
              rel="noreferrer"
              target="_blank"
            >
              {' '}
              Terms of Use{' '}
            </a>

            <span className="ph-xs">|</span>
            <a
              href="https://www.1knetworks.com/retailer-refund-and-cancellation-policy"
              rel="noreferrer"
              target="_blank"
            >
              {' '}
              Refund & Cancellation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

LoginPage.isPrivate = false;

export default LoginPage;
