import angular from 'angular';
import 'angular-mocks';
import module from './autoFocus.directive';

describe( 'autoFocus', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $compile, $rootScope, $timeout;

  beforeEach( inject( function ( _$compile_, _$rootScope_, _$timeout_ ) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
  } ) );

  it( 'element has focus', () => {
    let $scope = $rootScope.$new(),
      rawEl = angular.element('<input auto-focus>');

    spyOn(rawEl[0], 'focus');
    $compile(rawEl)($scope);

    $timeout.flush();
    expect(rawEl[0].focus).toHaveBeenCalled();
  } );
} );
