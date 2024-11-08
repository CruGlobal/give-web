import angular from 'angular'
import { react2angular } from 'react2angular'
import React, { useCallback, useEffect, useState } from 'react'
import { datadogRum } from '@datadog/browser-rum'

const componentName = 'recaptcha'

declare global {
  interface Window {
      grecaptcha: any;
  }
}

export enum ButtonType {
  Submit = 'submit',
  Reset = 'reset',
  Button = 'button'
}

interface RecaptchaProps {
  action: string
  onSuccess: (componentInstance: any) => void
  componentInstance: any
  buttonId: string
  buttonType?: ButtonType
  buttonClasses: string
  buttonDisabled: boolean
  buttonLabel: string
  $translate: any
  $log: any
  recaptchaKey: string
}

export const Recaptcha = ({
  action,
  onSuccess,
  componentInstance,
  buttonId,
  buttonType,
  buttonClasses,
  buttonDisabled,
  buttonLabel,
  $translate,
  $log,
  recaptchaKey,
}: RecaptchaProps): JSX.Element => {

  const [ready, setReady] = useState(false)
  const [grecaptcha, setGrecaptcha] = useState(window.grecaptcha)
  let timesIntervalRun = 0

  useEffect(() => {
    const updateRecaptcha = (intervalId: NodeJS.Timer) => {
      setGrecaptcha(window.grecaptcha)
      if (timesIntervalRun >= 20 || grecaptcha) {
        clearInterval(intervalId)
      }
      timesIntervalRun++
    }

    const intervalId = setInterval(() => updateRecaptcha(intervalId), 100)
    setReady(!!grecaptcha)
    return () => clearInterval(intervalId);
  }, [grecaptcha, buttonId])

  const handleReCaptchaVerify = useCallback(async () => {
    if (!ready) {
      $log.info('Execute recaptcha not yet available')
      return
    }

    grecaptcha.enterprise.ready(async () => {
      try {
        const token = await grecaptcha.enterprise.execute(recaptchaKey, { action: action })
        window.sessionStorage.setItem('recaptchaToken', token)
        onSuccess(componentInstance)
      } catch (error) {
        $log.error(`Failed to verify recaptcha, continuing on: ${error}`)
        onSuccess(componentInstance)
      }
    })
  }, [grecaptcha, buttonId, ready])

  return (
    <button id={buttonId}
            type={buttonType}
            onClick={handleReCaptchaVerify}
            className={buttonClasses}
            disabled={buttonDisabled || !ready}>{$translate.instant(buttonLabel)}</button>
  )
}

export default angular
  .module(componentName, [])
  .component(
    componentName,
    react2angular(
      Recaptcha,
      [
        'action',
        'onSuccess',
        'componentInstance',
        'buttonId',
        'buttonType',
        'buttonClasses',
        'buttonDisabled',
        'buttonLabel',
        'recaptchaKey'
      ],
      ['$translate', '$log']))

