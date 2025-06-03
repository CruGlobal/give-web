import angular from 'angular'
import find from 'lodash/find'

import geographiesService from 'common/services/api/geographies.service'

import template from './addressForm.tpl.html'

const componentName = 'addressForm'

class AddressFormController {
  /* @ngInject */
  constructor ($log, geographiesService) {
    this.$log = $log
    this.geographiesService = geographiesService
  }

  $onInit () {
    this.loadCountries()
  }

  loadCountries () {
    this.loadingCountriesError = false
    this.geographiesService.getCountries()
      .subscribe((data) => {
        this.countries = data
        if (this.address) {
          this.refreshRegions(this.address.country, true)
        }
      },
      error => {
        this.loadingCountriesError = true
        this.$log.error('Error loading countries.', error)
      })
  }

  refreshRegions (country, initial = false) {
    this.loadingRegionsError = false
    country = find(this.countries, { name: country })
    if (!country) { return }

    this.geographiesService.getRegions(country)
      .subscribe((data) => {
        this.regions = data
      },
      error => {
        this.loadingRegionsError = true
        this.$log.error('Error loading regions.', error)
      })

    if (!initial) {
      this.address.streetAddress = ''
      this.address.extendedAddress = ''
    }
  }

  onPostalCodeChanged () {
    this.onAddressChanged()
  }
}

export default angular
  .module(componentName, [
    geographiesService.name
  ])
  .component(componentName, {
    controller: AddressFormController,
    templateUrl: template,
    bindings: {
      address: '=',
      parentForm: '<',
      onAddressChanged: '&',
      addressDisabled: '<',
      compactAddress: '<'
    }
  })
