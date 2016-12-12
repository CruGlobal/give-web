import angular from 'angular';
import 'angular-filter';

import commonModule from 'common/common.module';
import designationsService from 'common/services/api/designations.service';
import productConfigComponent from 'app/productConfig/productConfig.component';
import ministries from './searchResults.ministries';
import desigSrcDirective from 'common/directives/desigSrc.directive';

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
    let params = this.$location.search();

    this.searchParams.keyword = params.q;
    this.searchParams.first_name = params.fName;
    this.searchParams.last_name = params.lName;
    this.showAdvancedSearch = !params.q && !params.fName && !params.lName;
    this.searchParams.type = params.type;

    this.requestSearch(this.searchParams.type);
  }

  requestSearch(type){
    this.searchParams.type = type;

    this.loadingResults = true;
    this.searchError = false;
    this.designationsService.productSearch(this.searchParams)
      .subscribe((results) => {
        if(!results.length && this.searchParams.type === 'ministries'){
          this.searchResults = ministries;
        }else{
          this.searchResults = results;
        }
        this.loadingResults = false;
      }, () => {
        this.searchResults = null;
        this.searchError = true;
        this.loadingResults = false;
      });
  }

  exploreSearch(){
    var term = this.searchParams.keyword || this.searchParams.first_name + ' ' + this.searchParams.last_name;
    this.$window.location = 'https://www.cru.org/search.' + encodeURIComponent(term) + '.html';
  }
}

export default angular
  .module( componentName, [
    template.name,
    commonModule.name,
    'angular.filter',
    designationsService.name,
    productConfigComponent.name,
    desigSrcDirective.name
  ] )
  .component( componentName, {
    controller:  SearchResultsController,
    templateUrl: template.name
  } );
