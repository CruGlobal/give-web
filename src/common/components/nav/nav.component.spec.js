import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import module from './nav.component';

import navStructure from 'common/components/nav/fixtures/nav.fixture';

describe( 'nav', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, $httpBackend, $document;

  beforeEach( inject( function ( _$componentController_, _$document_, _$httpBackend_ ) {
    $ctrl = _$componentController_( module.name,
      {$window: {location: {href: 'cart.html'}}} );
    $httpBackend = _$httpBackend_;
    $document = _$document_;
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
  } );

  it('to retrieve json nav feed', () => {
    $httpBackend.expectGET('/assets/nav.json').respond(200, navStructure);
    $ctrl.getNav().subscribe((structure) => {
      expect( structure ).toBeDefined();
    });
    $httpBackend.flush();
  });

  it('to toggle menu', () => {
    $ctrl.toggleMenu();
    expect( $ctrl.mobileNavOpen ).toEqual( true );
    expect( $document[0].body.className ).toContain('body-scroll-lock');
  });

  it('to modify paths', () => {
    $httpBackend.expectGET('/assets/nav.json').respond(200, navStructure);
    $ctrl.getNav().subscribe((structure) => {
      expect( structure[0].path ).toContain( 'https://www.cru.org/' );

      let giveMenu = structure[structure.length - 1];
      expect( giveMenu.title ).toEqual( 'Give' );
      expect( giveMenu.children[0].path ).toContain( 'https://give.cru.org/' );
    });
    $httpBackend.flush();
  });

  it('to load cart data', () => {
    spyOn( $ctrl.cartService, 'get' ).and.callFake( () => Observable.of( {} ) );

    $ctrl.loadCart();
    expect( $ctrl.cartData ).toEqual( {} );
  });

  it('to redirect on search', () => {
    $ctrl.cruSearch('hello');
    expect( $ctrl.$window.location.href ).toContain( 'search.hello.html');
  });
} );
