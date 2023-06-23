import angular from 'angular'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { react2angular } from 'react2angular'
import { useCallback } from 'react'
import React from 'react'

const componentName = 'recaptcha'

interface RecaptchaProps {
  action: string
  onSuccess: (componentInstance: any) => void
  componentInstance: any
  buttonId: string
  buttonType?: 'submit' | 'reset' | 'button' | undefined
  buttonClasses: string
  buttonDisabled: boolean
  buttonLabel: string
  $translate: any
  $log: any
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
  $log
}: RecaptchaProps): JSX.Element => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      console.log('Execute recaptcha not yet available')
      return
    }

    const token = await executeRecaptcha(action)
    // Do whatever you want with the token
    fetch('/bin/cru/recaptcha.json', {
      method: 'POST',
      body: JSON.stringify({ token: token })
    }).then(function (res) {
      return res.json()
    }).then(function (data) {
      if (data.success === true && data.action === 'submit') {
        if (data.score < 0.5) {
          $log.warn(`Captcha score was below the threshold: ${data.score}`)
        }
        onSuccess(componentInstance)
        return
      }
    })
  }, [executeRecaptcha])

  return (
    <button id={buttonId}
            type={buttonType}
            onClick={handleReCaptchaVerify}
            className={buttonClasses}
            disabled={buttonDisabled}>{$translate.instant(buttonLabel)}</button>
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
        'buttonLabel'
      ],
      ['$translate', '$log']))

