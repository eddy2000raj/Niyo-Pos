import JsCookies from 'js-cookie';

export enum CookieName {
  TOKEN = 'token',
  STORE = 'store',
}

const get = (name: string, defaultValue: any) => {
  const value = JsCookies.get(name);
  return value || defaultValue;
};

const set = (name: string, value: any, days: number) => {
  JsCookies.set(name, value, { expires: days });
};

const remove = (name: string) => {
  JsCookies.remove(name);
};

export default { get, set, remove };
