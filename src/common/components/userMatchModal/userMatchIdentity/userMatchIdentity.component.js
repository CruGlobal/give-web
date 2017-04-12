import angular from 'angular';
import isEmpty from 'lodash/isEmpty';
import template from './userMatchIdentity.tpl.html';
import analyticsFactory from 'app/analytics/analytics.factory';

let componentName = 'userMatchIdentity';

class UserMatchIdentityController {

  /* @ngInject */
  constructor(analyticsFactory) {
    this.analyticsFactory = analyticsFactory;
    this.hasError = false;
  }

  $onInit() {
    this.analyticsFactory.track('aa-registration-match-is-this-you');
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
    analyticsFactory.name
  ] )
  .component( componentName, {
    controller:  UserMatchIdentityController,
    templateUrl: template,
    bindings:    {
      contacts:        '<',
      onSelectContact: '&'
    }
  } );
