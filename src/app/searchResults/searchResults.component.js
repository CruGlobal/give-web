import angular from 'angular';

import urlQueryTerm from 'common/lib/urlQueryTerm';
import commonModule from 'common/common.module';
import designationsService from 'common/services/api/designations.service';
import productConfigComponent from 'app/productConfig/productConfig.component';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';

import template from './searchResults.tpl';

let componentName = 'searchResults';

class SearchResultsController {

  /* @ngInject */
  constructor($window, designationsService) {
    this.$window = $window;
    this.designationsService = designationsService;
    this.searchParams = {};
  }

  $onInit(){
    this.searchParams.keyword = urlQueryTerm.get('q');
    this.searchParams.first_name = urlQueryTerm.get('fName');
    this.searchParams.last_name = urlQueryTerm.get('lName');
    this.searchParams.type = urlQueryTerm.get('type');
    this.searchParamsInitial = angular.copy(this.searchParams);

    this.requestSearch();
  }

  requestSearch(type){
    if(angular.isDefined(type)){
      this.searchParams.type = type;
      if(this.searchParams.type === 'all' || this.searchParams.type === 'people'){
        this.searchParams.first_name = this.searchParamsInitial.first_name;
        this.searchParams.last_name = this.searchParamsInitial.last_name;
      }else{
        this.searchParams.first_name = '';
        this.searchParams.last_name = '';
      }
    }

    this.loadingResults = true;
    if(this.searchParams.type === 'featuredOpportunities'){
      this.searchResults = [];
      this.loadingResults = false;
    }else{
      this.designationsService.productSearch(this.searchParams)
        .subscribe((results) => {
          this.searchResults = results;
          this.loadingResults = false;
        });
    }
  }

  exploreSearch(){
    this.$window.location.href = 'https://www.cru.org/content/cru/us/en/search.' + encodeURIComponent(this.searchTerm) + '.html';
  }
}

export default angular
  .module( componentName, [
    template.name,
    commonModule.name,
    designationsService.name,
    productConfigComponent.name,
    loadingOverlay.name
  ] )
  .component( componentName, {
    controller:  SearchResultsController,
    templateUrl: template.name
  } );
