import { Attribute, Attributes, Expression } from '../../../types/Rule';

export type Params = {
  [key in Attribute]?: OperatorValues;
};

export type OperatorValues = {
  equal?: string[];
  unequal?: string[];
};

export default abstract class Provider {
  isNumber = (attribute: Attribute) => {
    return [
      Attribute.PRICE,
      Attribute.QUANTITY,
      Attribute.TOTAL_AMOUNT,
      Attribute.TOTAL_QUANTITY,
      Attribute.CART_AMOUNT,
      Attribute.CART_QUANTITY,
    ].includes(attribute);
  };

  getParams = (attributes: Attributes) => {
    const params: Params = {};
    Object.keys(attributes).forEach((attribute: Attribute) => {
      if (!this.isNumber(attribute)) {
        const operators = {};
        const operatorExpressions = attributes[attribute];
        Object.keys(operatorExpressions).forEach(operator => {
          const expressions: Expression[] = operatorExpressions[operator];
          operators[operator] = expressions.map(expression => {
            return expression.value;
          });
        });
        params[attribute] = operators;
      }
    });
    return params;
  };
}
