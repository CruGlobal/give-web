
export function allGiftsValid (recurringGifts) {
    return every(recurringGifts, gift => gift.paymentMethod) && every(recurringGifts, gift => gift.amount)
  }

