import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import module from './signInForm.component';
import {cortexSession} from 'common/services/session/fixtures/cortex-session';
import {giveSession} from 'common/services/session/fixtures/give-session';


describe( 'signInForm', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, bindings, $rootScope;

  beforeEach( inject( function ( _$rootScope_, _$componentController_ ) {
    $rootScope = _$rootScope_;
    bindings = jasmine.createSpyObj( 'bindings', ['onSuccess', 'onFailure'] );

    $ctrl = _$componentController_( module.name, {}, bindings );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
  } );

  describe( '$onInit', () => {
    it( 'has no username', () => {
      $ctrl.$onInit();
      expect( $ctrl.username ).not.toBeDefined();
    } );

    describe( 'with \'REGISTERED\' cortex-session', () => {
      let $cookies;
      beforeEach( inject( function ( _$cookies_ ) {
        $cookies = _$cookies_;
        $cookies.put( 'cortex-session', cortexSession.registered );
        $cookies.put( 'give-session', giveSession );
        $rootScope.$digest();
      } ) );

      afterEach( () => {
        ['cortex-session', 'give-session'].forEach( ( name ) => {
          $cookies.remove( name );
        } );
      } );

      it( 'sets username', () => {
        expect( $ctrl.username ).not.toBeDefined();
        $ctrl.$onInit();
        expect( $ctrl.username ).toEqual( 'professorx@xavier.edu' );
      } );
    } );
  } );

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
      expect( bindings.onSuccess ).toHaveBeenCalled();
    } );

    it( 'has error signing in', () => {
      deferred.reject( {data: {error: 'Error Signing In'}} );
      $rootScope.$digest();
      expect( bindings.onFailure ).toHaveBeenCalled();
      expect( $ctrl.errorMessage ).toEqual( 'Error Signing In' );
      expect( $ctrl.isSigningIn ).toEqual( false );
    } );
  } );
} );
