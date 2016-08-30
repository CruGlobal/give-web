import angular from 'angular';
import 'angular-mocks';
import module from './resetPasswordModal.component';

describe( 'resetPasswordModal', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( function ( _$componentController_ ) {
    $ctrl = _$componentController_( module.name );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
  } );

  describe( '$onInit()', () => {
    it( 'initializes the modal', () => {
      $ctrl.$onInit();
      expect( $ctrl.modalTitle ).toEqual( 'Reset Password' );
    } );
  } );
} );
