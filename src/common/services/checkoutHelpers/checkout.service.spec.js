import * as checkoutService from './checkout.service'

describe('initializeRecaptcha()', () => {
  const $ctrl = {
    $window: {
      document: document
    },
    envService: {
      read: jest.fn()
    }
  }
  const script = document.createElement('script')

  beforeEach(() => {
    script.src = 'https://www.google.com/recaptcha/enterprise.js?render=123'
    script.id = 'test-script'
    $ctrl.envService.read.mockReturnValue('123')
  })

  afterEach(() => {
    const foundScript = document.getElementById('give-checkout-recaptcha')
    if (foundScript) {
      document.head.removeChild(foundScript)
    }
  })

  it('should add a script even if one already exists', () => {
    document.head.appendChild(script)
    checkoutService.initializeRecaptcha.call($ctrl)
    expect(document.getElementById('give-checkout-recaptcha')).not.toBeNull()
    expect(document.getElementById('test-script')).not.toBeNull()
  })

  it('should only add this script once', () => {
    script.id = 'give-checkout-recaptcha'
    document.head.appendChild(script)
    expect(document.getElementById('give-checkout-recaptcha')).not.toBeNull()
    checkoutService.initializeRecaptcha.call($ctrl)
    expect(document.querySelectorAll('#give-checkout-recaptcha')).toHaveLength(1)
  })
})

