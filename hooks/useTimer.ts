import { useRef, useEffect } from 'react';

const useTimer = (
  callback: () => Promise<any>,
  milliseconds: number,
  runImmediately: boolean = false
) => {
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    timerRef.current = setInterval(async () => await callback(), milliseconds);
    if (runImmediately) {
      callback();
    }
    return () => clearTimer();
  }, []);
};

export default useTimer;
