import angular from 'angular';
import template from './give.tpl';
import gift from './gift/gift.component';

let componentName = 'give';

class GiveController{

  /* @ngInject */
  constructor(){
    this.data = {
      full_name: 'John Smith',
      accountNumber: '0095489',
      payments: [
        {
          paymentDate: '03/30/2014',
          amount:  500.65
        },
        {
          paymentDate: '03/30/2015',
          amount:  500.65
        },
        {
          paymentDate: '03/30/2016',
          amount:  500.65
        },
        {
          paymentDate: '05/30/2016',
          amount:  25.5
        }
      ],
      address: '123 Test Street, Apt 987',
      state: 'FL',
      zip: '32223-1212',
      phoneNumber: '(344) 344-4444'
    };
  }

  yearToDateGiving(){
    let currentYear = new Date().getFullYear()*1;
    let total = 0;
    this.data.payments.forEach((payment) => {
      let paymentYear = payment.paymentDate.substr(-4)*1;
      if(currentYear == paymentYear) {
        total += payment.amount;
      }
    });
    return total;
  }

  lastPaymentDate(){
    let dates = this.data.payments.map((payment)=>{
      return new Date(payment.paymentDate);
    });
    let lpd = Math.max.apply(null, dates);
    lpd = new Date(lpd);
    return `${lpd.getMonth()+1}/${lpd.getDate()}/${lpd.getFullYear()}`;
  }

}
export default angular
  .module(componentName, [
    template.name,
    gift.name
  ])
  .component(componentName, {
    controller: GiveController,
    templateUrl: template.name
  });
