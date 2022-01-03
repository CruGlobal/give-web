import angular from 'angular';
import { table } from 'console';
import { react2angular } from 'react2angular';
import { useGetCartQuery, Gift, GiftRecurrenceFrequency } from './cart.generated';


const componentName = 'CartReact'

interface CartProps {

}

const CartReact = () => {

  const { data, loading } = useGetCartQuery();

  const gifts: Gift[] = data?.cart?.gifts || []

  const cartItem = (gift: Gift) => {

    const { recipient, recurrence } = gift;

    return (
      <tr>
        <td>
          <img desig-src={recipient.designationNumber} />
          <span>{recipient.displayName}</span>
          <span>{recipient.designationNumber}</span>
        </td>
        <td>
          <span>{recurrence.recurrenceFrequency}</span>
          { recurrence.recurrenceFrequency === GiftRecurrenceFrequency.Single ? (
            <span>
              <span>Starts on:</span>
              <span>{recurrence.recurringDayOfMonth}</span>
              <span>{recurrence.recurringStartMonth}</span>
            </span>
          ): null}
        </td>
      </tr>
    );
  };

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
        { gifts.map(gift => cartItem(gift)) || null }
      </tbody>
    </table>
  );
};

const Cart = angular
  .module(componentName)
  .component(componentName, react2angular(CartReact));

export { Cart, CartReact }