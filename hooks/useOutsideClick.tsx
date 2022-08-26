import { useEffect, useRef, useState } from 'react';

const useOutsideClick = (defaultValue = false, passedRef = null) => {
  /*eslint-disable */
  const ref = passedRef || useRef(null);
  const [active, setActive] = useState(defaultValue);

  useEffect(() => {
    const clicked = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setActive(false);
      }
    };

    document.addEventListener('mousedown', clicked);
    return () => document.removeEventListener('mousedown', clicked);
  }, []);

  return [ref, active, setActive];
};

export default useOutsideClick;
