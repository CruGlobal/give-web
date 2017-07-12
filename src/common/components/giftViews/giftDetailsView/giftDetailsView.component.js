import angular from 'angular';
import 'angular-ordinal';

import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component';
import {quarterlyMonths} from 'common/services/giftHelpers/giftDates.service';

import template from './giftDetailsView.tpl.html';

let componentName = 'giftDetailsView';

class GiftDetailsViewController {

  /* @ngInject */
  constructor() {
    this.quarterlyMonths = quarterlyMonths;
  }
}

export default angular
  .module( componentName, [
    paymentMethodDisplay.name,
    'ordinal'
  ] )
  .component( componentName, {
    controller:  GiftDetailsViewController,
    template: template,
    bindings:    {
      gift: '<'
    }
  } );
