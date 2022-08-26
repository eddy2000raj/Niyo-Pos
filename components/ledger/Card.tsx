import Toolkit from '../../utils/Toolkit';
import styled from 'styled-components';

const Card = ({ balance }) => {
  const spinner = () => {
    return <i className="fas fa-spinner fa-spin"></i>;
  };

  return (
    <CardContainer>
      <div className="card p-md bg-yellow">
        <div className="grid gutter-md center">
          <div className="col-12 col-sm-3">
            <div className="bold">Previous Balance</div>
            <div className="md semi-bold mt-sm">
              {balance.starting_bal !== undefined
                ? Toolkit.formatCurrency(balance.starting_bal.amount)
                : spinner()}
              {
                <p className="sm bold">
                  {balance.starting_bal && `( ${balance.starting_bal.label} )`}
                </p>
              }
            </div>
          </div>

          <div className="col-12 col-sm-3">
            <div className="bold">Debit</div>
            <div className="md semi-bold mt-sm">
              {balance.debit_sum !== undefined
                ? Toolkit.formatCurrency(balance.debit_sum)
                : spinner()}
            </div>
          </div>

          <div className="col-12 col-sm-3">
            <div className="bold">Credit</div>
            <div className="md semi-bold mt-sm">
              {balance.credit_sum !== undefined
                ? Toolkit.formatCurrency(balance.credit_sum)
                : spinner()}
            </div>
          </div>

          <div className="col-12 col-sm-3">
            <div className="bold">Final Balance</div>
            <div className="md semi-bold mt-sm">
              {balance.ending_bal !== undefined
                ? Toolkit.formatCurrency(balance.ending_bal.amount)
                : spinner()}
              {
                <p className="sm bold">
                  {balance.ending_bal && `( ${balance.ending_bal.label} )`}
                </p>
              }
            </div>
          </div>

          {balance.total_pending_return_value !== undefined &&
            balance.commission_earned !== undefined && (
              <div className="col-12 left">
                <div className="grid ph-sm">
                  <div className="col-12">
                    <hr className="hr light mt-sm" />
                  </div>
                  <div className="col-6 mt-md">
                    <span className="bold">
                      Pending Returns: <br />
                    </span>
                  </div>

                  <div className="col-6 right mt-md">
                    <span>
                      {Toolkit.formatCurrency(
                        balance.total_pending_return_value,
                        true,
                        0
                      )}
                    </span>
                  </div>

                  <div className="col-6 mt-sm">
                    <span className="bold">Your Income:</span>
                  </div>

                  <div className="col-6 right mt-sm">
                    <span>
                      {Toolkit.formatCurrency(
                        balance.commission_earned,
                        true,
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </CardContainer>
  );
};

const CardContainer = styled.div`
  box-shadow: 1px 2px 9px #0000000f;

  border-radius: 10px;
`;

export default Card;
