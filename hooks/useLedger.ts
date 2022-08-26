import { useEffect, useState } from 'react';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';
import Toolkit from '../utils/Toolkit';
import LedgerApi from '../apis/LedgerApi';

interface Query {
  page: number;
  start_date: string;
  end_date: string;
  sort_type?: string;
  filters: Array<String>;
}

const useLedger = (initialQuery: Query) => {
  // const [page, setPage] = useState<number>(initialPage);
  const [query, setQuery] = useState<Query>(initialQuery);
  const [results, setResults] = useState([]);
  const [ledgerFilters, setLedgerFilters] = useState([]);
  const [balance, setBalance] = useState<{ [prop: string]: number[] }>({});
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const rootState = useSelector((state: RootState) => state);
  const apiProps = Toolkit.mapStateToApiProps(rootState);

  const loadResults = async (query: Query) => {
    setLoading(true);
    const api = new LedgerApi(apiProps);
    const response = await api.fetch(query);
    const ledger = response.data.data;
    const ledgerFilters = response.data.filters;
    const meta = response.data.meta;
    setBalance({
      ending_bal: response.data.ending_balance,
      starting_bal: response.data.starting_balance,
      credit_sum: response.data.credit_sum,
      debit_sum: response.data.debit_sum,
      total_pending_return_value: response.data.total_pending_return_value,
      commission_earned: response.data.commission_earned,
    });
    setHasMore(meta && meta.current_page != meta.last_page);
    setLedgerFilters(ledgerFilters);
    if (query.page > 1) {
      setResults([...results, ...ledger]);
    } else {
      setResults(ledger);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadResults(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  return { results, ledgerFilters, query, setQuery, loading, hasMore, balance };
};

export default useLedger;
