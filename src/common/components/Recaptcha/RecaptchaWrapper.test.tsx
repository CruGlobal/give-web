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

  const mockExecuteRecaptcha = jest.fn()
  const mockRecaptchaReady = jest.fn()
  const mockRecaptcha = {
    ready: mockRecaptchaReady,
    execute: mockExecuteRecaptcha
  }

  beforeEach(() => {
    $translate.instant.mockImplementation((input) => input)
    global.window.grecaptcha = mockRecaptcha
  })

  it('should render', () => {
    const onSuccess = jest.fn(() => console.log('success'))
    const { getAllByRole } = render(
      <RecaptchaWrapper
        action='checkout'
        onSuccess={onSuccess}
        componentInstance={{}}
        buttonId='id'
        buttonType={ButtonType.Submit}
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
  })
})
