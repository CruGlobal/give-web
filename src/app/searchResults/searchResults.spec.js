import angular from 'angular'
import 'angular-mocks'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'

import module from './searchResults.component'

describe('searchResults', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl

  beforeEach(inject(function (_$componentController_) {
    $ctrl = _$componentController_(module.name, {
      $window: {
        location: {
          href: '/search-results.html',
          hostname: 'give.cru.org'
        }
      }
    })
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  describe('requestGiveSearch', () => {
    it('request search onInit', () => {
      jest.spyOn($ctrl, 'requestGiveSearch').mockImplementation(() => {})

      $ctrl.$onInit()

      expect($ctrl.requestGiveSearch).toHaveBeenCalled()
    })

    it('changes type', () => {
      $ctrl.$onInit()

      $ctrl.searchParams = {
        keyword: 'steve',
        type: ''
      }
      $ctrl.requestGiveSearch('people')

      expect($ctrl.searchParams.type).toEqual('people')
    })

    it('pulls ministry list', () => {
      jest.spyOn($ctrl.designationsService, 'ministriesList').mockReturnValue(Observable.of({
            name: 'Cru Greatest Needs',
            designationNumber: '0763355',
            path: '/cru-greatestneeds',
            facet: 'ministry'
          }))

      $ctrl.$onInit()
      $ctrl.requestGiveSearch('ministries')

      expect($ctrl.searchResults).toEqual({
            name: 'Cru Greatest Needs',
            designationNumber: '0763355',
            path: '/cru-greatestneeds',
            facet: 'ministry'
          })
      expect($ctrl.loadingResults).toEqual(false)
    })

    it('handles no search query', () => {
      $ctrl.$onInit()
      $ctrl.requestGiveSearch('people')

      expect($ctrl.searchResults).toEqual(null)
    })

    it('handles results from search results', () => {
      jest.spyOn($ctrl.designationsService, 'productSearch').mockReturnValue(Observable.of([]))

      $ctrl.$onInit()
      $ctrl.searchParams = {
        keyword: 'steve'
      }

      $ctrl.requestGiveSearch('people')

      expect($ctrl.searchResults).toEqual([])
      expect($ctrl.loadingResults).toEqual(false)
    })

    it('handles error from search results', () => {
      jest.spyOn($ctrl.designationsService, 'productSearch').mockReturnValue(Observable.throw({}))

      $ctrl.$onInit()
      $ctrl.searchParams = {
        keyword: 'steve'
      }
      $ctrl.requestGiveSearch('people')

      expect($ctrl.searchResults).toEqual(null)
      expect($ctrl.searchError).toEqual(true)
    })
  })
})
