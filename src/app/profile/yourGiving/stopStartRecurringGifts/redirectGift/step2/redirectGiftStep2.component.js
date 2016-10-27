import angular from 'angular';
import template from './redirectGiftStep2.tpl';
import find from 'lodash/find';
import debounce from 'lodash/debounce';
import map from 'lodash/map';

import designationsService from 'common/services/api/designations.service';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';

let componentName = 'redirectGiftStep2';

class RedirectGiftStep2Controller {

  /* @ngInject */
  constructor( designationsService ) {
    this.designationsService = designationsService;
    this.find = find;

    // Create debounced search method
    this.performSearch = debounce( this._performSearch, 750 );
  }

  doSearch() {
    if ( angular.isDefined( this.subscriber ) ) {
      this.subscriber.unsubscribe();
      this.subscriber = undefined;
    }
    this.searchState = 'searching';
    this.performSearch();
  }

  /**
   * @private
   */
  _performSearch() {
    this.subscriber = this.designationsService.productSearch( {keyword: this.search} ).subscribe( ( results ) => {
      if ( results.length ) {
        this.results = map( results, ( result ) => {
          return {designationNumber: result.designationNumber, designationName: result.name};
        } );
        this.searchState = 'results';
      }
      else {
        this.searchState = 'no-results';
      }
      this.subscriber = undefined;
    } );
  }

  selectResult() {
    this.onSelectResult( {result: find( this.results, {_selectedGift: true} )} );
  }

  resultSelected( result ) {
    // required for selectable="radio", deselect previous results
    angular.forEach( this.results, ( item ) => {
      if ( result !== item ) {
        item._selectedGift = false;
      }
    } );
  }
}

export default angular
  .module( componentName, [
    template.name,
    designationsService.name,
    giftListItem.name
  ] )
  .component( componentName, {
      controller:  RedirectGiftStep2Controller,
      templateUrl: template.name,
      bindings:    {
        onSelectResult: '&',
        cancel:         '&',
        previous:       '&'
      }
    }
  );
