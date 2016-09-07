import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import module from './resetPasswordModal.component';

describe( 'resetPasswordModal', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, $rootScope;

  beforeEach( inject( function ( _$componentController_, _$rootScope_ ) {
    $rootScope = _$rootScope_;
    $ctrl = _$componentController_(
      module.name, {
        modalStateService: {
          name: jasmine.createSpy( 'name' )
        }
      }, {
        form:          {$valid: true},
        onStateChange: jasmine.createSpy( 'onStateChange' )
      }
    );
  } ) );

  describe( '$onInit()', () => {
    describe( 'missing required modalState.params', () => {
      it( 'changes to \'forgot-password\' state', () => {
        $ctrl.$onInit();
        expect( $ctrl.onStateChange ).toHaveBeenCalledWith( {state: 'forgot-password'} );
      } );
    } );

    describe( 'with modalState.params', () => {
      beforeEach( () => {
        spyOn( $ctrl.$location, 'search' ).and.returnValue( {e: 'professorx@xavier.edu', k: 'abc123def456'} );
      } );

      it( 'initializes the modal', () => {
        $ctrl.$onInit();
        expect( $ctrl.onStateChange ).not.toHaveBeenCalled();
        expect( $ctrl.email ).toEqual( 'professorx@xavier.edu' );
        expect( $ctrl.resetKey ).toEqual( 'abc123def456' );
        expect( $ctrl.isLoading ).toEqual( false );
        expect( $ctrl.passwordChanged ).toEqual( false );
        expect( $ctrl.modalTitle ).toEqual( 'Reset Password' );
      } );
    } );
  } );

  describe( 'resetPassword', () => {
    let deferred;
    beforeEach( inject( function ( _$q_ ) {
      deferred = _$q_.defer();
      spyOn( $ctrl.sessionService, 'resetPassword' ).and.callFake( () => Observable.from( deferred.promise ) );
    } ) );

    describe( 'invalid form', () => {
      it( 'does not submit the form', () => {
        $ctrl.form.$valid = false;
        $ctrl.resetPassword();
        expect( $ctrl.sessionService.resetPassword ).not.toHaveBeenCalled();
      } );
    } );

    describe( 'valid form', () => {
      beforeEach( () => {
        $ctrl.email = 'professorx@xavier.edu';
        $ctrl.password = 'Cerebro123';
        $ctrl.resetKey = 'abc123def456';
        $ctrl.resetPassword();
      } );

      it( 'sets isLoading to true and calls sessionService.resetPassword', () => {
        expect( $ctrl.isLoading ).toEqual( true );
        expect( $ctrl.sessionService.resetPassword )
          .toHaveBeenCalledWith( 'professorx@xavier.edu', 'Cerebro123', 'abc123def456' );
      } );

      describe( 'resetPassword success', () => {
        beforeEach( () => {
          spyOn( $ctrl.$location, 'search' );
          deferred.resolve();
          $rootScope.$digest();
        } );

        it( 'sets passwordChanged', () => {
          expect( $ctrl.isLoading ).toEqual( false );
          expect( $ctrl.passwordChanged ).toEqual( true );
          expect( $ctrl.modalState.name ).toHaveBeenCalledWith( null );
          expect( $ctrl.$location.search ).toHaveBeenCalledTimes( 2 );
        } );
      } );

      describe( 'resetPassword failure', () => {
        describe( '400 Bad Request', () => {
          it( 'sets \'invalid_reset_key\' error', () => {
            deferred.reject( {status: 400, data: {error: 'invalid_reset_key'}} );
            $rootScope.$digest();
            expect( $ctrl.hasError ).toEqual( true );
            expect( $ctrl.errors ).toEqual( jasmine.objectContaining( {invalid_reset_key: true} ) );
          } );
        } );
        describe( '403 Forbidden', () => {
          it( 'sets \'password_cant_change\' error', () => {
            deferred.reject( {status: 403, data: {error: 'password_cant_change'}} );
            $rootScope.$digest();
            expect( $ctrl.hasError ).toEqual( true );
            expect( $ctrl.errors ).toEqual( jasmine.objectContaining( {password_cant_change: true} ) );
          } );
        } );
        describe( '500 Internal Server Error', () => {
          it( 'sets \'unknown\' error', () => {
            deferred.reject( {status: 500, data: {error: 'unknown'}} );
            $rootScope.$digest();
            expect( $ctrl.hasError ).toEqual( true );
            expect( $ctrl.errors ).toEqual( jasmine.objectContaining( {unknown: true} ) );
          } );
        } );
      } );
    } );
  } );
} );
