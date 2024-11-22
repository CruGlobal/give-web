import angular from 'angular'
import { react2angular } from 'react2angular'
import React, { useMemo } from 'react'
import { ButtonType, Recaptcha } from './Recaptcha'

const componentName = 'recaptchaWrapper'

declare global {
  interface Window {
      grecaptcha: any
  }
}

interface RecaptchaWrapperProps {
  action: string
  onSuccess: () => void
  onFailure: () => void
  componentInstance: any
  buttonId: string
  buttonType?: ButtonType
  buttonClasses: string
  buttonDisabled: boolean
  buttonLabel: string
  envService: any
  $translate: any
  $log: any
}

export const RecaptchaWrapper = ({
  action,
  onSuccess,
  onFailure,
  componentInstance,
  buttonId,
  buttonType,
  buttonClasses,
  buttonDisabled,
  buttonLabel,
  envService,
  $translate,
  $log
}: RecaptchaWrapperProps): JSX.Element => {
  const recaptchaKey = envService.read('recaptchaKey')
  const apiUrl = envService.read('apiUrl')

  useMemo(() => {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaKey}`
    script.id = 'give-checkout-recaptcha'
    document.body.appendChild(script)
  }, [])

  return (
      <Recaptcha action={action}
                 onSuccess={onSuccess}
                 onFailure={onFailure}
                 componentInstance={componentInstance}
                 buttonId={buttonId}
                 buttonType={buttonType}
                 buttonClasses={buttonClasses}
                 buttonDisabled={buttonDisabled}
                 buttonLabel={buttonLabel}
                 $translate={$translate}
                 $log={$log}
                 recaptchaKey={recaptchaKey}
                 apiUrl={apiUrl}></Recaptcha>
  )
}

export default angular
  .module(componentName, [])
  .component(
    componentName,
    react2angular(
      RecaptchaWrapper,
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
      ['envService', '$translate', '$log']))
