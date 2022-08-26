import React from 'react';
import Print from './Print';
import Order, { OrderStatus } from '../types/Order';
import { OrderItemStatus } from '../types/OrderItem';
import Storage, { StorageKey } from '../utils/Storage';
import Toolkit from '../utils/Toolkit';
import OrderHelper from '../utils/OrderHelper';
import moment from 'moment';

interface Props {
  order: Order;
  hidden?: boolean;
}

const ReceiptFormat = ({ order, hidden = true }: Props) => {
  if (
    [OrderStatus.HOLD, OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(
      order.status
    )
  ) {
    return null;
  }
  const store = Storage.get(StorageKey.STORE, null);
  let mrpTotal = 0;
  let fulfilledTotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let taxBreakup = [];
  let appliedOffers = [];

  cgstTotal = Math.abs(
    order.items.reduce((n, { taxes }) => taxes.length && n + taxes[0].value, 0)
  );
  sgstTotal = Math.abs(
    order.items.reduce((n, { taxes }) => taxes.length && n + taxes[1].value, 0)
  );

  order.items
    .filter(item => item.status == OrderItemStatus.FULFILLED)
    .forEach(item => {
      const priceExclTaxes = item.subtotal - item.discount;
      if (item.taxes.length > 0) {
        taxBreakup.push({
          item: item.product.name,
          hsn_code: item.product.hsn_sac_code,
          cgst_value: item.taxes[0].value,
          cgst_percentage: item.taxes[0].percentage,
          sgst_value: item.taxes[1].value,
          sgst_percentage: item.taxes[1].percentage,
          onAmount: priceExclTaxes,
          mrp: item.mrp,
        });
      }

      item.discounts
        .filter(discount => discount.rule && discount.rule.type == 'order')
        .forEach(discount => {
          let exists = false;
          appliedOffers = appliedOffers.map(offer => {
            if (offer.id == discount.rule.id) {
              exists = true;
              return { ...offer, value: offer.value + discount.discount };
            }
            return offer;
          });

          if (!exists) {
            appliedOffers.push({
              id: discount.rule.id,
              name: discount.rule.title,
              value: discount.discount,
            });
          }
        });
    });
  const finalPayments = Toolkit.mergePayments(order.payments);

  return (
    <Print hidden={hidden}>
      <div className="center">
        <img
          src="/images/fill-text.png"
          alt="logo"
          style={{ maxWidth: '75px' }}
        />
        <div
          className="semi-bold"
          style={{
            fontSize: 'larger',
          }}
        >
          {store.name}
        </div>
        <div>{store.address}</div>
        <div>
          {store.city}, {store.state}
        </div>
        <div>Pincode: {store.pincode}</div>
        {store.mobile && <div>Mobile: {store.mobile}</div>}
        {store.fssai_license && <div>FASSAI: {store.fssai_license}</div>}
        {store.gstin && <div>GSTIN: {store.gstin}</div>}
        {order.total < 0 ? (
          <div className="bold mt-sm"> Credit Note </div>
        ) : (
          <div className="bold mt-sm">
            {' '}
            {store.gstin && !store.settings.composite_gst && `Tax`} Invoice
          </div>
        )}
      </div>
      <div className="dash mt-sm"></div>
      <div className="mt-sm">
        Order ID:{' '}
        <span style={{ textTransform: 'uppercase' }}>{order.ref_id}</span>
      </div>
      <div>
        Source:{' '}
        <span style={{ textTransform: 'uppercase' }}>{order.source || ''}</span>
      </div>
      <div className="mt-sm">Invoice No.: {order.invoice_number}</div>
      <div>
        Invoice Date.: {moment.unix(order.invoiced_at).format('Do MMMM YYYY')}
      </div>
      <div>Print Time: {moment().format('Do MMM YYYY, h:mm a')}</div>
      {order.customer && (
        <div>
          Customer:{' '}
          {(order.customer.first_name || '') +
            ' ' +
            (order.customer.last_name || '')}
        </div>
      )}
      {order.shipping_address && (
        <div>
          Address: {OrderHelper.getAddressLine(order.shipping_address)},{' '}
          {order.shipping_address.city} - {order.shipping_address.pincode}
        </div>
      )}
      {order.customer && <div>Mobile: {order.customer.mobile}</div>}
      {store.gstin && (
        <div>
          Place of supply: <span>{store.state || ''}</span>
        </div>
      )}
      <div className="dash mt-sm"></div>
      {/* table start */}
      <table style={{ width: '100%', tableLayout: 'fixed' }}>
        {/* <thead> */}
        <tr>
          <th className="left">#</th>
          <th className="left">Item</th>
          <th className="left">Qty</th>
          <th className="left">MRP</th>
          <th className="left">Disc</th>
          <th className="right" colSpan={2}>
            Total
          </th>
        </tr>
        <tr>
          <th className="left"></th>
          <th className="left">
            {store.gstin && !store.settings.composite_gst && 'GST Rate'}
          </th>
          <th className="left">
            {store.gstin && !store.settings.composite_gst && 'Base Amt'}
          </th>
          <th className="left">
            {store.gstin && !store.settings.composite_gst && 'CGST'}
          </th>
          <th className="left">
            {store.gstin && !store.settings.composite_gst && 'SGST'}
          </th>
          <th className="right"></th>
        </tr>
        {/* </thead> */}
        <br />
        <tbody>
          {order.items
            .filter(item => item.status != OrderItemStatus.CANCELLED)
            .map((item, index) => {
              if (item.status != OrderItemStatus.RETURNED) {
                const itemDiscount =
                  item.product.mrp * item.quantity - item.total;
                mrpTotal += item.product.mrp * item.quantity;
                fulfilledTotal += item.total;
                const totalGstPercentage =
                  item.taxes[0]?.percentage + item.taxes[1]?.percentage || 0;
                return (
                  <React.Fragment key={item.id}>
                    <tr style={{ fontWeight: 600 }}>
                      <td style={{ verticalAlign: 'top' }}>{++index}</td>
                      <td colSpan={6}>{item.product.name}</td>
                    </tr>
                    <tr>
                      <td></td>
                      <td>
                        {store.gstin &&
                          !store.settings.composite_gst &&
                          ` HSN: ${item.product.hsn_sac_code}`}
                      </td>
                      <td>{item.quantity}</td>
                      <td>{Toolkit.round(item.product.mrp, 2)}</td>
                      <td>{Toolkit.round(itemDiscount, 2)}</td>
                      <td colSpan={2} className="right">
                        {(!store.gstin || store.settings.composite_gst) &&
                          Toolkit.formatCurrency(item.total)}
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td>
                        {store.gstin &&
                          !store.settings.composite_gst &&
                          ` GST: ${totalGstPercentage}%`}
                      </td>
                      <td>
                        {store.gstin &&
                          !store.settings.composite_gst &&
                          Toolkit.formatCurrency(item.subtotal - item.discount)}
                      </td>
                      <td>
                        {store.gstin &&
                          !store.settings.composite_gst &&
                          Toolkit.formatCurrency(item.taxes[0]?.value || 0)}
                      </td>
                      <td>
                        {store.gstin &&
                          !store.settings.composite_gst &&
                          Toolkit.formatCurrency(item.taxes[1]?.value || 0)}
                      </td>
                      <td colSpan={2} className="right">
                        {store.gstin &&
                          !store.settings.composite_gst &&
                          Toolkit.formatCurrency(item.total)}
                      </td>
                    </tr>
                    <br />
                  </React.Fragment>
                );
              } else {
                const itemDiscount =
                  item.product.mrp * item.quantity - item.total;
                const totalGstPercentage =
                  item.taxes[0]?.percentage + item.taxes[1]?.percentage || 0;
                return (
                  <React.Fragment key={item.id}>
                    <tr style={{ fontWeight: 600 }}>
                      <td style={{ verticalAlign: 'top' }}>{++index}</td>
                      <td colSpan={5}>{item.product.name} (Returned)</td>
                    </tr>
                    <tr>
                      <td></td>
                      <td>
                        {store.gstin &&
                          !store.settings.composite_gst &&
                          ` HSN: ${item.product.hsn_sac_code}`}
                      </td>
                      <td>{Math.abs(item.quantity)}</td>
                      <td>{Toolkit.round(item.product.mrp, 2)}</td>
                      <td>{Toolkit.round(itemDiscount, 2)}</td>
                      <td colSpan={2} className="right">
                        {(!store.gstin || store.settings.composite_gst) &&
                          Toolkit.formatCurrency(item.total)}
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td>
                        {store.gstin &&
                          !store.settings.composite_gst &&
                          ` GST: ${totalGstPercentage}%`}
                      </td>
                      <td>
                        {store.gstin &&
                          !store.settings.composite_gst &&
                          Toolkit.formatCurrency(Math.abs(item.subtotal))}
                      </td>
                      <td>
                        {store.gstin &&
                          !store.settings.composite_gst &&
                          Toolkit.formatCurrency(
                            Math.abs(item.taxes[0]?.value || 0)
                          )}
                      </td>
                      <td>
                        {store.gstin &&
                          !store.settings.composite_gst &&
                          Toolkit.formatCurrency(
                            Math.abs(item.taxes[1]?.value || 0)
                          )}
                      </td>
                      <td colSpan={2} className="right">
                        {store.gstin &&
                          !store.settings.composite_gst &&
                          Toolkit.formatCurrency(item.total)}
                      </td>
                    </tr>
                    <br />
                  </React.Fragment>
                );
              }
            })}
        </tbody>
      </table>
      {/* table end */}
      {store.gstin && !store.settings.composite_gst && (
        <>
          <div className="dash mt-md"></div>
          <div className="mt-sm grid gutter-sm semi-bold">
            <div className="col-4">Sub-total (Taxable Value)</div>
            <div className="col-1 center"></div>
            <div className="col-7 right">
              {Toolkit.formatCurrency(Math.abs(order.subtotal))}
            </div>
          </div>
          <div className="mt-sm grid gutter-sm semi-bold">
            <div className="col-4">CGST</div>
            <div className="col-1 center"></div>
            <div className="col-7 right">
              {Toolkit.formatCurrency(cgstTotal)}
            </div>
          </div>
          <div className="mt-sm grid gutter-sm semi-bold">
            <div className="col-4">SGST</div>
            <div className="col-1 center"></div>
            <div className="col-7 right">
              {Toolkit.formatCurrency(sgstTotal)}
            </div>
          </div>
          <div className="mt-sm grid gutter-sm semi-bold">
            <div className="col-4">Total Tax</div>
            <div className="col-1 center"></div>
            <div className="col-7 right">
              {Toolkit.formatCurrency(Math.abs(order.tax))}
            </div>
          </div>
        </>
      )}
      <div className="dash mt-md"></div>
      <div className="mt-sm grid gutter-sm semi-bold">
        {/* <div className="col-1"></div> */}
        <div className="col-2">Total</div>
        <div className="col-3 center">
          {order.items
            .filter(item => item.status == OrderItemStatus.FULFILLED)
            .reduce((total, item) => total + item.quantity, 0)}
        </div>
        <div className="col-7 right">
          {Toolkit.formatCurrency(Math.abs(order.total))}
          <br />

          <span style={{ textTransform: 'capitalize' }}>
            {' '}
            ({Toolkit.toWord(Math.abs(order.total))} only)
          </span>
        </div>
      </div>
      <div className="dash mt-sm"></div>
      {mrpTotal - fulfilledTotal > 0 && (
        <div className="mt-sm right semi-bold">
          Your savings on MRP is{' '}
          {Toolkit.formatCurrency(mrpTotal - fulfilledTotal)}
        </div>
      )}

      {order.total < 0 && (
        <div className="right semi-bold mt-xs">
          Your total refund is {Toolkit.formatCurrency(Math.abs(order.total))}
        </div>
      )}
      <div className="gutter-between grid">
        <div>
          <div>
            <div>
              {order.total > 0
                ? 'Total amount to be paid'
                : 'Total Credit Note'}
            </div>
            {finalPayments.map(payment => {
              return (
                <div key={payment.method + payment.value} className="upper">
                  {payment.method + ': '}{' '}
                  {Toolkit.formatCurrency(Math.abs(payment.value))}
                </div>
              );
            })}
          </div>
          {appliedOffers.length ? (
            <div className="mt-sm">
              <div>Applied Offers:</div>
              {appliedOffers.map(offer => {
                return (
                  <React.Fragment key={offer.name}>
                    <div>Offer: {offer.name}</div>
                    <div>Discount: {Toolkit.formatCurrency(offer.value)}</div>
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            ''
          )}
        </div>
      </div>

      <div className="center mt-md">Thank you for your visit!</div>
      <div
        className="center mt-md"
        style={{
          fontSize: 'larger',
        }}
      >
        Download <span className="bold">1K Kirana</span> app to get additional
        discounts.
      </div>
      <div className="center mt-md">
        <img
          src="/images/android-app-banner.png"
          alt="app-banner"
          style={{ maxHeight: '40px' }}
        />
      </div>
      <h2 className="md mt-md">Return Policy*</h2>
      <p>
        EXCHANGE/RETURN WITHIN 7 DAYS OF PURCHASE **Only quality issues will be
        liable for return or exchange Any Exchange must be accompanied with
        Original bill.
      </p>
      <p>
        For any complaint or suggestions: Email to support@1knetworks.com or
        call us at 080 4502 9111
      </p>
    </Print>
  );
};

export default ReceiptFormat;
