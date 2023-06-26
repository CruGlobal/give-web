import { getByRole, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Recaptcha } from './Recaptcha'
import React from 'react'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

jest.mock('react-google-recaptcha-v3');

(useGoogleReCaptcha as jest.Mock).mockImplementation(() => {
  return {
    executeRecaptcha: mockExecuteRecaptcha
  }
})

let mockExecuteRecaptcha = jest.fn()

describe('Recaptcha component', () => {
  const $translate = {
    instant: jest.fn()
  };

  const $log = {
    warn: jest.fn()
  }

  beforeEach(() => {
    $translate.instant.mockImplementation((input) => input)
    mockExecuteRecaptcha.mockImplementation(() => Promise.resolve('token'))
  })

  it('should render', () => {
    const onSuccess = jest.fn(() => console.log('success'))
    const { getAllByRole } = render(
      buildRecaptcha(onSuccess)
    )
    expect(getAllByRole('button')).toHaveLength(1)
    const recaptchaEnabledButton = getAllByRole('button')[0]
    expect(recaptchaEnabledButton.id).toEqual('id')
    expect(recaptchaEnabledButton.className).toEqual('btn')
    expect((recaptchaEnabledButton as HTMLButtonElement).disabled).toEqual(false)
    expect(recaptchaEnabledButton.innerHTML).toEqual('Label')
  })

  it('should successfully pass the recaptcha', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, score: 0.9, action: 'submit' })
      })
    })

    const onSuccess = jest.fn(() => console.log('success'))

    const { getByRole } = render(
      buildRecaptcha(onSuccess)
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalled()
    )
  })

  it('should log a warning due to low score', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, score: 0.2, action: 'submit' })
      })
    })

    const onSuccess = jest.fn(() => console.log('warning'))

    const { getByRole } = render(
      buildRecaptcha(onSuccess)
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() =>
      expect($log.warn).toHaveBeenCalledWith('Captcha score was below the threshold: 0.2')
    )
  })

  it('should fail the recaptcha call', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve({ success: false, error: 'some error', action: 'submit' })
      })
    })

    const onSuccess = jest.fn(() => console.log('fail'))

    const { getByRole } = render(
      buildRecaptcha(onSuccess)
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() =>
      expect(onSuccess).not.toHaveBeenCalled()
    )
  })

  it('should skip the success function when not submit', async () => {
    //@ts-ignore
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, action: 'read' })
      })
    })

    const onSuccess = jest.fn(() => console.log('fail'))

    const { getByRole } = render(
      buildRecaptcha(onSuccess)
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() =>
      expect(onSuccess).not.toHaveBeenCalled()
    )
  })

  it('should skip the recaptcha call', async () => {
    //@ts-ignore
    mockExecuteRecaptcha = undefined

    const onSuccess = jest.fn(() => console.log('fail'))

    const { getByRole } = render(
      buildRecaptcha(onSuccess)
    )

    await userEvent.click(getByRole('button'))
    await waitFor(() =>
      expect(onSuccess).not.toHaveBeenCalled()
    )
  })

  const buildRecaptcha = (onSuccess: (componentInstance: any) => void) => {
    return <Recaptcha
      action='submit'
      onSuccess={onSuccess}
      componentInstance={{}}
      buttonId='id'
      buttonType='submit'
      buttonClasses='btn'
      buttonDisabled={false}
      buttonLabel='Label'
      $translate={$translate}
      $log={$log}
    />
  }
})
