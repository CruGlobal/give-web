import angular from 'angular';
import template from './credit-card.tpl';
import displayAddressComponent from 'common/components/display-address/display-address.component';
import recurringGiftsComponent from '../recurring-gifts/recurring-gifts.component';
import recurringGiftsData from '../recurring-gifts-data.js';

class CreditCardController{

  /* @ngInject */
  constructor(envService,orderService){
    this.isCollapsed = true;
    this.imgDomain = envService.read('imgDomain');
    this.orderService = orderService;
  }

  $onInit(){
    let address = this.model.creditcard.address;
    this.formattedAddress = address ? this.orderService.formatAddressForTemplate(address) : false;
    this.gifts = recurringGiftsData.donations; // dummy data. in the future an api call will be performed here
  }

  getExpiration(){
    return `${this.model['expiry-month']}/${this.model['expiry-year']}`;
  }

  getImage(){
    return this.model['card-type'].replace(' ','-').toLowerCase();
  }

}

let componentName = 'creditCard';

export default angular
  .module(componentName, [
    template.name,
    displayAddressComponent.name,
    recurringGiftsComponent.name
  ])
  .component(componentName, {
    controller: CreditCardController,
    templateUrl: template.name,
    bindings: {
      model: '<'
    }
  });
