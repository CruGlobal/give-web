import angular from 'angular';
import 'angular-mocks';
import module from './nav.component';

import navStructure from 'common/components/nav/fixtures/nav.fixture';

describe( 'nav', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, $httpBackend, $document;

  beforeEach( inject( function ( _$componentController_, _$document_, _$httpBackend_ ) {
    $ctrl = _$componentController_( module.name );
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

} );
