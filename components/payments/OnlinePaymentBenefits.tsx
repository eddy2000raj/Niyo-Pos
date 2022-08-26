import styled from 'styled-components';

const OnlinePaymentBenefits = () => {
  return (
    <Box className="bd grid">
      <div className="col-3">
        <div className="p-sm h-full">
          <div
            className="grid p-sm h-full"
            style={{ border: '2px solid var(--color-green-dark)' }}
          >
            <div className="col-12 m-center flex">
              <img
                src="/images/payments1.png"
                alt="Pay updates in ledger within hours"
                width={150}
                height={100}
              />
            </div>
            <div className="col-12 center sm mt-sm">
              यहाँ से पेमेंट करते ही कुछ घंटो के अंदर अमाउंट आपके लेजर में अपडेट
              होगा।
            </div>
          </div>
        </div>
      </div>
      <div className="col-3">
        <div className="pv-sm h-full">
          <div
            className="grid p-sm h-full"
            style={{ border: '2px solid var(--color-green-dark)' }}
          >
            <div className="col-12  m-center flex">
              <img
                src="/images/payments2.png"
                alt="Further you can quickly put new orders post ledger updatations"
                width={150}
                height={100}
              />
            </div>
            <div className="col-12 center sm mt-sm">
              उसीके साथ आप नया आर्डर भी लगा सकते है ताकि आपके ग्राहक को हर बार
              सामान मिले।
            </div>
          </div>
        </div>
      </div>
      <div className="col-6">
        <div className="p-sm h-full">
          <div
            className="grid p-sm h-full red"
            style={{ border: '2px solid var(--color-red-dark)' }}
          >
            <div className="col-12">
              <div className="grid">
                <div className="col-6 m-end flex">
                  <img
                    src="/images/payments3.png"
                    alt="Cheque Pay"
                    width={150}
                    height={100}
                  />
                </div>
                <div className="col-6 flex">
                  <img
                    src="/images/payments4.png"
                    alt="Cash Pay"
                    width={150}
                    height={100}
                  />
                </div>
              </div>
            </div>
            <div className="col-12 center sm mt-sm">
              अगर आप कॅश या चेक से पेमेंट करते है तो वो भुगतान लेजर में आने के
              लिए २ से ४ दिन लगेग। तब तक आप नया सामान आर्डर नहीं कर पाएंग।
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

const Box = styled.div`
  margin-left: 10px;
`;

export default OnlinePaymentBenefits;
