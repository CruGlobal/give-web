import angular from 'angular';
import 'angular-mocks';
import module from './redirectGiftStep2.component';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

describe( 'your giving', () => {
  describe( 'stopStartRecurringGiftsModal', () => {
    describe( 'redirectGift', () => {
      describe( 'step2', () => {
        describe( 'redirectGiftStep2', () => {
          beforeEach( angular.mock.module( module.name ) );
          let $ctrl, designationsService;

          beforeEach( inject( ( $componentController, _designationsService_ ) => {
            designationsService = _designationsService_;
            $ctrl = $componentController( module.name, {}, {
              onSelectResult: jasmine.createSpy( 'onSelectResult' )
            } );
          } ) );

          it( 'is defined', () => {
            expect( $ctrl ).toBeDefined();
            expect( $ctrl.designationsService ).toEqual( designationsService );
            expect( $ctrl.find ).toEqual( jasmine.any( Function ) );
            expect( $ctrl.performSearch ).toEqual( jasmine.any( Function ) );
          } );

          describe( 'doSearch()', () => {
            let subscriber;
            beforeEach( () => {
              spyOn( $ctrl, 'performSearch' );
              subscriber = jasmine.createSpyObj( 'subscriber', ['unsubscribe'] );
            } );

            it( 'cancels current subscriber and performs search', () => {
              $ctrl.subscriber = subscriber;
              $ctrl.doSearch();
              expect( subscriber.unsubscribe ).toHaveBeenCalled();
              expect( $ctrl.subscriber ).not.toBeDefined();
              expect( $ctrl.searchState ).toEqual( 'searching' );
              expect( $ctrl.performSearch ).toHaveBeenCalled();
            } );

            it( 'performs search', () => {
              $ctrl.doSearch();
              expect( $ctrl.searchState ).toEqual( 'searching' );
              expect( $ctrl.performSearch ).toHaveBeenCalled();
            } );
          } );

          describe( '_performSearch', () => {
            beforeEach( () => {
              $ctrl.search = 'testing';
            } );

            describe( 'search has results', () => {
              it( 'sets searchState and results', () => {
                spyOn( $ctrl.designationsService, 'productSearch' ).and.returnValue( Observable.of( [
                  {name: 'A', designationNumber: '01234567'},
                  {name: 'B', designationNumber: '76543210'}
                ] ) );
                $ctrl._performSearch();
                expect( $ctrl.designationsService.productSearch ).toHaveBeenCalledWith( {keyword: 'testing'} );
                expect( $ctrl.searchState ).toEqual( 'results' );
                expect( $ctrl.results ).toEqual( [
                  {designationName: 'A', designationNumber: '01234567'},
                  {designationName: 'B', designationNumber: '76543210'}
                ] );
              } );
            } );

            describe( 'search has no results', () => {
              it( 'sets searchState and results', () => {
                spyOn( $ctrl.designationsService, 'productSearch' ).and.returnValue( Observable.of( [] ) );
                $ctrl._performSearch();
                expect( $ctrl.designationsService.productSearch ).toHaveBeenCalledWith( {keyword: 'testing'} );
                expect( $ctrl.searchState ).toEqual( 'no-results' );
                expect( $ctrl.results ).not.toBeDefined();
              } );
            } );
          } );

          describe( 'selectResult()', () => {
            beforeEach( () => {
              $ctrl.results = [{result: 1}, {result: 2}, {result: 3}, {result: 4}, {result: 5}];
            } );

            it( 'filters only selected result', () => {
              $ctrl.results[0]._selectedGift = true;
              $ctrl.results[2]._selectedGift = false;
              $ctrl.selectResult();
              expect( $ctrl.onSelectResult ).toHaveBeenCalledWith( {
                selected: {result: 1, _selectedGift: true}
              } );
            } );
          } );

          describe( 'resultSelected( result )', () => {
            beforeEach( () => {
              $ctrl.results = [{result: 1}, {result: 2}, {result: 3}, {result: 4}, {result: 5}];
            } );

            it( 'de-selects previously selected result', () => {
              $ctrl.results[0]._selectedGift = true;
              // gift-list-item selects the gift before calling giftSelected
              $ctrl.results[2]._selectedGift = true;
              $ctrl.resultSelected( $ctrl.results[2] );
              expect( $ctrl.results[2]._selectedGift ).toEqual( true );
              expect( $ctrl.results[0]._selectedGift ).toEqual( false );
            } );
          } );
        } );
      } );
    } );
  } );
} );
