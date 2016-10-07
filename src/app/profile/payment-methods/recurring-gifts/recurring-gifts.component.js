import angular from 'angular';
import template from './recurring-gifts.tpl';
import forEach from 'lodash/forEach';

class recurringGiftsController{

  /* @ngInject */
  constructor(){}

  $onInit(){
    this.buildGifts();
  }

  buildGifts(){
    var gifts = [];
    forEach(this.gifts,(gift) => {
      var rate = gift.rate,
          day = gift['recurring-day-of-month'];
      forEach(gift['donation-lines'], (donationLine) => {
        donationLine['rate'] = rate;
        donationLine['recurring-day-of-month'] = day;
        gifts = gifts.concat(donationLine);
      });
    });
    return gifts;
  }

  getNextGiftDate(gift){
    if(!gift['recurring-day-of-month']) return false;
    let date = new Date();
    let dayOfGiving = gift['recurring-day-of-month']*1;
    let happensThisMonth = date.getDate() < dayOfGiving ? true : false;
    date.setDate(dayOfGiving);
    !happensThisMonth ? date.setMonth(date.getMonth()+1) : false;
    return date;
  }

}

let componentName = 'recurringGifts';

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: recurringGiftsController,
    templateUrl: template.name,
    bindings: {
      gifts: '<'
    }
  });
