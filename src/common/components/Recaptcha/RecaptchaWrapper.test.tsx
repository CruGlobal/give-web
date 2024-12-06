import { render } from '@testing-library/react'
import { RecaptchaWrapper } from './RecaptchaWrapper'
import React from 'react'
import { ButtonType } from './Recaptcha'

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

  const $rootScope = {
    $apply: jest.fn()
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
        buttonType={ButtonType.Submit}
        buttonClasses='btn'
        buttonDisabled={false}
        buttonLabel='Label'
        envService={envService}
        $translate={$translate}
        $log={$log}
        $rootScope={$rootScope}
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

  it('should add a script even if one already exists', () => {
    document.body.appendChild(script)
    render(
      <RecaptchaWrapper
        action='submit_gift'
        onSuccess={jest.fn()}
        onFailure={jest.fn()}
        componentInstance={{}}
        buttonId='id'
        buttonType={ButtonType.Submit}
        buttonClasses='btn'
        buttonDisabled={false}
        buttonLabel='Label'
        envService={envService}
        $translate={$translate}
        $log={$log}
        $rootScope={$rootScope}
      />
    )
    expect(document.getElementById('give-checkout-recaptcha')).not.toBeNull()
    expect(document.getElementById('test-script')).not.toBeNull()
  })
})
