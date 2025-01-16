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
  onSuccess: () => void
  componentInstance: any
  buttonId: string
  buttonType?: ButtonType
  buttonClasses: string
  buttonDisabled: boolean
  buttonLabel: string
  envService: any
  $translate: any
  $log: any
  $rootScope: any
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
  $log,
  $rootScope
}: RecaptchaWrapperProps): JSX.Element => {
  const recaptchaKey = envService.read('recaptchaKey')

  // Because the onSuccess callback is called by a React component, AngularJS doesn't know that an event happened and doesn't know it needs to rerender. We have to use $apply to ensure that AngularJS rerenders after the event handlers return.
  const onSuccessWrapped = (() => {
    $rootScope.$apply(() => {
      onSuccess.call(componentInstance)
    })
  })

  return (
      <Recaptcha action={action}
                 onSuccess={onSuccessWrapped}
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
      ['envService', '$translate', '$log', '$rootScope']))
