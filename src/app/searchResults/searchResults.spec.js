import angular from 'angular';
import 'angular-mocks';
import module from './searchResults.component';

describe( 'searchResults', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( function ( _$componentController_ ) {
    $ctrl = _$componentController_( module.name,
      {$window: {location: {href: 'search-results.html'}}}
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

    it( 'clears first/last name on type change', () => {
      $ctrl.$onInit();

      $ctrl.searchParams = {
        keyword: 'steve',
        type: '',
        first_name: 'Steve',
        last_name: 'Underwood'
      };
      $ctrl.requestSearch('');
      expect( $ctrl.searchParams.first_name ).toEqual( '' );
      expect( $ctrl.searchParams.last_name ).toEqual( '' );
    } );
  } );

  describe( 'exploreSearch', () => {
    it( 'navigates to cru.org search page', () => {
      $ctrl.$onInit();

      $ctrl.searchParams = {
        keyword: 'steve'
      };
      $ctrl.exploreSearch();
      expect( $ctrl.$window.location.href ).toEqual( 'https://www.cru.org/content/cru/us/en/search.steve.html' );
    } );
  } );

} );
