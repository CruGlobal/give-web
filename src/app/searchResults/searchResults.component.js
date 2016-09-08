import angular from 'angular';

import commonModule from 'common/common.module';
import designationsService from 'common/services/api/designations.service';
import productConfigComponent from 'app/productConfig/productConfig.component';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';
import ministries from './searchResults.ministries';

import template from './searchResults.tpl';

let componentName = 'searchResults';

class SearchResultsController {

  /* @ngInject */
  constructor($window, $location, designationsService) {
    this.$window = $window;
    this.$location = $location;
    this.designationsService = designationsService;
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
    }else if(this.searchParams.type === 'ministries'){
      this.searchResults = ministries;
      this.loadingResults = false;
    }else{
      if((this.searchParams.keyword && !this.searchParams.type) ||
        (this.searchParams.type === 'people' && (this.searchParams.first_name || this.searchParams.last_name))){
        this.designationsService.productSearch(this.searchParams)
          .subscribe((results) => {
            this.searchResults = results;
            this.loadingResults = false;
          });
      }else{
        this.searchResults = null;
        this.loadingResults = false;
      }
    }
  }

  exploreSearch(){
    this.$window.location.href = 'https://www.cru.org/content/cru/us/en/search.' + encodeURIComponent(this.searchParams.keyword) + '.html';
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
