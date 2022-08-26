import Dexie from 'dexie';
import Cart from '../../types/Cart';
import Order from '../../types/Order';
import Product from '../../types/Product';
import Customer from '../../types/Customer';
import Storage, { StorageKey } from '../Storage';
import Rule from '../../types/Rule';
import KeysBuilder from '../brainiac/KeysBuilder';
import { OrderItemSource } from '../../types/OrderItem';
import { Transaction } from '@sentry/types';

const stopWords = ['$', '%', 'a', 'the', '&', 'rs', '+'];

class DB extends Dexie {
  products: Dexie.Table<Product, number>;
  customers: Dexie.Table<Customer, string>;
  carts: Dexie.Table<Cart, string>;
  orders: Dexie.Table<Order, string>;
  rules: Dexie.Table<Rule, string>;
  app_order_associated_rules: Dexie.Table<Rule, string>;
  transactions: Dexie.Table<Transaction, string>;

  constructor(name: string) {
    super(name);

    this.version(1).stores({
      carts: 'id',
      orders: 'id,synced',
      products: 'id,name,barcode,fast_sale',
      customers: 'id, &mobile, first_name, last_name',
    });

    this.version(2)
      .stores({
        products: 'id,barcode,fast_sale,*keywords',
      })
      .upgrade(tx => {
        tx.table('products').clear();
        tx.on('complete', function () {
          console.log('product schema upgraded');
          Storage.remove(StorageKey.SYNCS);
          window.location.reload();
        });
      });

    this.version(3).stores({ products: 'id,barcode,*keywords,*fast_tags' });
    this.version(4).stores({ orders: 'id,ref_id,synced,created_at' });
    this.version(5)
      .stores({ orders: 'id,ref_id,synced,created_at,*return_item_ids' })
      .upgrade(tx => {
        tx.on('complete', function () {
          Storage.remove(StorageKey.SYNCS);
          window.location.reload();
        });
      });
    this.version(6).stores({ rules: 'id, *keys' });
    this.version(7).stores({ app_order_associated_rules: 'id, *keys' });
    this.version(8).stores({
      transactions: 'id,created_at',
    });

    this.products = this.table('products');
    this.customers = this.table('customers');
    this.carts = this.table('carts');
    this.orders = this.table('orders');
    this.rules = this.table('rules');
    this.app_order_associated_rules = this.table('app_order_associated_rules');
    this.transactions = this.table('transactions');

    this.products.hook('creating', (primaryKey, obj, transaction) => {
      obj.keywords = this.getAllWords(obj.name);
      if (obj.barcode) {
        obj.keywords.push(obj.barcode.toLowerCase());
      }
    });

    this.products.hook('updating', (mods, primaryKey, obj, transaction) => {
      const keywords = this.getAllWords(obj.name);
      if (obj.barcode) {
        keywords.push(obj.barcode.toLowerCase());
      }
      return { keywords: keywords };
    });

    this.orders.hook('creating', (primaryKey, obj, transaction) => {
      obj.return_item_ids = obj.items.reduce((ids, item) => {
        if (item.parent_item && item.source != OrderItemSource.OFFER) {
          return ids.concat(item.parent_item.id);
        }
        return ids;
      }, []);
    });

    this.orders.hook('updating', (mods, primaryKey, obj, transaction) => {
      let itemIds = obj.items.reduce((ids, item) => {
        if (item.parent_item && item.source != OrderItemSource.OFFER) {
          return ids.concat(item.parent_item.id);
        }
        return ids;
      }, []);
      return { return_item_ids: itemIds };
    });

    this.rules.hook('creating', (primaryKey, obj, transaction) => {
      obj.keys = KeysBuilder.fromRule(obj);
    });

    this.rules.hook('updating', (mods, primaryKey, obj, transaction) => {
      return { keys: KeysBuilder.fromRule(obj) };
    });

    this.app_order_associated_rules.hook(
      'creating',
      (primaryKey, obj, transaction) => {
        obj.keys = KeysBuilder.fromRule(obj);
      }
    );

    this.app_order_associated_rules.hook(
      'updating',
      (mods, primaryKey, obj, transaction) => {
        return { keys: KeysBuilder.fromRule(obj) };
      }
    );
  }

  getAllWords(text: string) {
    let allWordsIncludingDups = text.split(' ');
    let wordSet = allWordsIncludingDups.reduce(function (prev, current) {
      if (current && stopWords.indexOf(current) == -1) {
        prev[current.toLowerCase()] = true;
      }
      return prev;
    }, {});
    return Object.keys(wordSet);
  }
}

export default new DB('NiyoDB');
