import angular from 'angular';
import map from 'lodash/map';
import forEach from 'lodash/forEach';
import find from 'lodash/find';
import filter from 'lodash/filter';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';

import giftListItem from 'common/components/giftViews/giftListItem/giftListItem.component';

import designationsService from 'common/services/api/designations.service';

import template from './giftSearchView.tpl.html';

const componentName = 'giftSearchView';

class GiftSearchViewController {
  /* @ngInject */
  constructor($log, $scope, designationsService) {
    this.$log = $log;
    this.$scope = $scope;
    this.designationsService = designationsService;

    this.searchSubject = new Subject();
    this.searchState = 'initial';
  }

  $onInit() {
    this.searchHandler();
  }

  searchHandler() {
    this.searchSubject
      .debounceTime(600)
      .distinctUntilChanged()
      .do(() => {
        this.searchState = 'searching';
      })
      .switchMap((query) => {
        // switchMap cancels the existing observable when a new event arrives and uses the latest
        if (query) {
          return this.designationsService.productSearch({ keyword: query });
        } else {
          this.$scope.$apply(() => {
            this.searchState = 'initial';
          });
          return Observable.empty();
        }
      })
      .subscribe(
        (results) => {
          if (results.length) {
            this.results = map(results, (result) => ({
              designationNumber: result.designationNumber,
              designationName: result.name,
            }));
            this.searchState = 'results';
          } else {
            this.searchState = 'no-results';
          }
        },
        (error) => {
          this.searchState = 'error';
          this.$log.error(
            'Error loading search results in giftSearchView',
            error,
          );
        },
      );
  }

  onSearchChange() {
    this.searchSubject.next(this.search);
  }

  gatherSelections(gift) {
    if (this.selectable === 'radio') {
      // deselect previous results when selectable="radio"
      forEach(this.results, (result) => {
        if (gift !== result) {
          result._selectedGift = false;
        }
      });
      this.onSelection({
        selectedRecipient: find(this.results, { _selectedGift: true }),
      });
    } else {
      this.onSelection({
        selectedRecipients: filter(this.results, { _selectedGift: true }),
      });
    }
  }
}

export default angular
  .module(componentName, [giftListItem.name, designationsService.name])
  .component(componentName, {
    controller: GiftSearchViewController,
    templateUrl: template,
    bindings: {
      selectable: '@',
      selectLabel: '@',
      onSelection: '&',
      next: '&',
    },
  });
