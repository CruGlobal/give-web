import angular from 'angular';
import 'angular-mocks';
import {subNavLockEvent, subNavUnlockEvent} from 'common/components/nav/nav.component';
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
    scope.$digest();

    let subNavigation = subNav.children()[0];
    expect( subNavigation.className ).toEqual( '' );
  } );

  it( 'should emit event when sub navigation is locked', () => {
    spyOn( scope, '$emit' );

    $window.scrollTo(0, 1);
    expect(scope.$emit).toHaveBeenCalledWith(subNavUnlockEvent);

    $window.scrollTo(0, 1400);
    expect(scope.$emit).toHaveBeenCalledWith(subNavLockEvent);
  } );
} );
