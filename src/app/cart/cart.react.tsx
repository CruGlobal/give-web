import angular from 'angular';
import { react2angular } from 'react2angular';

import { useGetCartQuery } from './cart.generated';
import { CartItem } from './cartItem/cartItem.react';


const componentName = 'CartReact'

interface CartProps {

}

const CartReact = () => {

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

const Cart = angular
  .module(componentName)
  .component(componentName, react2angular(CartReact));

export { Cart, CartReact }