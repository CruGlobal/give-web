import angular from 'angular';
import 'angular-mocks';
import module from './sessionModal.service';

describe( 'sessionModalService', function () {
  beforeEach( angular.mock.module( module.name ) );
  let sessionModalService, $uibModal;

  beforeEach( inject( function ( _sessionModalService_, _$uibModal_ ) {
    sessionModalService = _sessionModalService_;
    $uibModal = _$uibModal_;
    // Spy On $uibModal.open and return mock object
    spyOn( $uibModal, 'open' ).and.returnValue( {result: angular.noop} );
  } ) );

  it( 'should be defined', () => {
    expect( sessionModalService ).toBeDefined();
  } );

  describe( 'open', () => {
    it( 'should be defined', () => {
      expect( sessionModalService.open ).toBeDefined();
    } );

    it( 'should open \'sign-in\' by default', () => {
      sessionModalService.open();
      expect( $uibModal.open ).toHaveBeenCalled();
      expect( $uibModal.open.calls.count() ).toEqual( 1 );
      expect( $uibModal.open.calls.argsFor( 0 )[0].resolve.state() ).toEqual( 'sign-in' );
    } );

    it( 'should allow options', () => {
      sessionModalService.open( 'sign-up', {backdrop: false, keyboard: false} );
      expect( $uibModal.open ).toHaveBeenCalledTimes( 1 );
      expect( $uibModal.open ).toHaveBeenCalledWith(jasmine.objectContaining({backdrop: false, keyboard: false}));
    } );
  } );

  describe( 'signIn', () => {
    it( 'should open signIn modal', () => {
      sessionModalService.signIn();
      expect( $uibModal.open ).toHaveBeenCalledTimes( 1 );
      expect( $uibModal.open.calls.argsFor( 0 )[0].resolve.state() ).toEqual( 'sign-in' );
    } );
  } );

  describe( 'signUp', () => {
    it( 'should open signUp modal', () => {
      sessionModalService.signUp();
      expect( $uibModal.open ).toHaveBeenCalledTimes( 1 );
      expect( $uibModal.open.calls.argsFor( 0 )[0].resolve.state() ).toEqual( 'sign-up' );
    } );
  } );
} );
