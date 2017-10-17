import angular from 'angular';
import 'angular-mocks';
import {subNavLockEvent, subNavUnlockEvent} from 'common/components/nav/nav.component';
import module from './subNav.directive';

describe( 'cruSubNav', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $window, $rootScope, subNav;

  beforeEach( inject( function ( _$compile_, _$rootScope_, _$window_ ) {
    $window = _$window_;
    $rootScope = _$rootScope_;
    subNav = _$compile_('<cru-sub-nav></cru-sub-nav>')($rootScope.$new());
    spyOn( $window, 'addEventListener' );
    spyOn( $rootScope, '$emit' );
    $rootScope.$digest();
  } ) );

  it( 'is class set', () => {
    angular.element($window).triggerHandler('scroll');
    $rootScope.$digest();

    let subNavigation = subNav.children()[0];
    expect( subNavigation.className ).toEqual( '' );
  } );

  it( 'should emit event when sub navigation is locked', () => {
    expect($window.addEventListener).toHaveBeenCalledWith('scroll', jasmine.any(Function));

    $window.scrollY = 0;
    $window.addEventListener.calls.argsFor(0)[1]();
    expect($rootScope.$emit).toHaveBeenCalledWith(subNavUnlockEvent);

    $window.scrollY = 1400;
    $window.addEventListener.calls.argsFor(0)[1]();
    expect($rootScope.$emit).toHaveBeenCalledWith(subNavLockEvent);
  } );
} );
