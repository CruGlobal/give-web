import angular from 'angular';
import 'angular-mocks';
import module from './sessionModal.service';
import modalStateModule from 'common/services/modalState.service';

describe( 'sessionModalService', function () {
  beforeEach( angular.mock.module( module.name ) );
  let sessionModalService, $uibModal;

  beforeEach( inject( function ( _sessionModalService_, _$uibModal_ ) {
    sessionModalService = _sessionModalService_;
    $uibModal = _$uibModal_;
    // Spy On $uibModal.open and return mock object
    spyOn( $uibModal, 'open' ).and.returnValue( {result: {finally: angular.noop}} );
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
      expect( $uibModal.open ).toHaveBeenCalledWith( jasmine.objectContaining( {backdrop: false, keyboard: false} ) );
    } );

    describe( 'modal closes', () => {
      let deferred, $rootScope, modalStateService;
      beforeEach( inject( function ( _$q_, _$rootScope_, _$location_, _modalStateService_ ) {
        $rootScope = _$rootScope_;
        modalStateService = _modalStateService_;
        deferred = _$q_.defer();
        spyOn( modalStateService, 'name' );
        $uibModal.open.and.returnValue( {result: deferred.promise} );
      } ) );

      it( 'removes modal name', () => {
        sessionModalService.open();
        deferred.resolve();
        $rootScope.$digest();
        expect( modalStateService.name ).toHaveBeenCalledWith( null );
      } );
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

  describe( 'forgotPassword', () => {
    it( 'should open forgotPassword modal', () => {
      sessionModalService.forgotPassword();
      expect( $uibModal.open ).toHaveBeenCalledTimes( 1 );
      expect( $uibModal.open.calls.argsFor( 0 )[0].resolve.state() ).toEqual( 'forgot-password' );
    } );
  } );

  describe( 'resetPassword', () => {
    it( 'should open resetPassword modal', () => {
      sessionModalService.resetPassword();
      expect( $uibModal.open ).toHaveBeenCalledTimes( 1 );
      expect( $uibModal.open.calls.argsFor( 0 )[0].resolve.state() ).toEqual( 'reset-password' );
    } );
  } );

  describe( 'userMatch', () => {
    it( 'should open userMatch modal', () => {
      sessionModalService.userMatch();
      expect( $uibModal.open ).toHaveBeenCalledTimes( 1 );
      expect( $uibModal.open.calls.argsFor( 0 )[0].resolve.state() ).toEqual( 'user-match' );
    } );
  } );

  describe( 'registerAccount', () => {
    it( 'should open registerAccount modal', () => {
      sessionModalService.registerAccount();
      expect( $uibModal.open ).toHaveBeenCalledTimes( 1 );
      expect( $uibModal.open.calls.argsFor( 0 )[0].resolve.state() ).toEqual( 'register-account' );
    } );
  } );
} );

describe( 'sessionModalService module config', () => {
  let modalStateServiceProvider;

  beforeEach( () => {
    angular.mock.module( modalStateModule.name, function ( _modalStateServiceProvider_ ) {
      modalStateServiceProvider = _modalStateServiceProvider_;
      spyOn( modalStateServiceProvider, 'registerModal' );
    } );
    angular.mock.module( module.name );
  } );

  it( 'config to register \'reset-password\' modal', inject( function () {
    expect( modalStateServiceProvider.registerModal ).toHaveBeenCalledWith( 'reset-password', jasmine.any( Function ) );
  } ) );

  describe( 'invoke \'reset-password\' modal function', () => {
    let sessionModalService, $injector;

    beforeEach( inject( function ( _sessionModalService_, _$injector_ ) {
      sessionModalService = _sessionModalService_;
      $injector = _$injector_;
      spyOn( sessionModalService, 'resetPassword' );
    } ) );

    it( 'calls sessionModalService.resetPassword()', () => {
      let fn = modalStateServiceProvider.registerModal.calls.argsFor( 0 )[1];
      $injector.invoke( fn );
      expect( sessionModalService.resetPassword ).toHaveBeenCalled();
    } );
  } );
} );
