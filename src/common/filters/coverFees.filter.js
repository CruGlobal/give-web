import angular from 'angular';
import orderService from 'common/services/api/order.service';

const filterName = 'coverFeesFilter';

const PRICE = 'price';
const TOTAL = 'total';
const CART_TOTAL = 'cartTotal';

function CoverFees(orderService) {
  this.orderService = orderService;
  return (input, item, type) => {
    if (this.orderService.retrieveCoverFeeDecision()) {
      switch (type) {
        case PRICE: {
          return item.priceWithFees;
        }
        case TOTAL: {
          return item.totalWithFees;
        }
        case CART_TOTAL: {
          let total;
          angular.forEach(item.frequencyTotals, (frequencyTotal) => {
            if (frequencyTotal.frequency === 'Single') {
              total = frequencyTotal.totalWithFees;
            }
          });
          return total;
        }
      }
    } else {
      switch (type) {
        case PRICE:
          return item.price;
        case TOTAL:
          return item.total;
        case CART_TOTAL:
          return item.cartTotalDisplay;
      }
    }
  };
}

export default angular
  .module(filterName, [orderService.name])
  .filter(filterName, [orderService.name, CoverFees]);
