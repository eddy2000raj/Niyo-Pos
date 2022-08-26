import { useEffect, useState } from 'react';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';
import Toolkit from '../utils/Toolkit';
import ShipmentsApi from '../apis/ShipmentsApi';
import ReturnsApi from '../apis/ReturnsApi';

export const SHIPMENT_PURCHASE = 'purchase';
export const SHIPMENT_RETURN = 'return';

const useShipments = (initialPage: number, startDate, endDate) => {
  const [page, setPage] = useState<number>(initialPage);
  const [dateRange, setDateRange] = useState({ startDate, endDate });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [type, setType] = useState(SHIPMENT_PURCHASE);

  const rootState = useSelector((state: RootState) => state);
  const apiProps = Toolkit.mapStateToApiProps(rootState);

  const loadResults = async (page: number, dateRange) => {
    if (!dateRange.startDate || !dateRange.endDate) return;
    setLoading(true);
    const api =
      type == 'purchase'
        ? new ShipmentsApi(apiProps)
        : new ReturnsApi(apiProps);
    const response = await api.fetch({
      page: page,
      start_date: dateRange.startDate.format('YYYY-MM-DD'),
      end_date: dateRange.endDate.format('YYYY-MM-DD'),
    });
    const shipments = response.data.data;
    const meta = response.data.meta;

    setHasMore(meta.current_page != meta.last_page);
    if (page > 1) {
      setResults([...results, ...shipments]);
    } else {
      setResults(shipments);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadResults(page, dateRange);
    }, 200);
    return () => clearTimeout(timer);
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadResults(1, dateRange);
    }, 200);
    return () => clearTimeout(timer);
  }, [type, dateRange]);

  return {
    results,
    dateRange,
    setDateRange,
    page,
    setPage,
    loading,
    hasMore,
    type,
    setType,
  };
};

export default useShipments;
