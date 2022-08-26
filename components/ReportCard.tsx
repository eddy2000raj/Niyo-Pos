import React from 'react';

const ReportCard = ({ img, topText, bottomText, cols, star }) => {
  return (
    <div className={`${cols}`}>
      <div
        className="flex"
        style={{
          gap: '15px',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <img alt="rupee" src={`/images/reports/${img}`} />
        <div
          className="flex"
          style={{ flexDirection: 'column', alignItems: 'flex-start' }}
        >
          <p className="sm grey">
            {topText}
            {star && <span> *</span>}
          </p>
          <p className="semi-bold lg" style={{ lineHeight: '28px' }}>
            {bottomText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
