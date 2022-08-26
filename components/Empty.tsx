import styled from 'styled-components';
const Empty = () => {
  return (
    <Root className="col grow center p-lg mt-lg">
      <i className="fa fa-inbox grey icon-style" aria-hidden="true"></i>
      <p className="grey">No Data</p>
    </Root>
  );
};

const Root = styled.div`
  .icon-style {
    font-size: 40px;
  }
`;

export default Empty;
