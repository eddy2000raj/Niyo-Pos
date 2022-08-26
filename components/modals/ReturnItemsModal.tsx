import Modal from '../../layouts/Modal';
import { ModalProps } from '../ModalManager';
import OrderItem, { OrderItemStatus } from '../../types/OrderItem';
import Order from '../../types/Order';
import Product from '../../types/Product';
import { useState, FormEvent, useEffect } from 'react';
import useCart from '../../hooks/useCart';
import { useRouter } from 'next/router';
import Discount from '../../types/Discount';
import Action from '../../types/Action';
import Storage, { StorageKey } from '../../utils/Storage';

interface Props extends ModalProps {
  items: OrderItem[];
  order: Order;
  expiredItems: OrderItem[];
  returnOrders: OrderItem[];
}

interface ReturnItem {
  product: Product;
  quantity: number;
  price: number;
  parent_item: OrderItem;
}

const ReturnItemList = ({ returnOrders }) => {
  return returnOrders.map((order: Order) => {
    return order.items
      .filter(item => item.status == OrderItemStatus.RETURNED)
      .map((item: OrderItem, index) => {
        return (
          <div
            className={`grid gutter-sm sm c-center mt-sm`}
            key={item?.product?.id}
          >
            <div>{index + 1}. </div>
            <div className="col grow">{item?.product?.name}</div>
          </div>
        );
      });
  });
};

const Item = ({
  item,
  addItem,
  removeItem,
  updateItemQty,
  expired,
  index,
  setDisableReturn,
}) => {
  const [qty, setQty] = useState(item.allowed_return_qty);
  const [isEnabled, setIsEnabled] = useState(false);

  const toggleItem = () => {
    setIsEnabled(!isEnabled);
    !isEnabled ? addItem(item) : removeItem(item);
  };

  const changeItemQty = (value: string) => {
    if (value.length == 0 || parseFloat(value) <= 0) {
      setDisableReturn(true);
    } else {
      setDisableReturn(false);
    }
    if (parseFloat(value) <= 0 || parseFloat(value) > item.allowed_return_qty)
      return;
    if (item.product.uom === 'piece') {
      value = parseInt(value).toString();
    }
    const returnQty = parseFloat(value);
    setQty(value);
    updateItemQty(item, returnQty);
  };

  //TODO:: get available quantity for return basis item relation
  const freeItem = item.parent_item && parseFloat(item.total) === 0;
  return (
    <div
      className={`grid gutter-sm sm c-center ${expired ? 'mt-sm' : 'mt-lg'}`}
      key={item?.product?.id}
    >
      <div>
        {!freeItem && !expired && (
          <input type="checkbox" onClick={() => toggleItem()} />
        )}
        {expired && <div>{index + 1}. </div>}
      </div>
      <div className="col grow">
        {item?.product?.name}
        {freeItem && (
          <p className="green">Free with {item.parent_item.product.name}</p>
        )}
      </div>
      {!expired && (
        <div>
          {!freeItem ? (
            <input
              name="quantity"
              className="input input-xs"
              type="number"
              value={qty}
              max={item.allowed_return_qty}
              onChange={e => changeItemQty(e.target.value)}
              disabled={!isEnabled}
            />
          ) : (
            <div style={{ width: '150px' }}>{qty}</div>
          )}
        </div>
      )}
    </div>
  );
};

