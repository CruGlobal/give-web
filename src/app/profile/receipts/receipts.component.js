import angular from 'angular';
import template from './receipts.tpl';
import donationsService from 'common/services/api/donations.service';
import filterByYear from './receipts.filter';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';
import sessionEnforcerService from 'common/services/session/sessionEnforcer.service';
import {Roles} from 'common/services/session/session.service';
import uniq from 'lodash/uniq';
import sortBy from 'lodash/sortBy';

class ReceiptsController {

  /* @ngInject */
  constructor(donationsService,sessionEnforcerService,$location,$window,$log) {
    this.donationsService = donationsService;
    this.sessionEnforcerService = sessionEnforcerService;
    this.$location = $location;
    this.$window = $window;
    this.$log = $log;
    this.loading = false;
    this.years = [];
    this.showYear = '';
    this.maxShow = this.step = 25;
    this.retrievingError = '';
  }

  $onInit() {
    this.enforcerId = this.sessionEnforcerService([Roles.registered], {
      'sign-in': () => {
        this.$window.location = '/receipts.html';
      },
      cancel: () => {
        this.$window.location = 'cart.html';
      }
    });
    this.getReceipts();
  }

  getReceipts(){
    this.loading = true;
    let today = new Date();
    let currentYear = today.getFullYear()*1;

    let data = {
      'end-date': {

      },
      'start-date': {
        'display-value': currentYear - 10 + '-' + ((today.getMonth()*1)+1) + '-' + today.getDate()
      }
    };
    this.donationsService.getReceipts(data)
      .subscribe(
        data => {
          angular.forEach(data,(item) => {
            let year = item['transaction-date']['display-value'].split('-').shift();
            this.years.push(year*1);
          });
          this.receipts = data;
          this.years = sortBy(uniq(this.years), (item) => {
            return item;
          });
          this.years = this.years.reverse();
          this.showYear = this.latestYear = this.years[0];
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
    this.showYear = year;
    this.maxShow = this.step;
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
