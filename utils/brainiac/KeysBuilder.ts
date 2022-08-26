import Rule, { Type, Attribute, Operator } from '../../types/Rule';
import Provider from './providers/Provider';
import Toolkit from '../Toolkit';

// Only string attributes. Number type attributes should not be added here.
// Pattern - Type Product: type&brand&category&tag&product
// Pattern - Type Order: type&brand&category&tag

const getIndexAttributes = (type: Type) => {
  if (type == Type.PRODUCT) {
    return [
      Attribute.BRAND,
      Attribute.CATEGORY,
      Attribute.TAG,
      Attribute.PRODUCT,
    ];
  }
  return [Attribute.BRAND, Attribute.CATEGORY];
};

const fromRule = (rule: Rule) => {
  let indexes: any = [rule.type];
  for (const indexAttribute of getIndexAttributes(rule.type)) {
    const values = rule.attributes[indexAttribute]?.[Operator.EQUAL]?.map(
      expression => expression.value
    );
    indexes = buildIndexes(indexes, values || ['']);
  }
  // console.log("db indexes", rule.id, indexes);
  return indexes;
};

const fromProvider = (type: Type, provider: Provider) => {
  let indexes: any = [type];
  for (const indexAttribute of getIndexAttributes(type)) {
    const value = provider[indexAttribute]() || [];
    const values = Array.isArray(value) ? value : [value];
    values.push('');
    indexes = buildIndexes(indexes, values);
  }
  return Toolkit.unique(indexes);
};

const buildIndexes = (
  prefixes: [string, ...string[]],
  suffixes: (string | number)[]
) => {
  const indexes = [];
  for (const prefix of prefixes) {
    for (const suffix of suffixes) {
      indexes.push(prefix + '&' + suffix);
    }
  }
  return indexes;
};

export default { fromRule, fromProvider };
