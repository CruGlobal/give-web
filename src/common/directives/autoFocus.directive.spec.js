import angular from 'angular';
import 'angular-mocks';
import module from './autoFocus.directive';

describe( 'autoFocus', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $compile, $rootScope;

  beforeEach( inject( function ( _$compile_, _$rootScope_ ) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  } ) );

  it( 'element has focus', () => {
    let $scope = $rootScope.$new(),
      rawEl = angular.element('<input auto-focus>');

    spyOn(rawEl[0], 'focus');
    $compile(rawEl)($scope);

    expect(rawEl[0].focus).toHaveBeenCalled();
  } );
} );
