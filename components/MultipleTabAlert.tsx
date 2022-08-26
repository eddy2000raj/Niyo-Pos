import styled from 'styled-components';
import Head from 'next/head';

const MultipleTabAlert = ({ channel, setShowApp }) => {
  const showCurrentTab = () => {
    setShowApp(true);
    channel.postMessage('another-tab');
  };
  const closeTab = () => window.open('https://www.1knetworks.com/', '_self');
  return (
    <Root>
      <Head>
        <title>Error - 1K POS</title>
        <meta
          name="viewport"
          content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0, width=device-width"
        />
        <link rel="icon" href="images/error.ico" type="image/x-icon" />
      </Head>
      <div className="alert-box">
        <h3 className="bold md">
          POS is open in another window. Click “Use Here” to use the POS in this
          window.
        </h3>
        <div className="mt-lg right">
          <button
            className="btn btn-md btn-red mr-md"
            onClick={() => closeTab()}
          >
            CLOSE TAB
          </button>
          <button
            className="btn btn-md btn-green"
            onClick={() => showCurrentTab()}
          >
            USE HERE
          </button>
        </div>
      </div>
    </Root>
  );
};

const Root = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-grey);

  .alert-box {
    background-color: var(--color-grey-light);
    width: 400px;
    padding: 20px 25px;
    box-shadow: -4px 4px 20px 1px #0e0b0b;
    border-radius: 8px;
  }
`;

export default MultipleTabAlert;
