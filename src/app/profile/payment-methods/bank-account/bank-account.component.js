import angular from 'angular';
import template from './bank-account.tpl';
import displayAddressComponent from 'common/components/display-address/display-address.component';

class BankAccountController{

  /* @ngInject */
  constructor(envService){
    this.isCollapsed = true;
    this.imgDomain = envService.read('imgDomain');
  }

  getExpiration(){
    return `${this.model['expiry-month']}/${this.model['expiry-year']}`;
  }

}

let componentName = 'bankAccount';

export default angular
  .module(componentName, [
    template.name,
    displayAddressComponent.name
  ])
  .component(componentName, {
    controller: BankAccountController,
    templateUrl: template.name,
    bindings: {
      model: '<'
    }
  });
