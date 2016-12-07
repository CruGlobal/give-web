import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import module from './searchResults.component';
import ministries from './searchResults.ministries';

describe( 'searchResults', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( function ( _$componentController_ ) {
    $ctrl = _$componentController_( module.name,
      {$window: {location: '/search-results.html'}}
    );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
  } );

  describe( 'requestSearch', () => {
    it( 'request search onInit', () => {
      spyOn( $ctrl, 'requestSearch' );

      $ctrl.$onInit();
      expect( $ctrl.requestSearch ).toHaveBeenCalled( );
    } );

    it( 'changes type', () => {
      $ctrl.$onInit();

      $ctrl.searchParams = {
        keyword: 'steve',
        type: ''
      };
      $ctrl.requestSearch('people');
      expect( $ctrl.searchParams.type ).toEqual( 'people' );
    } );

    it( 'pulls ministry list', () => {
      spyOn( $ctrl.designationsService, 'productSearch' ).and.returnValue( Observable.of( [] ) );

      $ctrl.$onInit();
      $ctrl.requestSearch('ministries');
      expect( $ctrl.searchResults ).toEqual( ministries );
    } );
  } );

  describe( 'exploreSearch', () => {
    it( 'navigates to cru.org search page, keyword search', () => {
      $ctrl.$onInit();

      $ctrl.searchParams = {
        keyword: 'steve'
      };
      $ctrl.exploreSearch();
      expect( $ctrl.$window.location ).toEqual( 'https://www.cru.org/search.steve.html' );
    } );

    it( 'navigates to cru.org search page, first/last name search', () => {
      $ctrl.$onInit();

      $ctrl.searchParams = {
        first_name: 'steve',
        last_name: 'doe'
      };
      $ctrl.exploreSearch();
      expect( $ctrl.$window.location ).toEqual( 'https://www.cru.org/search.steve%20doe.html' );
    } );
  } );

} );
