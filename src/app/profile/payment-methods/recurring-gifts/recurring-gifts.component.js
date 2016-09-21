import angular from 'angular';
import template from './recurring-gifts.tpl';

class recurringGiftsController{

  /* @ngInject */
  constructor(){}

  getNextGiftDate(gift){
    let date = new Date();
    let dayOfGiving = gift['recurring-day-of-month'];
    let happensThisMonth = date.getDate() < dayOfGiving ? true : false;
    date.setDate(dayOfGiving);
    if(!happensThisMonth) {
      date.setMonth(date.getMonth()+1);
    }
    return date.getDate() + '/' + (date.getMonth()+1) +'/' +date.getFullYear();
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
