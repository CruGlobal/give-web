import angular from 'angular'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { react2angular } from 'react2angular'
import { useCallback } from 'react'
import React from 'react'

const componentName = 'recaptcha'

interface RecaptchaProps {
  action: string
  onSuccess: (componentInstance: any) => void
  onFailure: (componentInstance: any) => void
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
  onFailure,
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

    let successFunctionRun = false

    const token = await executeRecaptcha(action)
    // Do whatever you want with the token
    fetch('/bin/cru/recaptcha.json', {
      method: 'POST',
      body: JSON.stringify({ token: token })
    }).then(function (res) {
      return res.json()
    }, (error: any) => {
      $log.error(`Failed to verify recaptcha, continuing on: ${error}`)
      onSuccess(componentInstance)
      successFunctionRun = true
      return Promise.reject(error)
    }).then(function (data) {
      if (data?.success === true && data?.action === 'submit_gift') {
        if (data.score < 0.5) {
          $log.warn(`Captcha score was below the threshold: ${data.score}`)
          successFunctionRun = false
          onFailure(componentInstance)
          return
        }
        onSuccess(componentInstance)
        successFunctionRun = true
        return
      }
      if (data?.success === false && data?.action === 'submit_gift') {
        $log.warn('Recaptcha call was unsuccessful, continuing anyway')
        onSuccess(componentInstance)
        successFunctionRun = true
        return
      }
      if (!data && !successFunctionRun) {
        $log.warn('Data was missing!')
        onSuccess(componentInstance)
        successFunctionRun = true
      }
    }, (error: any) => {
      $log.error(`Failed to return recaptcha JSON, continuing on: ${error}`)
      if (!successFunctionRun) {
        onSuccess(componentInstance)
        successFunctionRun = true
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
        'onFailure',
        'componentInstance',
        'buttonId',
        'buttonType',
        'buttonClasses',
        'buttonDisabled',
        'buttonLabel'
      ],
      ['$translate', '$log']))

