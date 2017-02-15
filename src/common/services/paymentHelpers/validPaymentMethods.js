import filter from 'lodash/filter';
import moment from 'moment';

// Filter out expired credit cards
export function validPaymentMethods(paymentMethods){
  return filter(paymentMethods, validPaymentMethod);
}

export function validPaymentMethod(paymentMethod){
    return paymentMethod.self.type === 'elasticpath.bankaccounts.bank-account' || moment({ year: paymentMethod['expiry-year'], month: parseInt(paymentMethod['expiry-month']) - 1}).isSameOrAfter(moment(), 'month');
}
