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
      {$window: {
        location: {href: 'cart.html'},
        innerWidth: 600
    }} );
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

  it('to show menu', () => {
    $ctrl.toggleMenu(true);
    expect( $ctrl.mobileNavOpen ).toEqual( true );
    expect( $ctrl.desktopSearch ).toEqual( true );
    expect( $document[0].body.className ).toContain('body-scroll-lock');
  });

  it('to hide menu', () => {
    $ctrl.toggleMenu(false);
    expect( $ctrl.mobileNavOpen ).toEqual( false );
    expect( $ctrl.desktopSearch ).toEqual( false );
    expect( $document[0].body.className ).not.toContain('body-scroll-lock');
  });

  it('to modify paths', () => {
    $httpBackend.expectGET('/assets/nav.json').respond(200, navStructure);
    $ctrl.getNav().subscribe((structure) => {
      structure = structure.main;
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

  it('to load mobile nav on small screens', () => {
    $ctrl.setMenuTemplate();
    expect( $ctrl.templateUrl ).toContain( 'mobile');
  });

  it('to build sub nav structure', () => {
    $httpBackend.expectGET('/assets/nav.json').respond(200, navStructure);
    $ctrl.getNav().subscribe((structure) => {
      let subMenuStructure = $ctrl.makeSubNav(structure.main, ['communities', 'campus']);

      expect( subMenuStructure.length ).toEqual( 2 );
      expect( subMenuStructure[0].path ).toContain( '/communities' );
    });
    $httpBackend.flush();
  });

  describe( '$onInit()', () => {
    beforeEach( () => {
      spyOn( $ctrl, 'getNav' ).and.returnValue(Observable.of([]));
      $ctrl.$onInit();
    } );

    it( 'getNav', () => {
      expect( $ctrl.getNav ).toHaveBeenCalled();
    } );
  } );
} );


describe( 'nav signInButton', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, $rootScope;

  beforeEach( inject( function ( _$componentController_, _$rootScope_ ) {
    $rootScope = _$rootScope_;
    $ctrl = _$componentController_( module.name,
      {$window: {location: jasmine.createSpyObj( 'location', ['reload'] )}}
    );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
  } );

  describe( 'isSignedIn', () => {
    describe( 'with \'REGISTERED\' cortex-session', () => {
      beforeEach( () => {
        spyOn( $ctrl.sessionService, 'getRole' ).and.returnValue( 'REGISTERED' );
        $ctrl.$onInit();
      } );

      afterEach( () => {
        $ctrl.$onDestroy();
      } );

      it( 'has true value', () => {
        expect( $ctrl.isSignedIn ).toEqual( true );
      } );
    } );

    describe( 'with \'GUEST\' cortex-session', () => {
      beforeEach( () => {
        spyOn( $ctrl.sessionService, 'getRole' ).and.returnValue( 'GUEST' );
        $ctrl.$onInit();
      } );

      afterEach( () => {
        $ctrl.$onDestroy();
      } );

      it( 'has false value', () => {
        expect( $ctrl.isSignedIn ).toEqual( false );
      } );
    } );
  } );

  describe( 'signIn', () => {
    let deferred;
    beforeEach( inject( function ( _$q_ ) {
      deferred = _$q_.defer();
      spyOn( $ctrl.sessionModalService, 'signIn' ).and.callFake( () => deferred.promise );
      $ctrl.signIn();
    } ) );

    it( 'opens signIn Modal', () => {
      expect( $ctrl.sessionModalService.signIn ).toHaveBeenCalled();
    } );

    it( 'reloads window on success', () => {
      deferred.resolve();
      $rootScope.$digest();
      expect( $ctrl.$window.location.reload ).toHaveBeenCalled();
    } );

    it( 'does nothing on failure', () => {
      deferred.reject();
      $rootScope.$digest();
      expect( $ctrl.$window.location.reload ).not.toHaveBeenCalled();
    } );
  } );

  describe( 'signOut', () => {
    let deferred;
    beforeEach( inject( function ( _$q_ ) {
      deferred = _$q_.defer();
      spyOn( $ctrl.sessionService, 'signOut' ).and.callFake( () => deferred.promise );
      $ctrl.signOut();
    } ) );

    it( 'calls sessionService.signOut', () => {
      expect( $ctrl.sessionService.signOut ).toHaveBeenCalled();
    } );

    it( 'reloads window on success', () => {
      deferred.resolve();
      $rootScope.$digest();
      expect( $ctrl.$window.location.reload ).toHaveBeenCalled();
    } );

    it( 'does nothing on failure', () => {
      deferred.reject();
      $rootScope.$digest();
      expect( $ctrl.$window.location.reload ).not.toHaveBeenCalled();
    } );
  } );
} );
