import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ButtonType, Recaptcha } from './Recaptcha'
import React from 'react'

let mockExecuteRecaptcha = jest.fn()
const mockRecaptchaReady = jest.fn()
const mockRecaptcha = {
  ready: mockRecaptchaReady,
  execute: mockExecuteRecaptcha
}
const onSuccess = jest.fn()
const onFailure = jest.fn()

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

    $translate.instant.mockImplementation((input) => input)
    mockExecuteRecaptcha.mockImplementation(() => Promise.resolve('token'))
    mockRecaptchaReady.mockImplementation((callback) => { callback() })
    onSuccess.mockClear()
    onFailure.mockClear()
  })

  it('should render', () => {
    onSuccess.mockImplementation(() => console.log('success'))
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

  it('should successfully pass the recaptcha', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, score: 0.9, action: 'submit_gift' })
      })
    })

    onSuccess.mockImplementation(() => console.log('success'))

    const { getByRole } = render(
      buildRecaptcha()
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith('https://give-stage2.cru.org/recaptcha/verify', expect.anything())
    })
  })

  it('should successfully pass the recaptcha on branded checkout', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, score: 0.6, action: 'branded_submit' })
      })
    })

    onSuccess.mockImplementation(() => console.log('success'))

    const { getByRole } = render(
      buildRecaptcha()
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith('https://give-stage2.cru.org/recaptcha/verify', expect.anything())
    })
  })

  it('should log a warning due to low score', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, score: 0.2, action: 'submit_gift' })
      })
    })

    onFailure.mockImplementation(() => console.log('warning'))

    const { getByRole } = render(
      buildRecaptcha()
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect($log.warn).toHaveBeenCalledWith('Captcha score was below the threshold: 0.2')
      expect(onFailure).toHaveBeenCalledTimes(1)
    })
  })

  it('should fail the recaptcha call', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve({ success: false, error: 'some error', action: 'submit_gift' })
      })
    })

    onFailure.mockImplementation(() => console.log('fail'))

    const { getByRole } = render(
      buildRecaptcha()
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
      expect(onFailure).not.toHaveBeenCalled()
    })
  })

  it('should call the fail function when not a valid action', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, action: 'read', score: 0.9 })
      })
    })

    onSuccess.mockImplementation(() => console.log('fail'))

    const { getByRole } = render(
      buildRecaptcha()
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled()
      expect(onFailure).toHaveBeenCalled()
    })
  })

  it('should skip the recaptcha call', async () => {
    //@ts-ignore
    global.window.grecaptcha = { ready: mockRecaptchaReady }

    onSuccess.mockImplementation(() => console.log('fail'))

    const { getByRole } = render(
      buildRecaptcha()
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
      expect(onFailure).not.toHaveBeenCalled()
    })
  })

  it('should not block the gift if something went wrong with recaptcha', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.reject('Failed')
    })

    onSuccess.mockImplementation(() => console.log('success after error'))

    const { getByRole } = render(
      buildRecaptcha()
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(onFailure).not.toHaveBeenCalled()
      expect($log.error).toHaveBeenCalledWith('Failed to verify recaptcha, continuing on: Failed')
    })
  })

  it('should not block the gift if something went wrong with recaptcha JSON', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.reject('Failed')
      })
    })

    onSuccess.mockImplementation(() => console.log('success after JSON error'))

    const { getByRole } = render(
      buildRecaptcha()
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(onFailure).not.toHaveBeenCalled()
      expect($log.error).toHaveBeenCalledWith(`Failed to verify recaptcha, continuing on: Failed`)
    })
  })

  it('should not block gifts if data is empty', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve({})
      })
    })

    onSuccess.mockImplementation(() => console.log('success after weird'))

    const { getByRole } = render(
      buildRecaptcha()
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(onFailure).not.toHaveBeenCalled()
      expect($log.warn).toHaveBeenCalledWith('Recaptcha returned an unusual response:', {})
    })
  })

  it('should not block gifts if action is undefined', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, score: 0.9 })
      })
    })

    onSuccess.mockImplementation(() => console.log('success after weird'))

    const { getByRole } = render(
      buildRecaptcha()
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(onFailure).not.toHaveBeenCalled()
      expect($log.warn).toHaveBeenCalledWith('Recaptcha returned an unusual response:', { success: true, score: 0.9 })
    })
  })

  it('should not block gifts if score is undefined', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, action: 'submit_gift' })
      })
    })

    onSuccess.mockImplementation(() => console.log('success after weird'))

    const { getByRole } = render(
      buildRecaptcha()
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(onFailure).not.toHaveBeenCalled()
      expect($log.warn).toHaveBeenCalledWith('Recaptcha returned an unusual response:', { success: true, action: 'submit_gift' })
    })
  })

  const buildRecaptcha = () => {
    return <Recaptcha
      action='submit_gift'
      onSuccess={onSuccess}
      onFailure={onFailure}
      componentInstance={{}}
      buttonId='id'
      buttonType={ButtonType.Submit}
      buttonClasses='btn'
      buttonDisabled={false}
      buttonLabel='Label'
      $translate={$translate}
      $log={$log}
      recaptchaKey='key'
      apiUrl={'https://give-stage2.cru.org'}
    />
  }
})
