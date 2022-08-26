import { useState } from 'react';
import Customer from '../types/Customer';
import DB from '../utils/database/DB';

type returnType = [Customer[], string, (keyword: string) => Promise<any>];
const useCustomers = (value: string = ''): returnType => {
  const [query, setQuery] = useState(value);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const changeQuery = async (keyword: string) => {
    setQuery(keyword);
    // TODO: Improve Search Algorithm
    const updatedKeyword = keyword.trim();
    const keywordArray = updatedKeyword.split(' ');
    if (keywordArray.length == 1) {
      const results = await DB.customers
        .filter(item => {
          const name = item.first_name ? item.first_name.toLowerCase() : '';
          if (
            name.match(keywordArray[0].toLowerCase()) ||
            item.mobile.match(keywordArray[0])
          ) {
            return true;
          }
          return false;
        })
        .limit(15)
        .toArray();
      setCustomers(results);
    } else if (keywordArray.length == 2) {
      const results = await DB.customers
        .filter(item => {
          const firstName = item.first_name
            ? item.first_name.toLowerCase()
            : '';
          const lastName = item.last_name ? item.last_name.toLowerCase() : '';
          if (
            firstName === keywordArray[0].toLowerCase() &&
            lastName.match(keywordArray[1].toLocaleLowerCase())
          ) {
            return true;
          }
          return false;
        })
        .limit(15)
        .toArray();
      setCustomers(results);
    } else {
      setCustomers([]);
    }
  };

  return [customers, query, changeQuery];
};

export default useCustomers;
