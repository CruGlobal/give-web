import angular from 'angular';
import 'angular-mocks';
import module from './recipientGift.component';
import {ReplaySubject} from 'rxjs';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';

describe( 'your giving', function () {
  describe( 'recipient view', () => {
    describe( 'recipient gift', () => {
      beforeEach( angular.mock.module( module.name ) );
      let $ctrl;

      beforeEach( inject( ( _$componentController_ ) => {
        $ctrl = _$componentController_( module.name, {}, {
          recipient: {}
        } );
      } ) );

      it( 'to be defined', function () {
        expect( $ctrl ).toBeDefined();
        expect( $ctrl.donationsService ).toBeDefined();
        expect( $ctrl.profileService ).toBeDefined();
        expect( $ctrl.productModalService ).toBeDefined();
        expect( $ctrl.showDetails ).toEqual( false );
        expect( $ctrl.detailsLoaded ).toEqual( false );
        expect( $ctrl.currentDate ).toEqual( jasmine.any( Date ) );
      } );

      describe( 'toggleDetails', () => {
        let subject;
        beforeEach( () => {
          subject = new ReplaySubject( [] );
          spyOn( $ctrl.profileService, 'getPaymentMethods' ).and.callFake( () => subject );
        } );

        it( 'shows the details section', () => {
          $ctrl.toggleDetails();
          expect( $ctrl.profileService.getPaymentMethods ).toHaveBeenCalled( );
          expect( $ctrl.showDetails ).toEqual( true );
          expect( $ctrl.isLoading ).toEqual( true );
          subject.next( );
          expect( $ctrl.isLoading ).toEqual( false );
          expect( $ctrl.detailsLoaded ).toEqual( true );
        } );

        it( 'set payment method on donation', () => {
          $ctrl.profileService.getPaymentMethods.and.returnValue( Observable.of([
            {
              id: 'aaa111'
            }
          ]) );

          $ctrl.recipient = {
            donations: [{
              'historical-donation-line': {
                'payment-method-id': 'aaa111'
              }
            }]
          };

          $ctrl.toggleDetails();

          expect( $ctrl.recipient.donations[0].paymentmethod ).toBeDefined( );

        } );

        it( 'doesnt load details a second time', () => {
          $ctrl.detailsLoaded = true;
          $ctrl.toggleDetails();
          expect( $ctrl.profileService.getPaymentMethods ).not.toHaveBeenCalled();
        } );

        it( 'should log and error on failure', () => {
          $ctrl.profileService.getPaymentMethods.and.returnValue(Observable.throw('some error'));
          $ctrl.toggleDetails();
          expect( $ctrl.showDetails ).toEqual( false );
          expect( $ctrl.isLoading ).toEqual( false );
          expect($ctrl.loadingDetailsError).toEqual(true);
          expect($ctrl.$log.error.logs[0]).toEqual(['Error loading recipient details', 'some error']);
        } );
      } );

      describe( 'giveNewGift()', () => {
        beforeEach( () => {
          spyOn( $ctrl.productModalService, 'configureProduct' );
        } );

        it( 'displays productConfig modal', () => {
          $ctrl.recipient = {'designation-number': '01234567'};
          $ctrl.giveNewGift();
          expect( $ctrl.productModalService.configureProduct ).toHaveBeenCalledWith( '01234567', jasmine.any(Object) );
        } );
      } );
    } );
  } );
} );
