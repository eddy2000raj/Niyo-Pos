import { useState, useEffect } from 'react';
import DB from '../utils/database/DB';
import Order, { OrderStatus, OrderSource } from '../types/Order';
import { PriceType } from '../types/Product';

interface Query {
  page: number;
  limit: number;
  keyword: string;
  startDate: number;
  endDate: number;
  status: OrderStatus | null;
  source: OrderSource | null;
  type?: PriceType | null;
  mall?: boolean | false;
}

const getFromLocal = async (query: Query) => {
  const offset = (query.page - 1) * query.limit;
  const ordersQuery = DB.orders.orderBy('created_at').reverse();
  ordersQuery.filter(order => {
    let isMatched =
      query.startDate <= order.created_at && order.created_at <= query.endDate;
    if (query.status) {
      const pending = [
        OrderStatus.HOLD,
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
      ];
      const completed = [OrderStatus.FULFILLED, OrderStatus.CANCELLED];
      if (query.status === OrderStatus.PENDING) {
        isMatched = isMatched && pending.indexOf(order.status) !== -1;
      } else {
        isMatched = isMatched && completed.indexOf(order.status) !== -1;
      }
    }
    if (query.source) {
      isMatched = isMatched && order.source == query.source;
    }
    if (query.type) {
      isMatched = isMatched && order.type == query.type;
    }
    if (query.mall) {
      isMatched = isMatched && order.mallOrder == query.mall;
    }
    if (query.keyword) {
      const keyword = query.keyword.trim();
      let match = order.ref_id
        .toLocaleLowerCase()
        .match(keyword.toLocaleLowerCase());
      if (order.invoice_number) {
        match =
          match ||
          order.invoice_number
            .toLocaleLowerCase()
            .match(keyword.toLocaleLowerCase());
      }
      if (order.customer) {
        match = match || order.customer.mobile.match(keyword);
        // match = match || order.customer.email && order.customer.email.match(regex);
        const keywordArray = keyword.split(' ');
        if (keywordArray.length == 1) {
          match =
            match ||
            (order.customer.first_name &&
              order.customer.first_name
                .toLocaleLowerCase()
                .match(keywordArray[0].toLocaleLowerCase()));
        }
        if (keywordArray.length == 2) {
          match =
            match ||
            (order.customer.first_name &&
              order.customer.first_name.toLocaleLowerCase() ===
                keywordArray[0].toLocaleLowerCase() &&
              order.customer.last_name &&
              order.customer.last_name
                .toLocaleLowerCase()
                .match(keywordArray[1].toLocaleLowerCase()));
        }
      }
      isMatched = isMatched && !!match;
    }
    return isMatched;
  });
  return await ordersQuery.offset(offset).limit(query.limit).toArray();
};

const useOrders = (initialQuery: Query) => {
  const [query, setQuery] = useState<Query>(initialQuery);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const getOrders = async (query: Query) => {
    const results = await getFromLocal(query);
    setHasMore(results.length == query.limit);
    if (query.page > 1) {
      setOrders(orders => [...orders, ...results]);
    } else {
      setOrders(results);
    }
  };

  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const newOrders = new BroadcastChannel('new-orders');
      newOrders.onmessage = event => {
        getOrders(query);
      };
    }
  }, []);

  const loadOrders = async (query: Query) => {
    setLoading(true);
    getOrders(query);
    setLoading(false);
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  return { orders, query, setQuery, loading, hasMore, setOrders };
};

export default useOrders;
