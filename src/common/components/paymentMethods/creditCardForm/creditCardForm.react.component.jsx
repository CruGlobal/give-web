import angular from 'angular'
import React from 'react'
import { react2angular } from 'react2angular'
// import { ReactAddressForm } from '../../addressForm/addressForm.react.component'

const CreditCardForm = ({ envService, tsysService }) => {
  return (
    <div>
      <h1>Credit Card Form!</h1>
      {/* <ReactAddressForm /> */}
    </div>
  )
}

angular
  .module('creditCardForm', [
    'ngMessages'
    // displayAddressComponent.name,
    // addressForm.name,
    // showErrors.name,
    // tsys.name
  ])
  .component('creditCardForm', react2angular(CreditCardForm, ['envService', 'tsysService'], ['$log']))

export { CreditCardForm }
