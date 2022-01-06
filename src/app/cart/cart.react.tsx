import angular from 'angular';
import { react2angular } from 'react2angular';

import { useGetCartQuery } from './cart.generated';
import { CartItem } from './cartItem/cartItem.react';


const componentName = 'cartReact'

interface CartProps {

}

const Cart = () => {

  const { data, loading } = useGetCartQuery();

  const nextDrawDate = data?.nextDrawDate || null;
  const gifts = data?.cart?.gifts || [];

  return (
    <table style={{ flex: 1 }}>
      <thead>
        <tr>
          <th>Gift</th>
          <th>Frequency</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        { loading ? (
            <div>
              <text>Loading</text>
            </div>
          ) : gifts && nextDrawDate ? (
            gifts?.map(gift => (<CartItem item={gift} nextDrawDate={nextDrawDate} />))
          ) : null }
      </tbody>
    </table>
  );
};

const CartReact = angular
  .module(componentName, [])
  .component(componentName, react2angular(Cart));

export { Cart, CartReact }