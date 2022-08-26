import { ShippingAddress } from '../types/Order';

const getAddressLine = (shippingAddress: ShippingAddress): string => {
  if (shippingAddress) {
    let addressLine = [
      shippingAddress.line_1,
      shippingAddress.line_2,
      shippingAddress.line_3,
    ];
    addressLine = addressLine.filter(line => line != null);
    return addressLine.join(', ');
  }
  return '';
};

export default { getAddressLine };
