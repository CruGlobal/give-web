import angular from 'angular';
import 'angular-mocks';
import module from './accountBenefitsModal.component';
import {Roles} from 'common/services/session/session.service';

describe( 'accountBenefitsModal', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, bindings;

  beforeEach( inject( function ( _$componentController_ ) {
    bindings = {
      modalTitle:    '',
      onStateChange: jasmine.createSpy( 'onStateChange' ),
      onSuccess:     jasmine.createSpy( 'onSuccess' )
    };
    $ctrl = _$componentController_( module.name, {}, bindings );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
  } );

  describe( '$onInit', () => {
    it( 'initializes component', () => {
      $ctrl.$onInit();
      expect( $ctrl.modalTitle ).toEqual( 'Register Your Account for Online Access' );
    } );
  } );

  describe( 'registerAccount()', () => {
    it( 'call onSuccess if role is registered', () => {
      spyOn( $ctrl.sessionService, 'getRole' ).and.returnValue( Roles.registered );
      $ctrl.registerAccount();
      expect( $ctrl.onSuccess ).toHaveBeenCalled();
    } );

    it( 'changes state to \'sign-in\'', () => {
      $ctrl.registerAccount();
      expect( $ctrl.onStateChange ).toHaveBeenCalledWith( {state: 'sign-in'} );
    } );
  } );
} );
