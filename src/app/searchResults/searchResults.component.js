import angular from 'angular';

import urlQueryTerm from 'common/lib/urlQueryTerm';
import commonModule from 'common/common.module';
import designationsService from 'common/services/api/designations.service';
import productConfigComponent from 'app/productConfig/productConfig.component';

import template from './searchResults.tpl';

let componentName = 'searchResults';

class SearchResultsController {

  /* @ngInject */
  constructor(designationsService) {
    this.designationsService = designationsService;
  }

  $onInit(){
    let searchTerm = urlQueryTerm.get('q');
    if(searchTerm){
      this.designationsService.createSearch(searchTerm)
        .subscribe((id) => {
          this.searchId = id;
          this.getPageResults(1);
        });
    }
  }

  getPageResults(page){
    this.searchResults = [];
    this.pagination = {};

    this.designationsService.getSearchResults(this.searchId, page).subscribe((data) => {
      this.searchResults = data.results;
      this.pagination = data.pagination;
    });
  }
}

export default angular
  .module( componentName, [
    template.name,
    commonModule.name,
    designationsService.name,
    productConfigComponent.name
  ] )
  .component( componentName, {
    controller:  SearchResultsController,
    templateUrl: template.name
  } );
