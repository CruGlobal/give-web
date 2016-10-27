import angular from 'angular';
import 'angular-mocks';
import module from './redirectGiftStep3.component';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

describe( 'your giving', () => {
  describe( 'stopStartRecurringGiftsModal', () => {
    describe( 'redirectGift', () => {
      describe( 'step3', () => {
        describe( 'redirectGiftStep3', () => {
          beforeEach( angular.mock.module( module.name ) );
          let $ctrl;

          beforeEach( inject( ( $componentController ) => {
            $ctrl = $componentController( module.name, {}, jasmine.createSpyObj( 'bindings', ['onComplete', 'onCancel', 'onPrevious', 'setLoading'] ) );
          } ) );

          it( 'is defined', () => {
            expect( $ctrl ).toBeDefined();
            expect( $ctrl.state ).toEqual( 'update' );
            expect( $ctrl.commonService ).toBeDefined();
            expect( $ctrl.donationsService ).toBeDefined();
          } );

          describe( '$onInit()', () => {
            it( 'initializes the component', () => {
              spyOn( $ctrl, 'loadNextDrawDate' );
              $ctrl.$onInit();
              expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
              expect( $ctrl.loadNextDrawDate ).toHaveBeenCalled();
            } );
          } );

          describe( 'loadNextDrawDate()', () => {
            it( 'loads next draw date and shows component', () => {
              spyOn( $ctrl.commonService, 'getNextDrawDate' ).and.returnValue( Observable.of( '2020-01-01' ) );
              $ctrl.loadNextDrawDate();
              expect( $ctrl.nextDrawDate ).toEqual( '2020-01-01' );
              expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: false} );
            } );
          } );

          describe( 'submitGift', () => {
            beforeEach( () => {
              $ctrl.hasError = true;
              $ctrl.gift = {designationName: 'Javier', designationNumber: '6543210'};
            } );

            describe( 'updateRecurringGifts success', () => {
              it( 'completes the gift redirect', () => {
                spyOn( $ctrl.donationsService, 'updateRecurringGifts' ).and.returnValue( Observable.of( {} ) );
                $ctrl.submitGift();
                expect( $ctrl.hasError ).toEqual( false );
                expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
                expect( $ctrl.donationsService.updateRecurringGifts ).toHaveBeenCalledWith( {
                  designationName:   'Javier',
                  designationNumber: '6543210'
                } );
                expect( $ctrl.onComplete ).toHaveBeenCalled();
              } );
            } );
            describe( 'updateRecurringGifts failure', () => {
              it( 'completes the gift redirect', () => {
                spyOn( $ctrl.donationsService, 'updateRecurringGifts' ).and.returnValue( Observable.throw( undefined ) );
                $ctrl.submitGift();
                expect( $ctrl.hasError ).toEqual( true );
                expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
                expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: false} );
                expect( $ctrl.onComplete ).not.toHaveBeenCalled();
              } );
            } );
          } );

          describe( 'previous()', () => {
            beforeEach( () => {
              $ctrl.hasError = true;
            } );

            describe( 'state = \'update\'', () => {
              it( 'calls onPrevious()', () => {
                $ctrl.state = 'update';
                $ctrl.previous();
                expect( $ctrl.hasError ).toEqual( false );
                expect( $ctrl.onPrevious ).toHaveBeenCalled();
              } );
            } );
            describe( 'state = \'confirm\'', () => {
              it( 'sets state to \'update\'', () => {
                $ctrl.state = 'confirm';
                $ctrl.previous();
                expect( $ctrl.hasError ).toEqual( false );
                expect( $ctrl.state ).toEqual( 'update' );
                expect( $ctrl.onPrevious ).not.toHaveBeenCalled();
              } );
            } );
          } );
        } );
      } );
    } );
  } );
} );
