import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import module from './redirectGift.component';

describe( 'your giving', () => {
  describe( 'stopStartRecurringGiftsModal', () => {
    describe( 'redirectGift', () => {
      beforeEach( angular.mock.module( module.name ) );
      let $ctrl, donationsService;

      beforeEach( inject( ( $componentController, _donationsService_ ) => {
        donationsService = _donationsService_;
        $ctrl = $componentController( module.name, {}, {
          changeState: jasmine.createSpy( 'changeState' ),
          setLoading:  jasmine.createSpy( 'setLoading' ),
          complete:    jasmine.createSpy( 'complete' )
        } );
      } ) );

      it( 'is defined', () => {
        expect( $ctrl ).toBeDefined();
        expect( $ctrl.donationsService ).toEqual( donationsService );
      } );

      describe( '$onInit', () => {
        it( 'initializes the component', () => {
          spyOn( $ctrl, 'loadRecurringGifts' );
          $ctrl.$onInit();
          expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
          expect( $ctrl.loadRecurringGifts ).toHaveBeenCalled();
        } );
      } );

      describe( 'setStep( step )', () => {
        it( 'sets the current step', () => {
          expect( $ctrl.step ).not.toBeDefined();
          $ctrl.setStep( 'step-1' );
          expect( $ctrl.step ).toEqual( 'step-1' );
        } );
      } );

      describe( 'previous()', () => {
        describe( 'undefined current step', () => {
          it( 'changes step to \'step-0\'', () => {
            $ctrl.previous();
            expect( $ctrl.changeState ).toHaveBeenCalledWith( {state: 'step-0'} );
          } );
        } );
        describe( 'current step \'step-1\'', () => {
          it( 'changes step to \'step-0\'', () => {
            $ctrl.step = 'step-1';
            $ctrl.previous();
            expect( $ctrl.changeState ).toHaveBeenCalledWith( {state: 'step-0'} );
          } );
        } );
        describe( 'current step \'step-2\'', () => {
          it( 'changes step to \'step-1\'', () => {
            $ctrl.step = 'step-2';
            $ctrl.previous();
            expect( $ctrl.step ).toEqual( 'step-1' );
            expect( $ctrl.changeState ).not.toHaveBeenCalled();
          } );
        } );
      } );

      describe( 'loadRecurringGifts()', () => {
        it( 'loads recurring gifts and changes step', () => {
          spyOn( $ctrl.donationsService, 'getRecurringGifts' ).and.returnValue( Observable.of( ['a', 'b'] ) );
          spyOn( $ctrl, 'setStep' );
          $ctrl.loadRecurringGifts();
          expect( $ctrl.donationsService.getRecurringGifts ).toHaveBeenCalled();
          expect( $ctrl.gifts ).toEqual( ['a', 'b'] );
          expect( $ctrl.setStep ).toHaveBeenCalledWith( 'step-1' );
          expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: false} );
        } );
      } );

      describe( 'selectGift( gift )', () => {
        it( 'sets selectedGift and moves to \'step-2\'', () => {
          spyOn( $ctrl, 'setStep' );
          $ctrl.selectGift( 'c' );
          expect( $ctrl.selectedGift ).toEqual( 'c' );
          expect( $ctrl.setStep ).toHaveBeenCalledWith( 'step-2' );
        } );
      } );
    } );
  } );
} );
