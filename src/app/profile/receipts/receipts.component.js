import angular from 'angular';
import template from './receipts.tpl.html';
import donationsService from 'common/services/api/donations.service';
import filterByYear from './receipts.filter';
import sessionEnforcerService, {
  EnforcerCallbacks,
  EnforcerModes,
} from 'common/services/session/sessionEnforcer.service';
import { Roles, SignOutEvent } from 'common/services/session/session.service';
import commonModule from 'common/common.module';
import uibDropdown from 'angular-ui-bootstrap/src/dropdown';

class ReceiptsController {
  /* @ngInject */
  constructor(
    $rootScope,
    donationsService,
    sessionEnforcerService,
    analyticsFactory,
    $location,
    $window,
    $log,
  ) {
    this.donationsService = donationsService;
    this.sessionEnforcerService = sessionEnforcerService;
    this.analyticsFactory = analyticsFactory;
    this.$location = $location;
    this.$window = $window;
    this.$log = $log;
    this.$rootScope = $rootScope;
    this.loading = true;
    this.maxShow = this.step = 25;
    this.retrievingError = '';
  }

  $onInit() {
    this.today = new Date();
    this.enforcerId = this.sessionEnforcerService(
      [Roles.registered],
      {
        [EnforcerCallbacks.signIn]: () => {
          this.currentYear = this.today.getFullYear();
          this.getReceipts(this.currentYear, true);
        },
        [EnforcerCallbacks.cancel]: () => {
          this.$window.location = '/';
        },
      },
      EnforcerModes.donor,
    );

    this.$rootScope.$on(SignOutEvent, (event) => this.signedOut(event));
    this.analyticsFactory.pageLoaded();
  }

  getReceipts(year, tryPreviousYear = false) {
    this.retrievingError = '';
    this.loading = true;
    const endDate =
      this.currentYear === this.today.getFullYear()
        ? year + '-' + (this.today.getMonth() + 1) + '-' + this.today.getDate()
        : year + '-12-31';

    const data = {
      'end-date': {
        'display-value': endDate,
      },
      'start-date': {
        'display-value': year + '-01-01',
      },
    };
    this.donationsService.getReceipts(data).subscribe(
      (data) => {
        this.retrievingError = '';
        this.receipts = data;

        // if there are no receipts in the current year try previous year
        if (this.receipts.length === 0 && tryPreviousYear) {
          this.currentYear = this.currentYear - 1;
          this.getReceipts(this.currentYear);
        } else {
          this.loading = false;
        }
      },
      (error) => {
        this.loading = false;
        this.retrievingError = 'Failed retrieving receipts.';
        this.$log.error(this.retrievingError, error);
      },
    );
  }

  setYear(year) {
    this.maxShow = this.step;
    this.currentYear = year;
    this.getReceipts(year);
  }

  getListYears() {
    const list = [];
    for (let i = 0; i < 10; i++) {
      list.push(this.today.getFullYear() - i);
    }
    return list;
  }

  $onDestroy() {
    this.sessionEnforcerService.cancel(this.enforcerId);
  }

  signedOut(event) {
    if (!event.defaultPrevented) {
      event.preventDefault();
      this.$window.location = '/';
    }
  }
}

const componentName = 'receipts';

export default angular
  .module(componentName, [
    commonModule.name,
    donationsService.name,
    filterByYear.name,
    sessionEnforcerService.name,
    uibDropdown,
  ])
  .component(componentName, {
    controller: ReceiptsController,
    templateUrl: template,
  });
