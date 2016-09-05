import angular from 'angular';
import 'angular-mocks';
import module from './productModal.service';

describe( 'productModalService', function () {
  beforeEach( angular.mock.module( module.name ) );
  let productModalService, designationsService, $uibModal, $rootScope;

  // eslint-disable-next-line no-undef
  installPromiseMatchers();

  beforeEach( inject( function ( _productModalService_, _designationsService_, _$uibModal_, _$rootScope_, _$q_ ) {
    productModalService = _productModalService_;
    designationsService = _designationsService_;
    $uibModal = _$uibModal_;
    $rootScope = _$rootScope_;
    // Spy On $uibModal.open and return mock object
    spyOn( $uibModal, 'open' ).and.returnValue( {result: {finally: angular.noop}} );
    spyOn( designationsService, 'productLookup' ).and.returnValue( {toPromise: () => _$q_.defer().promise} );
  } ) );

  it( 'should be defined', () => {
    expect( productModalService ).toBeDefined();
  } );

  describe( 'configureProduct', () => {
    it( 'should be defined', () => {
      expect( productModalService.configureProduct ).toBeDefined();
    } );

    it( 'should open productConfig modal', () => {
      productModalService.configureProduct( '0123456', {amount: 50}, false );
      expect( $uibModal.open ).toHaveBeenCalledTimes( 1 );
    } );

    it( 'should not open multiple modals at once', () => {
      productModalService.configureProduct( '0123456', {amount: 50}, false );
      productModalService.configureProduct( '0987654', {amount: 100}, true );
      expect( $uibModal.open ).toHaveBeenCalledTimes( 1 );
    } );

    it( 'should pass through itemConfig and isEditing', () => {
      productModalService.configureProduct( '0987654', {amount: 100}, true );
      $rootScope.$digest();
      expect( $uibModal.open ).toHaveBeenCalledTimes( 1 );
      expect( $uibModal.open.calls.argsFor( 0 )[0].resolve.itemConfig() ).toEqual( {amount: 100} );
      expect( $uibModal.open.calls.argsFor( 0 )[0].resolve.isEdit() ).toEqual( true );
      expect( $uibModal.open.calls.argsFor( 0 )[0].resolve.productData() ).toBePromise();
    } );

    describe( 'modal closes', () => {
      let deferred, $location;
      beforeEach( inject( function ( _$location_, _$q_ ) {
        $location = _$location_;
        deferred = _$q_.defer();
        spyOn( $location, 'hash' );
        spyOn( $location, 'search' );
        $uibModal.open.and.returnValue( {result: deferred.promise} );
      } ) );

      it( 'removes modal name and params', () => {
        productModalService.configureProduct();
        deferred.resolve();
        $rootScope.$digest();
        expect( $location.hash ).toHaveBeenCalled();
        expect( $location.search ).toHaveBeenCalled();
      } );
    } );
  } );
} );
