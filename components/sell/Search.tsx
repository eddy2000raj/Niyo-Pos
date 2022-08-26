import useCart from '../../hooks/useCart';
import useProducts from '../../hooks/useProducts';
import useOutsideClick from '../../hooks/useOutsideClick';
import { FocusEvent } from 'react';
import { useEffect, useRef } from 'react';
import BarcodeReader from 'react-barcode-reader';
import styled from 'styled-components';
import Toolkit, { formatCurrency } from '../../utils/Toolkit';
import { OrderSource } from '../../types/Order';
import { useDispatch } from 'react-redux';
import AppAction from '../../redux/actions/AppAction';

const Root = styled.div`
  .suggestions {
    background-color: #fff;
    width: 100%;
    max-height: 60vh;
    border-radius: 5px;
    overflow-y: auto;
    box-shadow: 0 6px 10px var(--color-grey-dark);
  }

  .remove-text {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
  }

  .suggestions > div:first-child {
    margin-top: 10px;
  }

  .suggestions > div {
    padding: var(--dimen-sm) var(--dimen-md);
  }

  .suggestions > div:first-child {
    background-color: var(--color-grey-light);
  }

  .suggestions > div:hover {
    background-color: var(--color-grey-light);
  }
`;

interface Props {}

const Search = ({}: Props) => {
  const { addItem, cart } = useCart();
  const [products, keyword, setKeyword, isLoading] = useProducts();
  const [ref, active, setActive] = useOutsideClick();
  const searchRef = useRef(null);
  const dispatch = useDispatch();
  const chooseProduct = product => {
    addItem(product);
    setKeyword('');
  };

  const onFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.target.select();
    setActive(true);
  };
  const toggleError = (error_message: string) => {
    dispatch(
      AppAction.pushToast({
        title: 'Error',
        description: error_message,
      })
    );
  };
  const handleScan = result => {
    if (cart.source === OrderSource.POS) {
      setKeyword(result, true);
    } else {
      toggleError('Items can not be added for app order');
    }
  };
  const handleSearch = e => {
    if (cart.source === OrderSource.POS) {
      setKeyword(e.target.value);
    } else {
      toggleError('Items can not be added for app order');
    }
  };
  useEffect(() => {
    //if exact match and one product only
    if (
      products.length == 1 &&
      products[0].barcode &&
      products[0].barcode.toLowerCase() == keyword
    ) {
      chooseProduct(products[0]);
    }
  }, [products]);

  return (
    <Root className="rel" ref={ref}>
      <BarcodeReader onScan={result => handleScan(result)} />
      <div>
        <label className="label bold upper">Search for Products</label>
        <div className="input-group">
          <div className="icon">
            <i className="fas fa-search"></i>
          </div>

          <input
            type="text"
            className={`input bg-white ${cart.total < 0 && 'pointer disabled'}`}
            value={keyword}
            ref={searchRef}
            onFocus={onFocus}
            placeholder="Start typing or scanning"
            onChange={handleSearch}
            disabled={cart.total < 0 || cart.source !== OrderSource.POS}
          />
          {keyword && (
            <i
              className="fas fa-times remove-text"
              onClick={() => setKeyword('')}
            ></i>
          )}
        </div>
      </div>

      {keyword.trim().length > 0 && (
        <div className="mt-xs suggestions xs">
          {isLoading && <div className="pv-sm">Loading...</div>}
          {!isLoading && keyword.trim().length <= 2 && (
            <div className="pv-sm">Please enter three or more characters</div>
          )}
          {!isLoading && keyword.trim().length > 2 && products.length == 0 && (
            <div className="pv-sm">
              No results matching &#8220;{keyword}&#8221;
            </div>
          )}
          {!isLoading &&
            products.map(product => {
              return (
                <div
                  key={product.id}
                  className="pointer"
                  onClick={() => chooseProduct(product)}
                >
                  <div className="grid gutter-between gutter-sm">
                    <div>
                      <img
                        src={product.image_url}
                        width="40px"
                        height="40px"
                        className="bg-grey-light"
                      />
                    </div>
                    <div className="col grow">
                      <div className="semi-bold">{product.name}</div>
                      <div className="muted">
                        {product.barcode && product.barcode + ' |'}{' '}
                        {product.stock + ' ' + product.uom}
                      </div>
                    </div>
                    <div className="semi-bold">
                      {formatCurrency(Toolkit.getPrice(product))}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </Root>
  );
};

export default Search;
