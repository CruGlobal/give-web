import angular from 'angular';
import 'angular-mocks';
import module from './productModal.service';

import campaignResponse from './fixtures/campaign.infinity.fixture';

describe( 'productModalService', function () {
  beforeEach( angular.mock.module( module.name ) );
  let productModalService, designationsService, commonService, $uibModal, $rootScope;

  beforeEach( inject( function ( _productModalService_, _designationsService_, _commonService_, _$uibModal_, _$rootScope_, _$q_ ) {
    productModalService = _productModalService_;
    designationsService = _designationsService_;
    commonService = _commonService_;
    $uibModal = _$uibModal_;
    $rootScope = _$rootScope_;
    // Spy On $uibModal.open and return mock object
    spyOn( $uibModal, 'open' ).and.returnValue( {result: {finally: angular.noop}} );
    spyOn( designationsService, 'productLookup' ).and.returnValue( {toPromise: () => _$q_.defer().promise} );
    spyOn( commonService, 'getNextDrawDate' ).and.returnValue( {toPromise: () => _$q_.defer().promise} );
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
      productModalService.configureProduct( '0987654', {amount: 100}, true, 'uri' );
      $rootScope.$digest();
      expect( $uibModal.open ).toHaveBeenCalledTimes( 1 );
      expect( $uibModal.open.calls.argsFor( 0 )[0].resolve.itemConfig() ).toEqual( {amount: 100} );
      expect( $uibModal.open.calls.argsFor( 0 )[0].resolve.isEdit() ).toEqual( true );
      expect( $uibModal.open.calls.argsFor( 0 )[0].resolve.productData() ).toBePromise();
      expect( $uibModal.open.calls.argsFor( 0 )[0].resolve.nextDrawDate() ).toBePromise();
      expect( $uibModal.open.calls.argsFor( 0 )[0].resolve.uri() ).toBe( 'uri' );
    } );

    describe( 'modal closes', () => {
      let deferred, $location, modalStateService;
      beforeEach( inject( function ( _$location_, _$q_, _modalStateService_ ) {
        $location = _$location_;
        modalStateService = _modalStateService_;
        deferred = _$q_.defer();
        spyOn( modalStateService, 'name' );
        spyOn( $location, 'search' );
        $uibModal.open.and.returnValue( {result: deferred.promise} );
      } ) );

      it( 'removes modal name and params', () => {
        productModalService.configureProduct();
        deferred.resolve();
        $rootScope.$digest();
        expect( modalStateService.name ).toHaveBeenCalledWith( null );
        expect( $location.search ).toHaveBeenCalledTimes( 5 );
      } );
    } );
  } );

  describe( 'suggestedAmounts() resolve', () => {
    let suggestedAmountsFn, $injector, $httpBackend;
    beforeEach( inject( ( _$injector_, _$httpBackend_ ) => {
      $injector = _$injector_;
      $httpBackend = _$httpBackend_;
    } ) );

    describe( 'with campaign page', () => {
      beforeEach( () => {
        productModalService.configureProduct( '0123456', {amount: 50, 'campaign-page': 9876}, false );
        suggestedAmountsFn = $uibModal.open.calls.argsFor( 0 )[0].resolve.suggestedAmounts;
      } );

      afterEach( () => {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      } );

      it( 'has suggested amounts', () => {
        $httpBackend
          .expectGET( '/content/give/us/en/campaigns/0/1/2/3/4/0123456/9876.infinity.json' )
          .respond( 200, campaignResponse );
        $injector.invoke( suggestedAmountsFn )
          .then( ( suggestedAmounts ) => {
            expect( suggestedAmounts ).toEqual( [
              {amount: 25, label: "for 10 Bibles", order: "1"},
              {amount: 100, label: "for 40 Bibles", order: "2"}
            ] );
          } );
        $httpBackend.flush();
      } );

      it( 'invalid campaign page', () => {
        $httpBackend
          .expectGET( '/content/give/us/en/campaigns/0/1/2/3/4/0123456/9876.infinity.json' )
          .respond( 400, {} );
        $injector.invoke( suggestedAmountsFn )
          .then( ( suggestedAmounts ) => {
            expect( suggestedAmounts ).toEqual( [] );
          } );
        $httpBackend.flush();
      } );
    } );

    describe( 'no campaign page', () => {
      it( 'doesn\'t have suggested amounts', () => {
        productModalService.configureProduct( '0123456', {amount: 50}, false );
        suggestedAmountsFn = $uibModal.open.calls.argsFor( 0 )[0].resolve.suggestedAmounts;
        $injector.invoke( suggestedAmountsFn )
          .then( ( suggestedAmounts ) => {
            expect( suggestedAmounts ).toEqual( [] );
          } );
      } );
    } );
  } );
} );
