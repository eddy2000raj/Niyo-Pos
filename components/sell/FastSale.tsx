import useCart from '../../hooks/useCart';
import DB from '../../utils/database/DB';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Toolkit from '../../utils/Toolkit';
import { FastTags } from '../../types/Sale';

const Root = styled.div`
  .product {
    /* disable text selection for non touch screens */
    user-select: none;
    border-top: 2px solid var(--color-orange);
  }

  .product:active {
    background-color: var(--color-yellow);
    color: #fff;
  }

  .toolbar {
    background-color: var(--color-grey-dark);
    border: 1px solid var(--color-grey-light);
    position: sticky;
    top: 0;
  }

  .btn {
    border-radius: 5px;
  }

  .tag {
    color: var(--color-grey-dark);
    padding: 1px 5px;
    display: inline-block;
    border-radius: 5px;
    border: 1px solid var(--color-grey);
  }

  .tag.price {
    background-color: var(--color-grey-light);
  }
`;

const FastSale = () => {
  const { addItem, cart } = useCart();
  const [products, setProducts] = useState([]);
  const [activeTag, setActiveTag] = useState(FastTags.RICES);
  const [loading, setLoading] = useState(false);

  const loadFastSaleProducts = async (tag: FastTags) => {
    setLoading(true);
    const results = await DB.products
      .where('fast_tags')
      .equals(tag)
      .and(product => {
        return product.fast_sale == 1;
      })
      .sortBy('name');
    setProducts(results);
    setLoading(false);
  };

  useEffect(() => {
    loadFastSaleProducts(activeTag);
  }, [activeTag]);

  return (
    <Root>
      <div className="toolbar card p-sm">
        {Object.keys(FastTags).map(tag => {
          return (
            <button
              key={tag}
              className={`${
                activeTag == FastTags[tag] ? 'btn-yellow' : ''
              } btn btn-xs btn-sm mr-md`}
              onClick={() => setActiveTag(FastTags[`${tag}`])}
              disabled={cart.total < 0}
            >
              {FastTags[`${tag}`]}
            </button>
          );
        })}
      </div>
      <div className="grid gutter-md mt-md">
        {loading && (
          <div className="xs center h-full">
            <i className="fas fa-spinner fa-spin mr-xs"></i> Loading items
          </div>
        )}
        {!loading &&
          products.map(product => {
            return (
              <div
                className="col-12 col-md-4 col-lg-4 pointer"
                key={product.id}
                onClick={() => addItem(product)}
              >
                <div className="card product h-full xs p-sm">
                  <div className="grid vertical gutter-between h-full">
                    <div>
                      <div className="semi-bold">
                        {product.name} <span> </span>
                      </div>
                    </div>
                    <div className="grid gutter-between c-end mt-xs">
                      <div>
                        Stock: {product.stock} {Toolkit.uomCode(product.uom)}
                      </div>
                      <div>
                        <span className="tag price">
                          {Toolkit.formatCurrency(Toolkit.getPrice(product))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </Root>
  );
};

export default FastSale;
