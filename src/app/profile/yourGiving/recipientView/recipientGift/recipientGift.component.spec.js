import angular from 'angular';
import 'angular-mocks';
import module from './recipientGift.component';
import {ReplaySubject} from 'rxjs';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';

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
        expect( $ctrl.productModalService ).toBeDefined();
        expect( $ctrl.showDetails ).toEqual( false );
        expect( $ctrl.detailsLoaded ).toEqual( false );
        expect( $ctrl.currentDate ).toEqual( jasmine.any( Date ) );
      } );

      describe( 'toggleDetails', () => {
        let subject;
        beforeEach( () => {
          subject = new ReplaySubject( [] );
          spyOn( $ctrl.donationsService, 'getRecipientDetails' ).and.callFake( () => subject );
        } );

        it( 'shows the details section', () => {
          $ctrl.recipient = 'a';
          $ctrl.toggleDetails();
          expect( $ctrl.donationsService.getRecipientDetails ).toHaveBeenCalledWith( 'a' );
          expect( $ctrl.showDetails ).toEqual( true );
          expect( $ctrl.isLoading ).toEqual( true );
          subject.next( ['a', 'b'] );
          expect( $ctrl.details ).toEqual( ['a', 'b'] );
          expect( $ctrl.isLoading ).toEqual( false );
          expect( $ctrl.detailsLoaded ).toEqual( true );
        } );

        it( 'doesnt load details a second time', () => {
          $ctrl.detailsLoaded = true;
          $ctrl.toggleDetails();
          expect( $ctrl.donationsService.getRecipientDetails ).not.toHaveBeenCalled();
        } );

        it( 'should log and error on failure', () => {
          $ctrl.donationsService.getRecipientDetails.and.returnValue(Observable.throw('some error'));
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
