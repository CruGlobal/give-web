import angular from 'angular';

import commonModule from 'common/common.module';
import designationsService from 'common/services/api/designations.service';
import productConfigComponent from 'app/productConfig/productConfig.component';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';
import ministries from './searchResults.ministries';
import desigSrcDirective from 'common/directives/desigSrc.directive';
import analyticsFactory from 'app/analytics/analytics.factory';

import template from './searchResults.tpl';

let componentName = 'searchResults';

class SearchResultsController {

  /* @ngInject */
  constructor($window, $location, designationsService, analyticsFactory) {
    this.$window = $window;
    this.$location = $location;
    this.designationsService = designationsService;
    this.analyticsFactory = analyticsFactory;
    this.searchParams = {};
  }

  $onInit(){
    var params = this.$location.search();

    this.searchParams.keyword = params.q;
    this.searchParams.first_name = params.fName;
    this.searchParams.last_name = params.lName;
    this.showAdvancedSearch = !params.q && !params.fName && !params.lName;
    this.searchParams.type = params.type;

    this.requestSearch();
  }

  requestSearch(type){
    if(angular.isDefined(type)){
      this.searchParams.type = type;
    }

    this.loadingResults = true;
    if(this.searchParams.type === 'featured') {
      this.searchResults = [];
      this.loadingResults = false;
      this.analyticsFactory.pageLoaded();
    }else if(this.searchParams.type === 'ministries'){
      this.searchResults = ministries;
      this.loadingResults = false;
      this.analyticsFactory.pageLoaded();
    }else{
      if((this.searchParams.keyword && !this.searchParams.type) ||
        (this.searchParams.type === 'people' && (this.searchParams.first_name || this.searchParams.last_name))){
        this.designationsService.productSearch(this.searchParams)
          .subscribe((results) => {
            this.searchResults = results;
            this.loadingResults = false;
            this.analyticsFactory.search(this.searchParams, results);
            this.analyticsFactory.pageLoaded();
          });
      }else{
        this.searchResults = null;
        this.loadingResults = false;
      }
    }
  }

  exploreSearch(){
    var term = this.searchParams.keyword || this.searchParams.first_name + ' ' + this.searchParams.last_name;
    this.$window.location.href = 'https://www.cru.org/content/cru/us/en/search.' + encodeURIComponent(term) + '.html';
  }
}

export default angular
  .module( componentName, [
    template.name,
    commonModule.name,
    analyticsFactory.name,
    designationsService.name,
    productConfigComponent.name,
    loadingOverlay.name,
    desigSrcDirective.name
  ] )
  .component( componentName, {
    controller:  SearchResultsController,
    templateUrl: template.name
  } );
