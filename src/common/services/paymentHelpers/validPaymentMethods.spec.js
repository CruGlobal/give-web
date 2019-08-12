import { validPaymentMethods, validPaymentMethod } from './validPaymentMethods'
import { advanceTo, clear } from 'jest-date-mock'

describe('validPaymentMethods', () => {
  beforeEach(() => {
    advanceTo(new Date(2015, 0, 10))
  })

  afterEach(clear)

  it('should return bank accounts', () => {
    const paymentMethods = [{
      self: {
        type: 'elasticpath.bankaccounts.bank-account'
      }
    }]

    expect(validPaymentMethods(paymentMethods)).toEqual(paymentMethods)
  })

  it('should return active credit cards', () => {
    const paymentMethods = [{
      self: {
        type: 'cru.creditcards.named-credit-card'
      },
      'expiry-month': '01',
      'expiry-year': '2015'
    }]

    expect(validPaymentMethods(paymentMethods)).toEqual(paymentMethods)
  })

  it('should filter out inactive credit cards', () => {
    const paymentMethods = [{
      self: {
        type: 'cru.creditcards.named-credit-card'
      },
      'expiry-month': '12',
      'expiry-year': '2014'
    }]

    expect(validPaymentMethods(paymentMethods)).toEqual([])
  })

  it('should handle no payment methods', () => {
    const paymentMethods = []

    expect(validPaymentMethods(paymentMethods)).toEqual([])
  })

  it('should handle several payment methods', () => {
    const paymentMethods = [
      {
        self: {
          type: 'elasticpath.bankaccounts.bank-account'
        }
      },
      {
        self: {
          type: 'cru.creditcards.named-credit-card'
        },
        'expiry-month': '01',
        'expiry-year': '2015'
      },
      {
        self: {
          type: 'cru.creditcards.named-credit-card'
        },
        'expiry-month': '12',
        'expiry-year': '2014'
      },
      {
        self: {
          type: 'cru.creditcards.named-credit-card'
        },
        'expiry-month': '02',
        'expiry-year': '2015'
      },
      {
        self: {
          type: 'elasticpath.bankaccounts.bank-account'
        }
      },
      {
        self: {
          type: 'cru.creditcards.named-credit-card'
        },
        'expiry-month': '01',
        'expiry-year': '2014'
      },
      {
        self: {
          type: 'cru.creditcards.named-credit-card'
        },
        'expiry-month': '01',
        'expiry-year': '2016'
      }
    ]

    expect(validPaymentMethods(paymentMethods)).toEqual([
      paymentMethods[0],
      paymentMethods[1],
      paymentMethods[3],
      paymentMethods[4],
      paymentMethods[6]
    ])
  })
})

describe('validPaymentMethod', () => {
  beforeEach(() => {
    advanceTo(new Date(2015, 0, 10))
  })

  it('should consider bank accounts valid', () => {
    const paymentMethod = {
      self: {
        type: 'elasticpath.bankaccounts.bank-account'
      }
    }

    expect(validPaymentMethod(paymentMethod)).toEqual(true)
  })

  it('should consider unexpired credit cards valid', () => {
    const paymentMethod = {
      self: {
        type: 'cru.creditcards.named-credit-card'
      },
      'expiry-month': '01',
      'expiry-year': '2015'
    }

    expect(validPaymentMethod(paymentMethod)).toEqual(true)
  })

  it('should consider expired credit cards invalid', () => {
    const paymentMethod = {
      self: {
        type: 'cru.creditcards.named-credit-card'
      },
      'expiry-month': '12',
      'expiry-year': '2014'
    }

    expect(validPaymentMethod(paymentMethod)).toEqual(false)
  })
})
