import { render } from '@testing-library/react'
import { findExistingScript, RecaptchaWrapper } from './RecaptchaWrapper'
import React from 'react'

describe('RecaptchaWrapper component', () => {
  const $translate = {
    instant: jest.fn()
  }

  const envService = {
    read: jest.fn().mockReturnValue('123')
  }

  const $log = {
    warn: jest.fn()
  }

  const mockExecuteRecaptcha = jest.fn()
  const mockRecaptchaReady = jest.fn()
  const mockRecaptcha = {
    ready: mockRecaptchaReady,
    execute: mockExecuteRecaptcha
  }

  const script = document.createElement('script')
  script.src = 'https://www.google.com/recaptcha/api.js?render=123'
  script.id = 'test-script'

  beforeEach(() => {
    $translate.instant.mockImplementation((input) => input)
    global.window.grecaptcha = mockRecaptcha
  })

  it('should render', () => {
    const onSuccess = jest.fn(() => console.log('success'))
    const { getAllByRole } = render(
      <RecaptchaWrapper
        action='submit_gift'
        onSuccess={onSuccess}
        onFailure={jest.fn()}
        componentInstance={{}}
        buttonId='id'
        buttonType='submit'
        buttonClasses='btn'
        buttonDisabled={false}
        buttonLabel='Label'
        envService={envService}
        $translate={$translate}
        $log={$log}
      />
    )
    expect(getAllByRole('button')).toHaveLength(1)
    const recaptchaEnabledButton = getAllByRole('button')[0]
    expect(recaptchaEnabledButton.id).toEqual('id')
    expect(recaptchaEnabledButton.className).toEqual('btn')
    expect((recaptchaEnabledButton as HTMLButtonElement).disabled).toEqual(false)
    expect(recaptchaEnabledButton.innerHTML).toEqual('Label')
    expect(document.getElementById('give-checkout-recaptcha')).not.toBeNull()
  })

  it('should not add a script if one already exists', () => {
    document.body.appendChild(script)
    render(
      <RecaptchaWrapper
        action='submit_gift'
        onSuccess={jest.fn()}
        onFailure={jest.fn()}
        componentInstance={{}}
        buttonId='id'
        buttonType='submit'
        buttonClasses='btn'
        buttonDisabled={false}
        buttonLabel='Label'
        envService={envService}
        $translate={$translate}
        $log={$log}
      />
    )
    expect(document.getElementById('give-checkout-recaptcha')).toBeNull()
    expect(document.getElementById('test-script')).not.toBeNull()
  })

  describe('findExistingScript', () => {
    it('should find an existing script', () => {
      document.body.appendChild(script)
      expect(findExistingScript()).toEqual(true)
    })

    it('should not find an existing script', () => {
      expect(findExistingScript()).toEqual(false)
    })

    it('should not find a different script', () => {
      const otherScript = document.createElement('script')
      otherScript.src = 'https://example.com/some/script.js'
      document.body.appendChild(otherScript)
      expect(findExistingScript()).toEqual(false)
    })
  })

  afterEach(() => {
    const allScripts = document.getElementsByTagName('script')
    for (let script of allScripts) {
      document.body.removeChild(script)
    }
  })
})
