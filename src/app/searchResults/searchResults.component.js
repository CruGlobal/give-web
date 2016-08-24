import angular from 'angular';

import epSelector from 'common/lib/epSelector';
import commonModule from 'common/common.module';
import designationsService from 'common/services/api/designations.service';

import template from './searchResults.tpl';

let componentName = 'searchResults';

class SearchResultsController {

  /* @ngInject */
  constructor(designationsService) {
    this.designationsService = designationsService;

    let searchTerm = epSelector.get();
    if(searchTerm){
      designationsService.createSearch(searchTerm)
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
    designationsService.name
  ] )
  .component( componentName, {
    controller:  SearchResultsController,
    templateUrl: template.name
  } );
