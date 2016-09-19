import angular from 'angular';
import isEmpty from 'lodash/isEmpty';
import template from './userMatchIdentity.tpl';

let componentName = 'userMatchIdentity';

class UserMatchIdentityController {

  /* @ngInject */
  constructor() {
    this.hasError = false;
  }

  selectContact() {
    this.hasError = false;
    if ( !this.identityForm.$valid ) {
      this.hasError = true;
    }
    else {
      this.onSelectContact( {
        contact: isEmpty( this.contact ) ? undefined : this.contact
      } );
    }
  }
}

export default angular
  .module( componentName, [
    template.name
  ] )
  .component( componentName, {
    controller:  UserMatchIdentityController,
    templateUrl: template.name,
    bindings:    {
      contacts:        '<',
      onSelectContact: '&'
    }
  } );
