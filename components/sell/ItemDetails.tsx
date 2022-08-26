import React, { useState, useEffect } from 'react';
import CartItem from '../../types/CartItem';
import { PriceType } from '../../types/Product';
import Toolkit from '../../utils/Toolkit';
import ItemAction from '../../redux/actions/cart/ItemAction';
interface Props {
  item: CartItem;
  update: (item: CartItem, price: number, quantity: number) => Promise<void>;
  max_allowed_qty: number;
}

const ItemDetails = ({ item, update, max_allowed_qty }: Props) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [price, setPrice] = useState(item.price);
  const [error, setError] = useState(null);

  const max_allowed_qty_error = `Max Allowed Quantity can not be more than ${max_allowed_qty}`;
  const onUpdate = () => {
    setError(null);
    if (!price || !quantity || quantity <= 0) {
      setError('Invalid Price or Quantity');
    } else if (price > item.product.mrp) {
      setError('Price cannot be more than MRP');
    } else if (quantity > max_allowed_qty) {
      setError(max_allowed_qty_error);
    } else if (item.product.prices.length > 0) {
      const priceObj = ItemAction.getPriceObj(item, PriceType.RETAIL);
      if (price < priceObj.min_price) {
        setError('Price cannot be less than minimum price');
      } else {
        update(item, price, quantity);
      }
    } else if (price < item.product.min_price) {
      setError('Price cannot be less than minimum price');
    } else {
      update(item, price, quantity);
    }
  };

  const handleQuantity = e => {
    let quantity =
      item.product.uom === 'piece'
        ? parseInt(e.target.value)
        : parseFloat(e.target.value);
    quantity > max_allowed_qty
      ? setError(max_allowed_qty_error)
      : setError(null);
    setQuantity(quantity);
  };

  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  return (
    <>
      <div className="grid gutter-md c-end mt-md">
        <div className="col-4">
          <label className="label xs bold">
            Quantity ({Toolkit.uomCode(item.product.uom)})
          </label>
          <input
            name="quantity"
            className="input input-sm"
            type="number"
            value={quantity}
            onFocus={e => e.target.select()}
            onChange={handleQuantity}
            min="0"
          />
        </div>
        <div className="col-4">
          <label className="label xs bold">Price (&#8377;)</label>
          <input
            name="price"
            className="input input-sm"
            type="number"
            readOnly={
              !item.product?.settings?.price_editable ||
              item.type == PriceType.WHOLESALE
            }
            value={price}
            min="0"
            onFocus={e => e.target.select()}
            onChange={e => setPrice(parseFloat(e.target.value))}
          />
        </div>
        <div className="col-4">
          <button
            type="button"
            className="btn btn-black"
            onClick={() => onUpdate()}
          >
            UPDATE
          </button>
        </div>
      </div>
      {error && <p className="red mt-sm">{error}</p>}
    </>
  );
};

export default ItemDetails;
