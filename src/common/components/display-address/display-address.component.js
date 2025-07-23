import angular from 'angular';
import get from 'lodash/get';
import keyBy from 'lodash/keyBy';

import geographiesService from 'common/services/api/geographies.service';

import template from './display-address.tpl.html';

const componentName = 'displayAddress';

class DisplayAddressController {
  /* @ngInject */
  constructor($log, geographiesService) {
    this.$log = $log;
    this.geographiesService = geographiesService;
  }

  $onChanges(changes) {
    const country = get(changes, 'address.currentValue.country');
    if (!this.countries && country && country !== 'US') {
      this.loadCountryNames();
    }
  }

  loadCountryNames() {
    this.geographiesService.getCountries().subscribe(
      (countries) => {
        this.countries = keyBy(countries, 'name');
      },
      (error) => {
        this.$log.warn('Error loading countries for display address', error);
      },
    );
  }
}

export default angular
  .module(componentName, [geographiesService.name])
  .component(componentName, {
    controller: DisplayAddressController,
    templateUrl: template,
    bindings: {
      address: '<',
    },
  });