const ReturnItemsModal = ({
  complete,
  items,
  order,
  expiredItems,
  returnOrders,
}: Props) => {
  const store = Storage.get(StorageKey.STORE, null);
  const {
    addReturnItem,
    updateCustomer,
    discard,
    addPayments,
    addPrentRefId,
    addReturnReason,
  } = useCart();
  const [returnItems, setReturnItems] = useState([]);
  const [displayItems, setDisplayItems] = useState(items);
  const [reasonId, setReasonId] = useState(null);
  const [returnReasons, setReturnReasons] = useState(
    store.settings.return_reasons.filter(reason => reason.status === 1)
  );
  const [disableReturn, setDisableReturn] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const non_free_items: OrderItem[] = items.filter(
      itm => !(itm.parent_item && parseFloat(itm.total.toString()) === 0)
    );
    const free_items: OrderItem[] = items.filter(
      itm => itm.parent_item && parseFloat(itm.total.toString()) === 0
    );
    setDisplayItems([...non_free_items, ...free_items]);
  }, [items]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await discard();
    if (returnItems.length) {
      for (const returnItem of returnItems) {
        await addReturnItem(
          order,
          returnItem.parent_item,
          returnItem.quantity,
          returnItem.price,
          order.mallOrder
        );
      }
      await addReturnReason(reasonId);
      await updateCustomer(order.customer);
      await complete();
      await addPrentRefId(order.ref_id);
      await addPayments();
      router.push('/');
    }
  };

  const addItem = (item: OrderItem) => {
    const discountPerUnit = item.discount / item.quantity;
    const newItem = [
      {
        product: item.product,
        quantity: item.allowed_return_qty,
        price: item.price - discountPerUnit,
        parent_item: item,
      },
    ];

    // Iterating each item to check if any item is club up as a free item and add it automatically.
    items.forEach(itm => {
      if (
        itm.parent_item?.id === item.id &&
        parseFloat(itm.total.toString()) === 0
      ) {
        const newFreeItem = {
          product: itm.product,
          quantity: itm.allowed_return_qty,
          price: itm.total,
          parent_item: itm,
        };
        newItem.push(newFreeItem);
      }
    });
    setReturnItems(returnItems => [...returnItems, ...newItem]);
  };

  const removeItem = (item: OrderItem) => {
    const items = returnItems.filter(
      (returnItem: ReturnItem) => returnItem.product != item.product
    );
    setReturnItems(items);
  };

  const calcFreeItemReturnQty = (
    free_item: OrderItem,
    return_quantity: number,
    free_item_rule_action: Action
  ) => {
    const { step, quantity } = free_item_rule_action;
    const qty: number = parseInt(quantity.toString());
    let free_item_return_qty = (return_quantity / step) * qty;
    const nearest_divisible_quantity =
      free_item_return_qty - (free_item_return_qty % qty);
    if (nearest_divisible_quantity !== free_item_return_qty) {
      free_item_return_qty = nearest_divisible_quantity + qty;
    }
    return Math.min(free_item_return_qty, free_item.allowed_return_qty);
  };

  const updateItemQty = (item: OrderItem, quantity: number) => {
    const return_items = returnItems.map((returnItem: ReturnItem) => {
      if (returnItem.product == item.product) {
        returnItems.forEach(rItem => {
          if (
            rItem.parent_item.parent_item?.id === returnItem.parent_item.id &&
            parseFloat(rItem.price.toString()) === 0
          ) {
            const freeItem = rItem.parent_item;
            const parentItem = returnItem.parent_item;
            const initialQty = {
              parent_item: parentItem.allowed_return_qty,
              free_item: freeItem.allowed_return_qty,
            };
            const free_item_rule_ids = [];
            freeItem.discounts.forEach((discount: Discount) => {
              if (discount.rule) free_item_rule_ids.push(discount.rule.id);
            });
            let free_item_rule_action = null;
            if (order.associated_rules) {
              order.associated_rules.forEach(rule => {
                free_item_rule_ids.forEach(free_item_rule_id => {
                  if (rule.id === free_item_rule_id) {
                    rule.actions.forEach(action => {
                      if (action.type === 'free')
                        free_item_rule_action = action;
                    });
                  }
                });
              });
            }
            if (free_item_rule_action) {
              freeItem.quantity = calcFreeItemReturnQty(
                freeItem,
                quantity,
                free_item_rule_action
              );
            }
          }
        });
        return { ...returnItem, quantity: quantity };
      }
      return returnItem;
    });
    setReturnItems(return_items);
  };
  return (
    <Modal>
      <h1 className="title">Return Items</h1>
      <div className="mt-xs xs">
        Choose items with desired quantity to return. Your items will replace
        existing cart.
      </div>
      <form onSubmit={submit}>
        {displayItems.map((item, index) => (
          <Item
            item={item}
            key={item.product.id + item.status}
            addItem={addItem}
            updateItemQty={updateItemQty}
            removeItem={removeItem}
            expired={false}
            index={index}
            setDisableReturn={setDisableReturn}
          />
        ))}
        {displayItems?.length > 0 && (
          <select
            onChange={e =>
              setReasonId(
                returnReasons?.filter(
                  reason => reason.title == e.target.value
                )[0].id
              )
            }
            required
            className="mt-md input"
          >
            <option selected disabled>
              Select reason for return
            </option>
            {returnReasons?.map(reason => (
              <option onClick={() => setReasonId(reason.id)} key={reason.id}>
                {reason.title}
              </option>
            ))}
          </select>
        )}
        {!!returnOrders?.length && <h2 className="mt-md">Returned Items: </h2>}
        {returnOrders?.length >= 1 && (
          <ReturnItemList returnOrders={returnOrders} />
        )}
        {!!expiredItems?.length && (
          <h2 className="mt-md">Return period over for these items:</h2>
        )}
        {expiredItems?.map((item, index) => (
          <Item
            item={item}
            key={item.product.id + item.status}
            addItem={addItem}
            updateItemQty={updateItemQty}
            removeItem={removeItem}
            expired={true}
            index={index}
            setDisableReturn={setDisableReturn}
          />
        ))}
        <div className="right mt-lg">
          <button
            className="btn btn-sm btn-green"
            type="submit"
            disabled={!returnItems.length || !reasonId || disableReturn}
          >
            Return
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReturnItemsModal;
