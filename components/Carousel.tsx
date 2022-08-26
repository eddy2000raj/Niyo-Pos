import React, { useState } from 'react';

const Carousel = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToPrev = () => {
    if (activeIndex !== 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const goToNext = () => {
    if (activeIndex < data.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  if (!data || data.length === 0) {
    return <p>No data found.</p>;
  }

  return (
    <section className="carousel">
      <div className="carousel-holder">
        <div
          className={`carousel-arrow carousel-arrow-left ${
            activeIndex === 0 ? 'disabled' : ''
          }`}
          onClick={() => goToPrev()}
        >
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
        </div>

        <div className="carousel-slides">
          {data.map((slide, index) => (
            <div
              className={`carousel-slide ${
                index === activeIndex ? 'active' : ''
              }`}
              key={index}
            >
              <img
                src={`${process.env.API_DOMAIN}${slide.link}`}
                width="100%"
                alt="slide"
              />
            </div>
          ))}
        </div>

        <div
          className={`carousel-arrow carousel-arrow-right ${
            activeIndex === data.length - 1 ? 'disabled' : ''
          }`}
          onClick={() => goToNext()}
        >
          <i className="fas fa-arrow-right" aria-hidden="true"></i>
        </div>
      </div>
    </section>
  );
};

export default Carousel;
