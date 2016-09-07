import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import module from './forgotPasswordModal.component';

describe( 'forgotPasswordModal', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, $rootScope;

  beforeEach( inject( function ( _$componentController_, _$rootScope_ ) {
    $rootScope = _$rootScope_;
    $ctrl = _$componentController_( module.name );
  } ) );

  it( 'to be defined', () => {
    expect( $ctrl ).toBeDefined();
  } );

  describe( '$onInit()', () => {
    it( 'initializes the componenet', () => {
      $ctrl.$onInit();
      expect( $ctrl.emailSent ).toEqual( false );
      expect( $ctrl.isLoading ).toEqual( false );
      expect( $ctrl.modalTitle ).toEqual( 'Reset Password' );
    } );
  } );

  describe( 'forgotPassword()', () => {
    let deferred;
    beforeEach( inject( function ( _$q_ ) {
      deferred = _$q_.defer();
      spyOn( $ctrl.sessionService, 'forgotPassword' ).and.callFake( () => Observable.from( deferred.promise ) );
      spyOn( $ctrl, 'resetPasswordUrl' ).and.returnValue( 'http://example.com' );
      $ctrl.email = 'professorx@xavier.edu';
      $ctrl.forgotPassword();
    } ) );

    it( 'sets isLoading to true and calls sessionService.resetPassword', () => {
      expect( $ctrl.isLoading ).toEqual( true );
      expect( $ctrl.resetPasswordUrl ).toHaveBeenCalled();
      expect( $ctrl.sessionService.forgotPassword )
        .toHaveBeenCalledWith( 'professorx@xavier.edu', 'http://example.com' );
    } );

    describe( 'forgotPassword success', () => {
      beforeEach( () => {
        deferred.resolve();
        $rootScope.$digest();
      } );

      it( 'sets emailSent', () => {
        expect( $ctrl.forgotError ).toEqual( false );
        expect( $ctrl.isLoading ).toEqual( false );
        expect( $ctrl.emailSent ).toEqual( true );
      } );
    } );

    describe( 'forgotPassword failure', () => {
      describe( '403 Forbidden', () => {
        it( 'sets \'password_cant_change\' error', () => {
          deferred.reject( {status: 403, data: {error: 'password_cant_change'}} );
          $rootScope.$digest();
          expect( $ctrl.forgotError ).toEqual( true );
          expect( $ctrl.errors ).toEqual( jasmine.objectContaining( {password_cant_change: true} ) );
        } );
      } );
      describe( '404 Not Found', () => {
        it( 'sets \'user_not_found\' error', () => {
          deferred.reject( {status: 404, data: {error: 'user_not_found'}} );
          $rootScope.$digest();
          expect( $ctrl.forgotError ).toEqual( true );
          expect( $ctrl.errors ).toEqual( jasmine.objectContaining( {user_not_found: true} ) );
        } );
      } );
      describe( '500 Internal Server Error', () => {
        it( 'sets \'unknown\' error', () => {
          deferred.reject( {status: 500, data: {error: 'unknown'}} );
          $rootScope.$digest();
          expect( $ctrl.forgotError ).toEqual( true );
          expect( $ctrl.errors ).toEqual( jasmine.objectContaining( {unknown: true} ) );
        } );
      } );
    } );
  } );

  describe( 'resetPasswordUrl()', () => {
    beforeEach( () => {
      $ctrl.$location = {
        absUrl: jasmine.createSpy( 'absUrl' ).and.returnValue( 'http://example.com/index.html?key=value' ),
        search: jasmine.createSpy( 'search' ).and.returnValue( {key: 'value'} )
      };
    } );

    it( 'adds modal=reset-password&theme=cru to the current url', () => {
      expect( $ctrl.resetPasswordUrl() ).toEqual( 'http://server/?key=value&modal=reset-password&theme=cru' );
    } );
  } );
} );
