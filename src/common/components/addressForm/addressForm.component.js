import angular from 'angular';
import find from 'lodash/find';

import geographiesService from 'common/services/api/geographies.service';

import template from './addressForm.tpl';

let componentName = 'addressForm';

class AddressFormController {

  /* @ngInject */
  constructor(geographiesService) {
    this.geographiesService = geographiesService;
  }

  $onInit(){
    this.loadCountries();
  }

  loadCountries(){
    this.geographiesService.getCountries()
      .subscribe((data) => {
        this.countries = data;
        if(this.address){
          this.refreshRegions(this.address.country);
        }
      });
  }

  refreshRegions(country){
    country = find(this.countries, {name: country});
    if(!country){ return; }

    this.geographiesService.getRegions(country)
      .subscribe((data) => {
        this.regions = data;
      });
  }
}

export default angular
  .module( componentName, [
    template.name,
    geographiesService.name
  ] )
  .component( componentName, {
    controller:  AddressFormController,
    templateUrl: template.name,
    bindings:    {
      address: '=',
      parentForm: '<'
    }
  } );
