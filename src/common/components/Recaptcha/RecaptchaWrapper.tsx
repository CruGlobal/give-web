import angular from 'angular'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { react2angular } from 'react2angular'
import React from 'react'
import { Recaptcha } from './Recaptcha'

const componentName = 'recaptchaWrapper'

interface RecaptchaWrapperProps {
  action: string
  onSuccess: (componentInstance: any) => void
  onFailure: (componentInstance: any) => void
  componentInstance: any
  buttonId: string
  buttonType?: 'submit' | 'reset' | 'button' | undefined
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
  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
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
                 $log={$log}></Recaptcha>
    </GoogleReCaptchaProvider>
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
