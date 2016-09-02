import angular from 'angular';
import 'angular-mocks';
import module from './homeSignIn.component';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import { cortexSession } from 'common/services/session/fixtures/cortex-session';

describe('home sign in', function() {
  beforeEach(angular.mock.module(module.name));
  let $ctrl, $cookies, $rootScope;

  beforeEach(inject(function(_$componentController_, _$rootScope_, _$cookies_) {
    $rootScope = _$rootScope_;

    $ctrl = _$componentController_(module.name);
    $cookies = _$cookies_;
  }));

  afterEach( () => {
    ['cortex-session', 'give-session', 'cru-session'].forEach( ( name ) => {
      $cookies.remove( name );
    } );
  } );

  it('to be defined', function() {
    expect($ctrl).toBeDefined();
  });

  it('sign in should show loading overlay', function() {
    $ctrl.signIn();
    expect($ctrl.isSigningIn).toEqual(true);
  });

  describe( '$onInit', () => {
    it( 'show sign in form if a unregistered user', () => {
      $ctrl.$onInit();

      expect( $ctrl.showSignInForm ).toEqual( true );
    } );

    it( 'don\'t show sign in form if a registered user', () => {
      $cookies.put( 'cortex-session', cortexSession.registered );
      // Force digest so scope session watchers pick up changes.
      $rootScope.$digest();
      $ctrl.$onInit();

      expect( $ctrl.showSignInForm ).toEqual( false );
    } );
  });

  describe( 'signIn', () => {
    let deferred;
    beforeEach( inject( function ( _$q_ ) {
      deferred = _$q_.defer();
      spyOn( $ctrl.sessionService, 'signIn' ).and.callFake( () => Observable.from( deferred.promise ) );
      $ctrl.username = 'professorx@xavier.edu';
      $ctrl.password = 'Cerebro123';
      $ctrl.signIn();
    } ) );

    it( 'calls sessionService signIn', () => {
      expect( $ctrl.isSigningIn ).toEqual( true );
      expect( $ctrl.sessionService.signIn ).toHaveBeenCalledWith( 'professorx@xavier.edu', 'Cerebro123' );
    } );

    it( 'signs in successfully', () => {
      deferred.resolve( {} );
      $rootScope.$digest();
      expect( $ctrl.showSignInForm ).toEqual(false);
      expect( $ctrl.isSigningIn ).toEqual(false);
    } );

    it( 'has error signing in', () => {
      deferred.reject( {data: {error: 'Error Signing In'}} );
      $rootScope.$digest();
      expect( $ctrl.errorMessage ).toEqual( 'Error Signing In' );
      expect( $ctrl.isSigningIn ).toEqual( false );
    } );
  } );

  describe( 'signUp', () => {
    beforeEach(() => {
      spyOn( $ctrl.sessionModalService, 'signUp' );
      $ctrl.signUp();
    } );

    it( 'opens signUp Modal', () => {
      expect( $ctrl.sessionModalService.signUp ).toHaveBeenCalled();
    } );
  });
});
