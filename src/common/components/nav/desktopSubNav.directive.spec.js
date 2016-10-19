import angular from 'angular';
import 'angular-mocks';
import module from './desktopSubNav.directive';

describe( 'desktopSubNav', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $window, scope, subNav;

  beforeEach( inject( function ( _$compile_, _$rootScope_, _$window_ ) {
    $window = _$window_;
    scope = _$rootScope_.$new();
    subNav = _$compile_('<desktop-sub-nav></desktop-sub-nav>')(scope);
    scope.$digest();
  } ) );

  it( 'is src set', (done) => {
    angular.element($window).triggerHandler('scroll');

    let subNavigation = subNav.children()[0];
    $window.setTimeout(() => {
      expect( subNavigation.className ).toEqual( '' );
      done();
    });
  } );
} );
