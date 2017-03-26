import angular from 'angular';
import 'angular-mocks';
import module from './subNav.directive';

describe( 'cruSubNav', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $window, scope, subNav;

  beforeEach( inject( function ( _$compile_, _$rootScope_, _$window_ ) {
    $window = _$window_;
    scope = _$rootScope_.$new();
    subNav = _$compile_('<cru-sub-nav></cru-sub-nav>')(scope);
    scope.$digest();
  } ) );

  it( 'is class set', () => {
    angular.element($window).triggerHandler('scroll');

    let subNavigation = subNav.children()[0];
    scope.$digest();
    expect( subNavigation.className ).toEqual( '' );
  } );
} );
