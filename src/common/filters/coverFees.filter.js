import angular from 'angular'
import orderService from 'common/services/api/order.service'

const filterName = 'coverFeesFilter'

const PRICE = 'price'
const AMOUNT = 'amount'
const TOTAL = 'total'

function CoverFees (orderService) {
  this.orderService = orderService
  return (input, item, type) => {
    if (this.orderService.retrieveCoverFeeDecision()) {
      switch (type) {
        case PRICE:
          return item.priceWithFees
        case AMOUNT:
          return item.amountWithFees
        case TOTAL:
          return item.totalWithFees
      }
    } else {
      switch (type) {
        case PRICE:
          return item.price
        case AMOUNT:
          return item.amount
        case TOTAL:
          return item.total
      }
    }
  }
}

export default angular
  .module(filterName, [

  ])
  .filter(filterName, [orderService.name, CoverFees])
