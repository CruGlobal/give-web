import angular from 'angular';
import 'angular-mocks';
import module from './historicalView.component';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

describe( 'your giving', function () {
  describe( 'historical view', () => {
    beforeEach( angular.mock.module( module.name ) );
    let $ctrl;

    beforeEach( inject( ( _$componentController_ ) => {
      $ctrl = _$componentController_( module.name, {}, {
        year:       2016,
        month:      {month: 9},
        setLoading: jasmine.createSpy( 'setLoading' )
      } );
    } ) );

    it( 'to be defined', function () {
      expect( $ctrl ).toBeDefined();
      expect( $ctrl.donationsService ).toBeDefined();
    } );

    describe( '$onChanges()', () => {
      beforeEach( () => {
        spyOn( $ctrl, 'loadGifts' );
      } );

      it( 'should reload historical gifts when year changes', () => {
        $ctrl.year = 2018;
        $ctrl.$onChanges({ year: { currentValue: 2018 } });
        expect( $ctrl.loadGifts ).toHaveBeenCalledWith( 2018, 9 );
      } );

      it( 'should reload historical gifts when month changes', () => {
        $ctrl.month = {month:  10};
        $ctrl.$onChanges({ year: { currentValue: 10 } });
        expect( $ctrl.loadGifts ).toHaveBeenCalledWith( 2016, 10 );
      } );

      it( 'should reload historical gifts when reload changes to true', () => {
        $ctrl.$onChanges({ reload: { currentValue: true } });
        expect( $ctrl.loadGifts ).toHaveBeenCalledWith( 2016, 9 );
      } );

      it( 'should not reload historical gifts when reload changes to false', () => {
        $ctrl.$onChanges({ reload: { currentValue: false } });
        expect( $ctrl.loadGifts ).not.toHaveBeenCalled();
      } );

      it( 'does nothing if there are no changes', () => {
        $ctrl.$onChanges({});
        expect( $ctrl.loadGifts ).not.toHaveBeenCalled();
      } );
    } );

    describe( 'loadGifts( year, month )', () => {
      let subscriberSpy;
      beforeEach( () => {
        subscriberSpy = jasmine.createSpyObj( 'subscriber', ['unsubscribe'] );
        spyOn( $ctrl.donationsService, 'getHistoricalGifts' );
      } );

      it( 'loads historical gifts by year and month if current request is pending', () => {
        $ctrl.donationsService.getHistoricalGifts.and.callFake( () => Observable.of( ['a', 'b'] ) );
        $ctrl.subscriber = subscriberSpy;
        $ctrl.loadGifts( 2016, 9 );
        expect( $ctrl.loadingGiftsError).toEqual(false);
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
        expect( subscriberSpy.unsubscribe ).toHaveBeenCalled();
        expect( $ctrl.donationsService.getHistoricalGifts ).toHaveBeenCalledWith( 2016, 9 );
        expect( $ctrl.historicalGifts ).toEqual( ['a', 'b'] );
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: false} );
      } );

      it( 'loads historical gifts by year and month', () => {
        $ctrl.donationsService.getHistoricalGifts.and.callFake( () => Observable.of( ['c', 'd'] ) );
        $ctrl.loadGifts( 2015, 8 );
        expect( $ctrl.loadingGiftsError).toEqual(false);
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
        expect( subscriberSpy.unsubscribe ).not.toHaveBeenCalled();
        expect( $ctrl.donationsService.getHistoricalGifts ).toHaveBeenCalledWith( 2015, 8 );
        expect( $ctrl.historicalGifts ).toEqual( ['c', 'd'] );
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: false} );
      } );

      it( 'sets loading false on error ', () => {
        $ctrl.donationsService.getHistoricalGifts.and.callFake( () => Observable.throw( 'error' ) );
        $ctrl.loadGifts( 1990, 1 );
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
        expect( $ctrl.historicalGifts ).not.toBeDefined();
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: false} );
        expect( $ctrl.loadingGiftsError).toEqual(true);
        expect( $ctrl.$log.error.logs[0]).toEqual( ['Error loading historical gifts', 'error'] );
      } );
    } );
  } );
} );
