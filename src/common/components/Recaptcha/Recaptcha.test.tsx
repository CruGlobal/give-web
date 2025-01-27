import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ButtonType, Recaptcha } from './Recaptcha'
import React from 'react'
import { datadogRum } from '@datadog/browser-rum'

jest.mock('@datadog/browser-rum', () => {
  return {
    datadogRum: {
      addError: jest.fn()
    }
  }
})

let mockExecuteRecaptcha = jest.fn()
const mockRecaptchaReady = jest.fn()
const mockRecaptcha = {
  enterprise: {
    ready: mockRecaptchaReady,
    execute: mockExecuteRecaptcha
  }
}
const onSuccess = jest.fn()

describe('Recaptcha component', () => {
  const $translate = {
    instant: jest.fn()
  };

  const $log = {
    warn: jest.fn(),
    error: jest.fn()
  }

  beforeEach(() => {
    global.window.grecaptcha = mockRecaptcha
    onSuccess.mockImplementation(() => console.log('success'))

    $translate.instant.mockImplementation((input) => input)
    mockExecuteRecaptcha.mockImplementation(() => Promise.resolve('token'))
    mockRecaptchaReady.mockImplementation((callback) => { callback() })
    onSuccess.mockClear()
  })

  it('should render', () => {
    const { getAllByRole } = render(
      buildRecaptcha()
    )
    expect(getAllByRole('button')).toHaveLength(1)
    const recaptchaEnabledButton = getAllByRole('button')[0]
    expect(recaptchaEnabledButton.id).toEqual('id')
    expect(recaptchaEnabledButton.className).toEqual('btn')
    expect((recaptchaEnabledButton as HTMLButtonElement).disabled).toEqual(false)
    expect(recaptchaEnabledButton.innerHTML).toEqual('Label')
  })

  it('should disable the button until ready', async () => {
    global.window.grecaptcha = undefined

    const { getByRole } = render(buildRecaptcha())
    const recaptchaEnabledButton = getByRole('button')
    expect((recaptchaEnabledButton as HTMLButtonElement).disabled).toEqual(true)

    global.window.grecaptcha = mockRecaptcha
    await waitFor(() => expect((recaptchaEnabledButton as HTMLButtonElement).disabled).toEqual(false))
  })

  it('should store the recaptcha token and action', async () => {
    const { getByRole } = render(
      buildRecaptcha()
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect(window.sessionStorage.getItem('recaptchaToken')).toEqual('token')
      expect(window.sessionStorage.getItem('recaptchaAction')).toEqual('checkout')
    })
  })

  it('should successfully pass the recaptcha', async () => {
    const { getByRole } = render(
      buildRecaptcha()
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('should skip the recaptcha call', async () => {
    //@ts-ignore
    global.window.grecaptcha = { enterprise: { ready: mockRecaptchaReady }}

    onSuccess.mockImplementation(() => console.log('fail'))

    const { getByRole } = render(
      buildRecaptcha()
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should not block the gift if something went wrong with recaptcha', async () => {
    mockExecuteRecaptcha.mockImplementationOnce(() => Promise.reject(('Failed')))
    onSuccess.mockImplementation(() => console.log('success after error'))

    const { getByRole } = render(
      buildRecaptcha()
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect($log.error).toHaveBeenCalledWith('Failed to verify recaptcha, continuing on: Failed')
    })
  })

  const buildRecaptcha = () => {
    return <Recaptcha
      action='checkout'
      onSuccess={onSuccess}
      componentInstance={{}}
      buttonId='id'
      buttonType={ButtonType.Submit}
      buttonClasses='btn'
      buttonDisabled={false}
      buttonLabel='Label'
      $translate={$translate}
      $log={$log}
      recaptchaKey='key'
    />
  }
})
