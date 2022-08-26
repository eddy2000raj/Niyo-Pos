import { RootState } from '../redux/store';
import { ValidationError, SchemaOf } from 'yup';
import { ValidateOptions } from 'yup/lib/types';
import Product, { PriceType } from '../types/Product';
import moment from 'moment';
import Payment from '../types/Payment';
import ItemAction from '../redux/actions/cart/ItemAction';

export const formatCurrency = (
  price: number,
  symbol: boolean = true,
  roundTo: number = 2
): string => {
  let priceString = '';
  if (price < 0) {
    priceString += '-';
    price = Math.abs(price);
  }
  if (symbol) {
    priceString += '₹';
  }
  if (roundTo != -1) {
    price = round(price, roundTo);
  }
  priceString += price.toLocaleString('en-IN');
  return priceString;
};

const mapStateToApiProps = (rootState: RootState) => {
  const store = rootState.appState.store;
  return {
    token: rootState.appState.token,
    storeId: store ? store.id : null,
  };
};

const round = (value: number, precision: number): number => {
  //TODO: Fix round off issues in javascript
  let rounded = value;
  const multiplicator = Math.pow(10, precision);
  rounded = parseFloat((rounded * multiplicator).toFixed(11));
  rounded = Math.round(rounded) / multiplicator;
  return +rounded.toFixed(precision);
};

const mapValidationError = (error: ValidationError) => {
  if (error.inner.length == 0) {
    if (error.path) {
      return { [error.path]: error.errors };
    }
    return error.errors;
  }
  let errorObject: any = {};
  error.inner.forEach(validationError => {
    errorObject = {
      ...errorObject,
      ...mapValidationError(validationError),
    };
  });
  return errorObject;
};

const validate = (
  schema: SchemaOf<any>,
  value: any,
  options?: ValidateOptions
) => {
  try {
    const validateOptions = { abortEarly: false, ...options };
    schema.validateSync(value, validateOptions);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return mapValidationError(err);
    }
    throw err;
  }
  return {};
};

const uomCode = (uom: string) => {
  let unitCode: string = '';
  switch (uom) {
    case 'kilogram':
      unitCode = 'kg';
      break;
    case 'piece':
      unitCode = 'pc';
      break;
  }

  return unitCode;
};

const unique = (array: string[]) => {
  const seen: any = {};
  return array.filter(item => {
    return seen[item] ? false : (seen[item] = true);
  });
};

const isPresent = (haystack: string[], needles: string[]) => {
  for (const needle of needles) {
    if (haystack.includes(needle)) {
      return true;
    }
  }
  return false;
};

const getPrice = (product: Product) => {
  const dynamicPrice = product.prices?.find(
    price =>
      price.type == PriceType.RETAIL &&
      price.min_quantity <= 1 &&
      1 <= price.max_quantity &&
      (!price.valid_till || moment().unix() < price.valid_till)
  );

  return dynamicPrice?.value ?? product.price;
};

const toWord = (n: number) => {
  var num =
    'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(
      ' '
    );
  var tens = 'twenty thirty forty fifty sixty seventy eighty ninety'.split(' ');
  if (n < 20) return num[n];
  var digit = n % 10;
  if (n < 100) return tens[~~(n / 10) - 2] + (digit ? ' ' + num[digit] : '');
  if (n < 1000)
    return (
      num[~~(n / 100)] +
      ' hundred' +
      (n % 100 == 0 ? '' : ' ' + toWord(n % 100))
    );
  return (
    toWord(~~(n / 1000)) +
    ' thousand' +
    (n % 1000 != 0 ? ' ' + toWord(n % 1000) : '')
  );
};

const isGasOilProduct = tags => {
  let isGasOil: boolean = false;
  tags.forEach(tag => (parseInt(tag.id) === 1 ? (isGasOil = true) : null));
  return isGasOil;
};

const calcItemDiscount = item => {
  let price = item.product.price;
  let min_price = item.product.min_price;
  if (item.product.prices.length > 0) {
    const priceObj = ItemAction.getPriceObj(item, PriceType.RETAIL);
    price = priceObj.value;
    min_price = priceObj.min_price;
  }
  const discount_percent = (price - min_price) / price;
  return (
    discount_percent * price * item.quantity -
    (price - parseFloat(item.price)) * item.quantity
  );
};

const compareMinVersion = (min_version: number, current_version: number) => {
  if (min_version > current_version) {
    return true;
  } else {
    return false;
  }
};

const mergePayments = (payments: Payment[]) => {
  const holder = {};
  payments.forEach(payment => {
    if (holder.hasOwnProperty(payment.method)) {
      holder[payment.method] =
        round(holder[payment.method], 0) + round(payment.value, 0);
    } else {
      holder[payment.method] = payment.value;
    }
  });

  const finalPayments = [];

  for (const method in holder) {
    finalPayments.push({ method: method, value: holder[method] });
  }
  return finalPayments;
};

const crypt = (salt, text) => {
  const textToChars = text => text.split('').map(c => c.charCodeAt(0));
  const byteHex = n => ('0' + Number(n).toString(16)).substr(-2);
  const applySaltToChar = code =>
    textToChars(salt).reduce((a, b) => a ^ b, code);
  const newText = text
    .split('')
    .map(textToChars)
    .map(applySaltToChar)
    .map(byteHex)
    .join('');
  return newText;
};

const decrypt = (salt, encoded) => {
  if (typeof encoded === 'object') encoded = crypt(salt, encoded);
  const textToChars = text => text.split('').map(c => c.charCodeAt(0));
  const applySaltToChar = code =>
    textToChars(salt).reduce((a, b) => a ^ b, code);
  return encoded
    .match(/.{1,2}/g)
    .map(hex => parseInt(hex, 16))
    .map(applySaltToChar)
    .map(charCode => String.fromCharCode(charCode))
    .join('');
};

export default {
  formatCurrency,
  mapStateToApiProps,
  round,
  validate,
  uomCode,
  unique,
  isPresent,
  getPrice,
  toWord,
  isGasOilProduct,
  calcItemDiscount,
  compareMinVersion,
  mergePayments,
  crypt,
  decrypt,
};
