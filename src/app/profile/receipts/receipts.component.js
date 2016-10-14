import angular from 'angular';
import template from './receipts.tpl';
import donationsService from 'common/services/api/donations.service';
import filterByYear from './receipts.filter';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';
import sessionEnforcerService, {EnforcerCallbacks, EnforcerModes} from 'common/services/session/sessionEnforcer.service';
import {Roles} from 'common/services/session/session.service';

class ReceiptsController {

  /* @ngInject */
  constructor(donationsService,sessionEnforcerService,$location,$window,$log) {
    this.donationsService = donationsService;
    this.sessionEnforcerService = sessionEnforcerService;
    this.$location = $location;
    this.$window = $window;
    this.$log = $log;
    this.loading = false;
    this.maxShow = this.step = 25;
    this.retrievingError = '';
  }

  $onInit() {
    this.enforcerId = this.sessionEnforcerService([Roles.registered], {
      [EnforcerCallbacks.signIn]: () => {
        this.today = new Date();
        this.currentYear = this.today.getFullYear();
        this.getReceipts(this.currentYear,true);
      },
      [EnforcerCallbacks.cancel]: () => {
        this.$window.location = '/';
      }
    }, EnforcerModes.donor);
    this.today = new Date();
    this.currentYear = this.today.getFullYear();
    this.getReceipts(this.currentYear,true);
  }

  getReceipts(year, tryPreviousYear){
    this.loading = true;

    let data = {
      'end-date': {
        'display-value': year + '-' + (this.today.getMonth()+1) + '-' + this.today.getDate()
      },
      'start-date': {
        'display-value': year + '-01-01'
      }
    };
    this.donationsService.getReceipts(data)
      .subscribe(
        data => {
          this.retrievingError = '';
          this.receipts = data;
          //if there are no receipts in the current year try previous year
          if(this.receipts.length == 0 && tryPreviousYear) {
            this.currentYear = this.currentYear - 1;
            this.getReceipts(this.currentYear);
            return;
          }
          // if no receipts were found for the past two years, set current year back to 2016
          this.currentYear = this.receipts.length == 0 ? this.today.getFullYear() : this.currentYear;
          this.loading = false;
        },
        error => {
          this.loading = false;
          this.retrievingError = 'Failed retrieving receipts.';
          this.$log.error(this.retrievingError,error);
        }
      );
  }

  setYear(year){
    this.maxShow = this.step;
    this.currentYear = year;
    this.getReceipts(year);
  }

  getListYears(){
    let list = [];
    for(let i=0;i<10;i++){
      list.push(this.today.getFullYear() - i);
    }
    return list;
  }

  $onDestroy() {
    this.sessionEnforcerService.cancel(this.enforcerId);
  }

}

let componentName = 'receipts';

export default angular
  .module(componentName, [
    template.name,
    donationsService.name,
    filterByYear.name,
    loadingOverlay.name,
    sessionEnforcerService.name
  ])
  .component(componentName, {
    controller: ReceiptsController,
    templateUrl: template.name
  });
