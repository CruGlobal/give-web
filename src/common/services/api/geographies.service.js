import angular from 'angular';
import 'rxjs/add/operator/map';
import map from 'lodash/map';

import cortexApiService from '../cortexApi.service';
import hateoasHelperService from 'common/services/hateoasHelper.service';

const serviceName = 'geographiesService';

class Geographies {
  /* @ngInject */
  constructor(cortexApiService, hateoasHelperService) {
    this.cortexApiService = cortexApiService;
    this.hateoasHelperService = hateoasHelperService;
  }

  getCountries() {
    return this.cortexApiService
      .get({
        path: ['geographies', this.cortexApiService.scope, 'countries'],
        zoom: {
          countries: 'element[]',
        },
        cache: true,
      })
      .map((data) => {
        const countries = data.countries;

        // Order countries in alphabetical order
        countries.sort((a, b) =>
          a['display-name'].localeCompare(b['display-name']),
        );

        return countries;
      });
  }

  getRegions(country) {
    return this.cortexApiService
      .get({
        path: this.hateoasHelperService.getLink(country, 'regions'),
        zoom: {
          regions: 'element[]',
        },
        cache: true,
      })
      .map((data) => {
        const regions = data.regions;

        // Order regions in alphabetical order
        regions.sort((a, b) =>
          a['display-name'].localeCompare(b['display-name']),
        );

        if (country && country.name === 'US') {
          return map(regions, (region) => {
            if (region.name === 'AA') {
              region['display-name'] = 'Armed Forces Americas (AA)';
            }
            if (region.name === 'AE') {
              region['display-name'] = 'Armed Forces Europe (AE)';
            }
            if (region.name === 'AP') {
              region['display-name'] = 'Armed Forces Pacific (AP)';
            }
            return region;
          });
        }
        return regions;
      });
  }
}

export default angular
  .module(serviceName, [cortexApiService.name, hateoasHelperService.name])
  .service(serviceName, Geographies);
