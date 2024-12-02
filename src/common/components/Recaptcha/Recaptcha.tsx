import angular from 'angular'
import { react2angular } from 'react2angular'
import React, { useCallback, useEffect, useState } from 'react'

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

const isValidAction = (action: string): boolean => {
  return action === 'submit_gift' || action === 'branded_submit'
}

interface RecaptchaProps {
  action: string
  onSuccess: (componentInstance: any) => void
  onFailure: (componentInstance: any) => void
  componentInstance: any
  buttonId: string
  buttonType?: ButtonType
  buttonClasses: string
  buttonDisabled: boolean
  buttonLabel: string
  $translate: any
  $log: any,
  recaptchaKey: string,
  apiUrl: string,
}

export const Recaptcha = ({
  action,
  onSuccess,
  onFailure,
  componentInstance,
  buttonId,
  buttonType,
  buttonClasses,
  buttonDisabled,
  buttonLabel,
  $translate,
  $log,
  recaptchaKey,
  apiUrl
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

    grecaptcha.ready(async () => {
      try {
        const token = await grecaptcha.execute(recaptchaKey, { action: action })
        const serverResponse = await fetch(`${apiUrl}/recaptcha/verify`, {
          method: 'POST',
          body: JSON.stringify({ token: token }),
          headers: { 'Content-Type': 'application/json' }
        })
        const data = await serverResponse.json()

        if (!data || !data.score || !data.action) {
          $log.warn('Recaptcha returned an unusual response:', data)
          onSuccess(componentInstance)
          return
        }

        if (data?.success === true && isValidAction(data?.action)) {
          if (data.score < 0.5) {
            $log.warn(`Captcha score was below the threshold: ${data.score}`)
            onFailure(componentInstance)
            return
          }
          onSuccess(componentInstance)
          return
        }
        if (data?.success === false && isValidAction(data?.action)) {
          $log.warn('Recaptcha call was unsuccessful, continuing anyway')
          onSuccess(componentInstance)
          return
        }
        if (!isValidAction(data?.action)) {
          $log.warn(`Invalid action: ${data?.action}`)
          onFailure(componentInstance)
        }
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
        'onFailure',
        'componentInstance',
        'buttonId',
        'buttonType',
        'buttonClasses',
        'buttonDisabled',
        'buttonLabel',
        'recaptchaKey',
        'apiUrl'
      ],
      ['$translate', '$log']))

