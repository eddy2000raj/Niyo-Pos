import Toolkit from './Toolkit';

export enum StorageKey {
  TOKEN = 'token',
  USER = 'user',
  STORE = 'store',
  SYNCS = 'syncs',
  LAST_RECEIPT = 'last_receipt',
  FCM_TOKEN = 'fcm_token',
  IS_LOGIN = 'is_login',
  SERVER_TIME = 'server_time',
  GATEWAY_TOKEN = 'gateway_token',
  TOKEN_GATEWAY = 'token_gateway',
  LAST_UPDATED_TIME = 'last_updated_time',
}
const encryptValues = [
  StorageKey.STORE,
  StorageKey.USER,
  StorageKey.LAST_RECEIPT,
];

const get = (key: StorageKey, defaultValue: any) => {
  const valueJsonString = localStorage.getItem(key);
  if (!valueJsonString) return defaultValue;
  let value = valueJsonString;
  let flag = true;
  try {
    if (JSON.parse(value) || typeof value === 'number') {
      flag = false;
    }
  } catch (e) {
    flag = true;
  }
  const toDecrypt = encryptValues.includes(key) && flag;
  if (toDecrypt) {
    value = Toolkit.decrypt(process.env.NEXT_PUBLIC_ENCRYPT_SALT, value);
  }
  if (JSON.parse(value)) {
    value = JSON.parse(value);
  }
  return value;
};

const set = (key: StorageKey, value: any) => {
  let data = JSON.stringify(value);
  const toEncrypt = encryptValues.includes(key);
  if (toEncrypt) {
    data = Toolkit.crypt(process.env.NEXT_PUBLIC_ENCRYPT_SALT, data);
  }
  localStorage.setItem(key, data);
};

const remove = (key: StorageKey) => {
  localStorage.removeItem(key);
};

const clear = () => {
  localStorage.clear();
};

export default { get, set, remove, clear };
