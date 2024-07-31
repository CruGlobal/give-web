import { render } from '@testing-library/react'
import { RecaptchaWrapper } from './RecaptchaWrapper'
import React from 'react'

describe('RecaptchaWrapper component', () => {
  const $translate = {
    instant: jest.fn()
  }

  const envService = {
    read: jest.fn()
  }

  const $log = {
    warn: jest.fn()
  }

  beforeEach(() => {
    $translate.instant.mockImplementation((input) => input)
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
  })
})
