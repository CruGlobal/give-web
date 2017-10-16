import angular from 'angular';
import 'angular-filter';
import includes from 'lodash/includes';

import commonModule from 'common/common.module';
import designationsService from 'common/services/api/designations.service';
import productConfigComponent from 'app/productConfig/productConfig.component';
import ministries from './searchResults.ministries';
import desigSrcDirective from 'common/directives/desigSrc.directive';
import analyticsFactory from 'app/analytics/analytics.factory';

import template from './searchResults.tpl.html';

let componentName = 'searchResults';

class SearchResultsController {

  /* @ngInject */
  constructor($window, $location, $log, $httpParamSerializer, designationsService, analyticsFactory, envService) {
    this.$window = $window;
    this.$location = $location;
    this.$log = $log;
    this.$httpParamSerializer = $httpParamSerializer;
    this.designationsService = designationsService;
    this.analyticsFactory = analyticsFactory;
    this.envService = envService;
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

    this.tab = this.$window.location.hostname &&
      (includes(this.$window.location.hostname, 'give') || includes(this.$window.location.hostname, 'localhost'))
      ? 'give' : 'cru';
    if(this.tab === 'give'){
      this.requestGiveSearch(this.searchParams.type);
      this.analyticsFactory.pageLoaded();
    }
  }

  requestGiveSearch(type){
    this.searchParams.type = type;

    if(!this.searchParams.keyword && includes(['ministries', '', undefined], this.searchParams.type)) {
      this.searchResults = ministries;
    }else if(!this.searchParams.keyword &&
      !this.searchParams.first_name &&
      !this.searchParams.last_name
      && this.searchParams.type === 'people'){
      this.searchResults = null;
    }else{
      this.loadingResults = true;
      this.searchError = false;
      this.designationsService.productSearch(this.searchParams)
        .subscribe((results) => {
          this.searchResults = results;
          this.loadingResults = false;
          this.analyticsFactory.search(this.searchParams, results);
        }, (error) => {
          this.searchResults = null;
          this.searchError = true;
          this.loadingResults = false;
          this.$log.error('Error loading search results', error);
        });

      if(this.searchParams.type){
        this.analyticsFactory.setEvent('search filter');
      }
    }
  }

  redirectSearch(site){
    let path = site === 'give' ?
      this.envService.read('publicGive') + '/search-results.html?'
      : this.envService.read('publicCru') + '/search.html?';

    let term = this.searchParams.keyword || this.searchParams.first_name + ' ' + this.searchParams.last_name;
    this.$window.location = path + this.$httpParamSerializer({
      q: term
    });
  }
}

export default angular
  .module( componentName, [
    commonModule.name,
    'angular.filter',
    'environment',
    designationsService.name,
    productConfigComponent.name,
    desigSrcDirective.name,
    analyticsFactory.name
  ] )
  .component( componentName, {
    controller:  SearchResultsController,
    templateUrl: template
  } );
