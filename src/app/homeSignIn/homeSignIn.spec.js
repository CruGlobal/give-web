import angular from 'angular';
import 'angular-mocks';
import module from './homeSignIn.component';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';

describe('home sign in', function() {
  beforeEach(angular.mock.module(module.name));
  let $ctrl, $rootScope;

  beforeEach(inject(function(_$componentController_, _$rootScope_) {
    $rootScope = _$rootScope_;

    $ctrl = _$componentController_(module.name);
  }));

  it('to be defined', function() {
    expect($ctrl).toBeDefined();
  });

  it('sign in should show loading overlay', function() {
    $ctrl.signIn();
    expect($ctrl.isSigningIn).toEqual(true);
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
});
