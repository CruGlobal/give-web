import angular from 'angular';
import 'angular-mocks';
import module from './yourGiving.component';

describe( 'manage giving', function () {
  beforeEach( angular.mock.module( module.name ) );
  var self = {};

  beforeEach( inject( function ( $rootScope, $componentController ) {
    var $scope = $rootScope.$new();

    self.controller = $componentController( module.name, {
      $scope: $scope
    } );
  } ) );

  it( 'to be defined', function () {
    expect( self.controller ).toBeDefined();
  } );
} );
