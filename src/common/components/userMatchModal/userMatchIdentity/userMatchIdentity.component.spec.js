import angular from 'angular';
import 'angular-mocks';
import module from './userMatchIdentity.component';

describe( 'userMatchIdentity', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, bindings;

  beforeEach( inject( function ( _$componentController_ ) {
    bindings = {
      contacts:        ['a', 'b'],
      onSelectContact: jasmine.createSpy( 'onSelectContact' ),
      identityForm:    {$valid: false},
      contact:         {}
    };
    $ctrl = _$componentController_( module.name, {}, bindings );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
    expect( $ctrl.hasError ).toEqual( false );
  } );

  describe( '$onInit', () => {
    it('track open analytics event', () => {
      spyOn( $ctrl.analyticsFactory, 'track' ).and.returnValue( null );
      $ctrl.$onInit();
      expect( $ctrl.analyticsFactory.track ).toHaveBeenCalledWith( 'aa-registration-match-is-this-you' );
    });
  });

  describe( 'selectContact()', () => {
    describe( 'invalid form', () => {
      it( 'set hasError', () => {
        $ctrl.selectContact();
        expect( $ctrl.hasError ).toEqual( true );
      } );
    } );

    describe( 'valid form', () => {
      beforeEach( () => {
        $ctrl.identityForm.$valid = true;
      } );

      describe( 'empty contact', () => {
        it( 'sends selects \'that-is-not-me\' contact', () => {
          $ctrl.selectContact();
          expect( $ctrl.onSelectContact ).toHaveBeenCalledWith( {contact: undefined} );
        } );
      } );

      describe( 'defined contact', () => {
        it( 'selects contact', () => {
          $ctrl.contact = 'a';
          $ctrl.selectContact();
          expect( $ctrl.onSelectContact ).toHaveBeenCalledWith( {contact: 'a'} );
        } );
      } );
    } );
  } );
} );
