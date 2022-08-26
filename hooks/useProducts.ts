import { useState } from 'react';
import Product from '../types/Product';
import DB from '../utils/database/DB';

type returnType = [
  Product[],
  string,
  (keyword: string, callIsScanner?: boolean) => void,
  boolean
];
const useProducts = (value: string = ''): returnType => {
  const [query, setQuery] = useState(value);
  const [products, setProducts] = useState<Product[]>([]);
  const [timer, setTimer] = useState(null);
  const [isLoading, setIsLoading] = useState(null);

  const searchBarcode = async (barcode: string) => {
    const results = await DB.products
      .where('barcode')
      .equals(barcode)
      .limit(10)
      .toArray();
    return results;
  };

  const searchText = async (keyword: string) => {
    let timerId: any;
    clearTimeout(timer);
    const timeOutPromise = new Promise<Product[]>(resolve => {
      timerId = setTimeout(async () => {
        const keywords = keyword
          .toLowerCase()
          .split(' ')
          .filter(el => el);
        const allKeys = await Promise.all(
          keywords.map(keyword =>
            DB.products.where('keywords').startsWith(keyword).primaryKeys()
          )
        );
        const intersectKeys: any = allKeys.reduce(
          (a: Array<number>, b: Array<number>) => {
            const set = new Set(b);
            return a.filter(k => set.has(k));
          }
        );
        const results = await DB.products
          .where(':id')
          .anyOf(intersectKeys)
          .limit(30)
          .reverse()
          .sortBy('stock');
        resolve(results);
      }, 300);
    });
    setTimer(timerId);
    return timeOutPromise;
  };

  const changeQuery = async (keyword: string, callIsScanner = false) => {
    let results: Product[] = [];
    setQuery(keyword);
    keyword = keyword.trim();

    if (keyword.length <= 2) {
      setProducts(results);
      return;
    }
    if (keyword == query.trim()) {
      return;
    }
    setIsLoading(true);
    results = callIsScanner
      ? await searchBarcode(keyword)
      : await searchText(keyword);
    setProducts(results);
    setIsLoading(false);
  };

  return [products, query, changeQuery, isLoading];
};

export default useProducts;
