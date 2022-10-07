
import * as giftValidator from './giftValidator.service'
import RecurringGiftModel from 'common/models/recurringGift.model'

describe('giftValidator service', () => {

  describe('allGiftsValid', () => {
    beforeEach(() => {
      RecurringGiftModel.amount = 50
      recurringGifts = [new RecurringGiftModel({}).setDefaults(), new RecurringGiftModel({}).setDefaults()]
    })

      it('should return true if all payment methods and all amounts are valid', () => {
        expect(giftValidator.allGiftsValid(recurringGifts)).toEqual(true)
      })

      it('should return false if any payment method is invalid', () => {
        
        recurringGifts[0].paymentMethodId = 'something invalid'

        expect(giftValidator.allGiftsValid(recurringGifts)).toEqual(false)
      })

      it('should return false if any amount is invalid', () => {
        recurringGifts[0].amount = ''

        expect(giftValidator.allGiftsValid(recurringGifts)).toEqual(false)
      })
    })
})
