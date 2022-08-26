import React, { useState, useEffect } from 'react';
import Page from '../layouts/Page';
import Carousel from '../components/Carousel';
import InfoApi from '../apis/InfoApi';
import Toolkit from '../utils/Toolkit';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';

const InfoPage = () => {
  const [slides, setSlides] = useState(null);
  const rootState = useSelector((state: RootState) => state);
  const apiProps = Toolkit.mapStateToApiProps(rootState);

  const fetchSlides = async props => {
    const response = await new InfoApi(props).getAll({});
    setSlides(response.data);
  };

  useEffect(() => {
    fetchSlides(apiProps);
    return () => {
      setSlides(null);
    };
  }, []);

  return (
    <Page>
      <div className="p-sm">
        <div className="grid gutter-between">
          <div>
            <h1 className="lg semi-bold">Info</h1>
          </div>
          <div></div>
        </div>

        {(() => {
          if (slides) {
            return (
              <div className="grid gutter-md mt-lg">
                <Carousel data={slides} />
              </div>
            );
          }

          return <i className="fas fa-spinner fa-spin"></i>;
        })()}
      </div>
    </Page>
  );
};

export default InfoPage;
