import angular from 'angular'
import { react2angular } from 'react2angular'
import React from 'react'
import { ButtonType, Recaptcha } from './Recaptcha'

const componentName = 'recaptchaWrapper'

declare global {
  interface Window {
      grecaptcha: any
  }
}

interface RecaptchaWrapperProps {
  action: string
  onSuccess: (componentInstance: any) => void
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

  return (
      <Recaptcha action={action}
                 onSuccess={onSuccess}
                 componentInstance={componentInstance}
                 buttonId={buttonId}
                 buttonType={buttonType}
                 buttonClasses={buttonClasses}
                 buttonDisabled={buttonDisabled}
                 buttonLabel={buttonLabel}
                 $translate={$translate}
                 $log={$log}
                 recaptchaKey={recaptchaKey}></Recaptcha>
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
        'componentInstance',
        'buttonId',
        'buttonType',
        'buttonClasses',
        'buttonDisabled',
        'buttonLabel'
      ],
      ['envService', '$translate', '$log']))
