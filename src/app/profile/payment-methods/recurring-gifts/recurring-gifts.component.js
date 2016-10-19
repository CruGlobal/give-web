import angular from 'angular';
import template from './recurring-gifts.tpl';
import forEach from 'lodash/forEach';
import donationsService from 'common/services/api/donations.service';

class recurringGiftsController{

  /* @ngInject */
  constructor(donationsService){
    this.donationsService = donationsService;
  }

  $onInit(){
    this.buildGifts();
  }

  buildGifts(){
    var gifts = [];
    forEach(this.gifts,(gift) => {
      var rate = gift.rate,
          date = gift['next-draw-date'];
      forEach(gift['donation-lines'], (donationLine) => {
        donationLine['rate'] = rate;
        donationLine['next-draw-date'] = date;
        gifts = gifts.concat(donationLine);
      });
    });
    return gifts;
  }

}

let componentName = 'recurringGifts';

export default angular
  .module(componentName, [
    template.name,
    donationsService.name
  ])
  .component(componentName, {
    controller: recurringGiftsController,
    templateUrl: template.name,
    bindings: {
      gifts: '<'
    }
  });
