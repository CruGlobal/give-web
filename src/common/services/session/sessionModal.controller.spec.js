import angular from 'angular';
import 'angular-mocks';
import module from './sessionModal.controller';

describe( 'sessionModalController', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, uibModalInstance, state;

  beforeEach( inject( function ( $controller, ) {
    uibModalInstance = {
      close:   angular.noop,
      dismiss: angular.noop
    };
    state = 'sign-in';
    $ctrl = $controller( module.name, {
      $uibModalInstance: uibModalInstance,
      state:             state
    } );
    spyOn( uibModalInstance, 'close' );
    spyOn( uibModalInstance, 'dismiss' );
  } ) );

  describe( '$ctrl.stateChanged', () => {
    it( 'should be defined', () => {
      expect( $ctrl.stateChanged ).toBeDefined();
      expect( $ctrl.state ).toEqual( 'sign-in' );
    } );

    it( 'should update state', () => {
      $ctrl.stateChanged( 'sign-up' );
      expect( $ctrl.state ).toEqual( 'sign-up' );
    } );
  } );

  describe( '$ctrl.onSignInSuccess', () => {
    it( 'should close modal', () => {
      $ctrl.onSignInSuccess();
      expect( uibModalInstance.close ).toHaveBeenCalled();
    } );
  } );

  describe( '$ctrl.onSignUpSuccess', () => {
    it( 'should close modal', () => {
      $ctrl.onSignUpSuccess();
      expect( uibModalInstance.close ).toHaveBeenCalled();
    } );
  } );

  describe( '$ctrl.onFailure', () => {
    it( 'should dismiss modal with \'error\'', () => {
      $ctrl.onFailure();
      expect( uibModalInstance.dismiss ).toHaveBeenCalledWith( 'error' );
    } );
  } );

  describe( '$ctrl.onCancel', () => {
    it( 'should dismiss modal with \'cancel\'', () => {
      $ctrl.onCancel();
      expect( uibModalInstance.dismiss ).toHaveBeenCalledWith( 'cancel' );
    } );
  } );
} );
