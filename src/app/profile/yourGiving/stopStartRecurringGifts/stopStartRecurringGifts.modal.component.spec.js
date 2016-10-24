import angular from 'angular';
import 'angular-mocks';

import module from './stopStartRecurringGifts.modal.component';

describe( 'stopStartRecurringGiftsModal', () => {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, bindings;

  beforeEach( inject( ( $componentController ) => {
    bindings = jasmine.createSpyObj( 'bindings', ['dismiss', 'close'] );
    $ctrl = $componentController( module.name, {}, bindings );
  } ) );

  it( 'is defined', () => {
    expect( $ctrl ).toBeDefined();
  } );

  describe( '$onInit()', () => {
    it( 'initializes the component', () => {
      spyOn( $ctrl, 'next' );
      $ctrl.$onInit();
      expect( $ctrl.next ).toHaveBeenCalled();
    } );
  } );

  describe( 'next()', () => {
    describe( 'undefined state', () => {
      it( 'transitions to \'step-0\'', () => {
        $ctrl.next();
        expect( $ctrl.state ).toEqual( 'step-0' );
      } );
    } );

    describe( '\'step-0\' state', () => {
      beforeEach( () => {
        $ctrl.state = 'step-0';
      } );

      it( 'transitions to \'stop-step-1\'', () => {
        $ctrl.next( 'stop' );
        expect( $ctrl.state ).toEqual( 'stop-step-1' );
        expect( $ctrl.giftAction ).toEqual( 'stop' );
      } );

      it( 'stay on \'step-0\'', () => {
        $ctrl.next();
        expect( $ctrl.state ).toEqual( 'step-0' );
        expect( $ctrl.giftAction ).not.toBeDefined();
      } );
    } );
  } );

  describe( 'previous()', () => {
    it( 'transitions to \'step-0\'', () => {
      angular.forEach( ['restart-step-1', 'change-step-1', 'redirect-step-1', 'stop-step-1'], ( state ) => {
        $ctrl.state = state;
        $ctrl.previous();
        expect( $ctrl.state ).toEqual( 'step-0' );
      } );
    } );
  } );
} );
