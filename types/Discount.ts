import Rule from './Rule';

export default interface Discount {
  discount: number;
  rule: Rule | null;
}
