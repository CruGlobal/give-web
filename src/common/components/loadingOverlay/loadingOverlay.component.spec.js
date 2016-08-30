import angular from 'angular';
import 'angular-mocks';
import module from './loadingOverlay.component';

describe( 'loadingOverlay', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( function ( _$componentController_ ) {
    $ctrl = _$componentController_( module.name );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
  } );
} );
