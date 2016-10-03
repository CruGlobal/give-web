import angular from 'angular';
import 'angular-mocks';
import keys from 'lodash/keys';
import module from './yourGiving.component';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import {Roles} from 'common/services/session/session.service';
import {queryParams} from './yourGiving.component';

describe( 'your giving', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( ( _$componentController_ ) => {
    $ctrl = _$componentController_( module.name, {
      $window: {location: 'your-giving.html'}
    } );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
    expect( $ctrl.$window ).toBeDefined();
    expect( $ctrl.$location ).toBeDefined();
    expect( $ctrl.sessionEnforcerService ).toBeDefined();
    expect( $ctrl.profileService ).toBeDefined();
    expect( $ctrl.sessionService ).toBeDefined();
  } );

  describe( '$onInit()', () => {
    beforeEach( () => {
      spyOn( $ctrl, 'loadProfile' );
      spyOn( $ctrl, 'sessionEnforcerService' );
      spyOn( $ctrl, 'setGivingView' );
    } );

    describe( '\'PUBLIC\' role', () => {
      it( 'sets profileLoading and registers sessionEnforcer', () => {
        spyOn( $ctrl.sessionService, 'getRole' ).and.returnValue( Roles.public );
        $ctrl.$onInit();

        expect( $ctrl.sessionEnforcerService ).toHaveBeenCalledWith(
          [Roles.registered], jasmine.objectContaining( {
            'sign-in': jasmine.any( Function ),
            cancel:    jasmine.any( Function )
          } )
        );
        expect( $ctrl.setGivingView ).toHaveBeenCalled();
        expect( $ctrl.profileLoading ).toEqual( true );
        expect( $ctrl.loadProfile ).not.toHaveBeenCalled();
      } );
    } );

    describe( '\'REGISTERED\' role', () => {
      it( 'calls loadProfile and registers sessionEnforcer', () => {
        spyOn( $ctrl.sessionService, 'getRole' ).and.returnValue( Roles.registered );
        $ctrl.$onInit();

        expect( $ctrl.sessionEnforcerService ).toHaveBeenCalledWith(
          [Roles.registered], jasmine.objectContaining( {
            'sign-in': jasmine.any( Function ),
            cancel:    jasmine.any( Function )
          } )
        );
        expect( $ctrl.setGivingView ).toHaveBeenCalled();
        expect( $ctrl.loadProfile ).toHaveBeenCalled();
      } );
    } );

    describe( 'sessionEnforcerService success', () => {
      it( 'executes success callback', () => {
        expect( $ctrl.loadProfile ).not.toHaveBeenCalled();

        $ctrl.$onInit();
        $ctrl.sessionEnforcerService.calls.argsFor( 0 )[1]['sign-in']();
        expect( $ctrl.loadProfile ).toHaveBeenCalledTimes( 1 );
      } );
    } );

    describe( 'sessionEnforcerService failure', () => {
      it( 'executes failure callback', () => {
        $ctrl.$onInit();
        $ctrl.sessionEnforcerService.calls.argsFor( 0 )[1]['cancel']();
        expect( $ctrl.$window.location ).toEqual( '/cart.html' );
      } );
    } );
  } );

  describe( '$onDestroy()', () => {
    it( 'cleans up the component', () => {
      spyOn( $ctrl.sessionEnforcerService, 'cancel' );
      spyOn( $ctrl.$location, 'search' );

      $ctrl.enforcerId = '1234567890';
      $ctrl.$onDestroy();
      expect( $ctrl.sessionEnforcerService.cancel ).toHaveBeenCalledWith( '1234567890' );
      expect( $ctrl.$location.search ).toHaveBeenCalledTimes( keys( queryParams ).length );
    } );
  } );

  describe( 'loadProfile()', () => {
    beforeEach( () => {
      $ctrl.profileLoading = true;
    } );

    it( 'successfully loads profile', () => {
      spyOn( $ctrl.profileService, 'getGivingProfile' ).and.returnValue( Observable.of( {a: 'b'} ) );

      $ctrl.loadProfile();
      expect( $ctrl.profile ).toEqual( {a: 'b'} );
      expect( $ctrl.profileLoading ).toEqual( false );
      expect( $ctrl.currentDate ).toEqual( jasmine.any( Date ) );
    } );
  } );

  describe( 'setGivingView( name )', () => {
    it( 'sets view based on url query param', () => {
      spyOn( $ctrl.$location, 'search' ).and.returnValue( {[queryParams.view]: 'historical'} );

      $ctrl.setGivingView();
      expect( $ctrl.$location.search ).toHaveBeenCalled();
      expect( $ctrl.view ).toEqual( 'historical' );
      expect( $ctrl.$location.search ).toHaveBeenCalledWith( queryParams.view, 'historical' );
    } );

    it( 'sets view to \'recipient\' if name missing', () => {
      spyOn( $ctrl.$location, 'search' ).and.returnValue( {} );

      $ctrl.setGivingView();
      expect( $ctrl.$location.search ).toHaveBeenCalled();
      expect( $ctrl.view ).toEqual( 'recipient' );
      expect( $ctrl.$location.search ).toHaveBeenCalledWith( queryParams.view, 'recipient' );
    } );

    it( 'sets view', () => {
      spyOn( $ctrl.$location, 'search' ).and.returnValue( {} );

      $ctrl.setGivingView( 'historical' );
      expect( $ctrl.view ).toEqual( 'historical' );
      expect( $ctrl.$location.search ).toHaveBeenCalledWith( queryParams.view, 'historical' );
    } );
  } );

  describe( 'setViewLoading( loading )', () => {
    it( 'sets viewLoading', () => {
      $ctrl.setViewLoading( true );
      expect( $ctrl.viewLoading ).toEqual( true );
      $ctrl.setViewLoading( false );
      expect( $ctrl.viewLoading ).toEqual( false );
    } );
  } );
} );
