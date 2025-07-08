import partition from 'lodash/partition';
import concat from 'lodash/concat';
import orderBy from 'lodash/orderBy';

// Sort payment methods so checking accounts are first, then savings accounts, then credit cards ordered by expiration date (longest expiration first)
function sortPaymentMethods(paymentMethods) {
  const [bankAccounts, creditCards] = partition(
    paymentMethods,
    (paymentMethod) => {
      return paymentMethod['account-type'];
    },
  );
  return concat(
    // Display bank accounts first
    orderBy(bankAccounts, (bankAccount) => bankAccount['account-type']), // Display checking accounts first
    orderBy(
      creditCards,
      (card) => card['expiry-year'] + card['expiry-month'],
      'desc',
    ), // Display newer expiration dates first
  );
}

export default sortPaymentMethods;
