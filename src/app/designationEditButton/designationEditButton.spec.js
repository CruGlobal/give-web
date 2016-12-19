import angular from 'angular';
import 'angular-mocks';
import module from './designationEditButton.component';

describe( 'Designation Editor Button', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, $rootScope;

  beforeEach( inject( function ( _$rootScope_, _$componentController_ ) {
    $rootScope = _$rootScope_;
    $ctrl = _$componentController_( module.name, {}, {designationNumber: '0123456'} );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
  } );

  it( 'Designation number is set', () => {
    expect( $ctrl.designationNumber ).toEqual( '0123456' );
  } );

  describe( '$onInit()', () => {
    let designationContentPromise;
    beforeEach(inject((_$q_) => {
      designationContentPromise = _$q_.defer();

      spyOn( $ctrl.sessionService, 'getRole' ).and.returnValue( 'REGISTERED' );
      spyOn( $ctrl.designationEditorService, 'checkPermission' ).and.returnValue( designationContentPromise.promise );
    }));

    it( 'initializes the component', () => {
      $ctrl.$onInit();
      expect( $ctrl.showEditButton ).toEqual( undefined );
    } );

    it( 'has permission to edit', () => {
      $ctrl.$onInit();
      designationContentPromise.resolve( );
      $rootScope.$digest();

      expect( $ctrl.showEditButton ).toEqual( true );
    } );

    it( 'does not have permission to edit', () => {
      $ctrl.$onInit();
      designationContentPromise.reject( );
      $rootScope.$digest();

      expect( $ctrl.showEditButton ).toEqual( false );
    } );
  } );
} );
