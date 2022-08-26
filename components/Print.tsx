import ReactDOM from 'react-dom';

const Print = ({ children, hidden = false, ...props }) => {
  return (
    <>
      {!hidden && <>{children}</>}
      {ReactDOM.createPortal(
        <div className="printable" {...props}>
          {children}
        </div>,
        document.body
      )}
    </>
  );
};

export default Print;
