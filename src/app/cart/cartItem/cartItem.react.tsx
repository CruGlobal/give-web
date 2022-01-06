import react from 'react';

import { startMonth } from '../../../common/services/giftHelpers/giftDates.service'
import { GiftRecurrenceFrequency } from '../cart.generated';

import { CartItemFragment } from './cartItem.generated';

interface CartItemProps {
  item: CartItemFragment,
  nextDrawDate: string,
}

const CartItem = ({ item, nextDrawDate }: CartItemProps) => {

  const {
    cost: {
      display: costDisplay,
    },
    recipient: {
      designationNumber,
      displayName,
    },
    recurrence: {
      recurrenceFrequency,
      recurringDayOfMonth,
      recurringStartMonth,
    },
  } = item;

  let frequency: string;

  switch (recurrenceFrequency) {
    case GiftRecurrenceFrequency.Annually:
      frequency = 'Annually';
    
    case GiftRecurrenceFrequency.Monthly:
      frequency = 'Monthly';
    
    case GiftRecurrenceFrequency.Quarterly:
      frequency = 'Quarterly';
    
    case GiftRecurrenceFrequency.SemiAnnually:
      frequency = 'Semi-Annually';
    
    default:
      frequency = 'Single';
  }

  const giftStartDate = recurrenceFrequency != GiftRecurrenceFrequency.Single
    ? startMonth(recurringDayOfMonth, recurringStartMonth, nextDrawDate).format('ll')
    : null;

  const navToDesignationPage = () => {
    //navigate to designation page
  };

  const editItem = () => {
    //edit gift
  };

  const removeItem = () => {
    //remove gift
  };
  
  return (
    <tr>
      <td>
        <image desig-src={designationNumber} />
        <link onClick={navToDesignationPage}>{displayName}</link>
        <text>{`#${designationNumber}`}</text>
      </td>
      <td>
        <text>{frequency}</text>
        { giftStartDate ? (
          <div>
            <text>{`Starts on: ${giftStartDate}`}</text>
            {/*Display Error*/}
          </div>
        ): null }
      </td>
      <td>
        <text>{costDisplay}</text>
      </td>
      <td>
        <link onClick={editItem}>Edit</link>
        <text>|</text>
        <link onClick={removeItem}>Remove</link>
        {/*Display Error*/}
      </td>
    </tr>
  );
};

export { CartItem }