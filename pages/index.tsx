import { NextPage } from 'next';
import { useState, useEffect } from 'react';
import Page from '../layouts/Page';
import Search from '../components/sell/Search';
import Cart from '../components/sell/Cart';
import FastSale from '../components/sell/FastSale';
import Payment from '../components/sell/Payment';
import SaleActions from '../components/sell/SaleActions';
import useCart from '../hooks/useCart';
import Receipt from '../components/sell/ReceiptPage';
import Order from '../types/Order';
import Permissions from '../utils/Permissions';
import { useRouter } from 'next/router';
import { Step } from '../types/Step';

const SellPage: NextPage = () => {
  const [step, setStep] = useState(Step.CART);
  const [order, setOrder] = useState<Order>(null);
  const { complete, resetPayments } = useCart();

  const completeOrder = async () => {
    const order = await complete();
    setOrder(order);
    setStep(Step.RECEIPT);
  };

  const moveToPayment = async () => {
    await resetPayments();
    setStep(Step.PAYMENT);
  };

  const router = useRouter();
  useEffect(() => {
    const isRoleAuthorized = Permissions.roleHasPermission(router.asPath);
    if (!isRoleAuthorized) router.push(Permissions.getRoutes()[0]);
  }, []);

  return (
    <Page>
      {step == Step.CART && (
        <div className="grid gutter-md h-full">
          <div className="col-12 col-sm-7">
            <div className="grid h-full">
              <div className="flex vertical col grow">
                <Search />
                {/* <div className="mt-sm fast-sale-container">
                  <FastSale />
                </div> */}
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-5">
            <div className="grid h-full">
              <div className="grid vertical col grow">
                <SaleActions />
                <div className="col grow card grid vertical gutter-between mt-md">
                  <Cart moveToPayment={moveToPayment} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step == Step.PAYMENT && (
        <Payment
          moveToCart={() => setStep(Step.CART)}
          complete={completeOrder}
        />
      )}

      {step == Step.RECEIPT && (
        <Receipt order={order} moveToCart={() => setStep(Step.CART)} />
      )}
    </Page>
  );
};

export default SellPage;
