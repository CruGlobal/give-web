import angular from 'angular';
import range from 'lodash/range';
import toString from 'lodash/toString';
import 'rxjs/add/operator/pluck';

import cortexApiService from '../cortexApi.service';

let serviceName = 'giftDatesService';

class Profile {

  /*@ngInject*/
  constructor(cortexApiService){
    this.cortexApiService = cortexApiService;
  }

  possibleTransactionDays() {
    return range( 1, 29 ).map( toString );
  }

  getNextDrawDate(){
    return this.cortexApiService.get({
        path: ['nextdrawdate'],
        cache: true
      })
      .pluck('next-draw-date');
  }

  startDate(day, nextDrawDate){
    if(!day || !nextDrawDate){ return; }

    let drawDate = nextDrawDate.split('-');
    drawDate = new Date(drawDate[0], (drawDate[1] - 1), drawDate[2]);

    let selectedDate = new Date(drawDate.getFullYear(), drawDate.getMonth(), day);
    if(selectedDate < drawDate){
      selectedDate.setMonth(selectedDate.getMonth() + 1);
    }

    return selectedDate;
  }
}

export default angular
  .module(serviceName, [
    cortexApiService.name
  ])
  .service(serviceName, Profile);
