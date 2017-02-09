import angular from 'angular';
import 'angular-filter';

import commonModule from 'common/common.module';
import designationsService from 'common/services/api/designations.service';
import productConfigComponent from 'app/productConfig/productConfig.component';
import ministries from './searchResults.ministries';
import desigSrcDirective from 'common/directives/desigSrc.directive';
import analyticsFactory from 'app/analytics/analytics.factory';

import template from './searchResults.tpl';

let componentName = 'searchResults';

class SearchResultsController {

  /* @ngInject */
  constructor($window, $location, $log, $httpParamSerializer, designationsService, analyticsFactory) {
    this.$window = $window;
    this.$location = $location;
    this.$log = $log;
    this.$httpParamSerializer = $httpParamSerializer;
    this.designationsService = designationsService;
    this.analyticsFactory = analyticsFactory;
    this.searchParams = {};
  }

  $onInit(){
    let params = this.$location.search();

    this.searchParams.keyword = params.q;
    this.searchParams.first_name = params.fName;
    this.searchParams.last_name = params.lName;
    this.showAdvancedSearch = !params.q && !params.fName && !params.lName;
    this.searchParams.type = params.type;
    this.featuredGroupBy = 'startMonth';

    this.requestSearch(this.searchParams.type);

    this.analyticsFactory.pageLoaded();
  }

  requestSearch(type){
    this.searchParams.type = !type && !this.searchParams.keyword ? 'ministries' : type;

    if(!this.searchParams.keyword && this.searchParams.type === 'ministries'){
      this.searchResults = ministries;
    }else{
      this.loadingResults = true;
      this.searchError = false;
      this.designationsService.productSearch(this.searchParams)
        .subscribe((results) => {
          this.searchResults = results;
          this.loadingResults = false;
        }, (error) => {
          this.searchResults = null;
          this.searchError = true;
          this.loadingResults = false;
          this.$log.error('Error loading search results', error);
        });

      this.analyticsFactory.search(this.searchParams);
      this.analyticsFactory.setEvent('search filter');
    }
  }

  exploreSearch(){
    let term = this.searchParams.keyword || this.searchParams.first_name + ' ' + this.searchParams.last_name;
    this.$window.location = 'https://www.cru.org/search.html?' + this.$httpParamSerializer({
      q: term
    });
  }
}

export default angular
  .module( componentName, [
    template.name,
    commonModule.name,
    'angular.filter',
    designationsService.name,
    productConfigComponent.name,
    desigSrcDirective.name,
    analyticsFactory.name
  ] )
  .component( componentName, {
    controller:  SearchResultsController,
    templateUrl: template.name
  } );
