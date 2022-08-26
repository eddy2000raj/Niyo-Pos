import useOutsideClick from '../hooks/useOutsideClick';

const Dropdown = ({ children, body, style = {}, onClick = null }) => {
  const [ref, active, setActive] = useOutsideClick();
  const clickAction = () => {
    setActive(true);
    if (onClick) {
      onClick();
    }
  };

  return (
    <div ref={ref}>
      <div className="pointer" onClick={() => clickAction()}>
        {children}
      </div>
      <div className="rel">
        {active && (
          <div className="dd mt-md" style={style}>
            {body}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
