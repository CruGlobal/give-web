import angular from 'angular';
import 'angular-mocks';
import module from './configureGifts.component';

describe( 'your giving', () => {
  describe( 'stopStartRecurringGiftsModal', () => {
    describe( 'restartGift', () => {
      describe( 'step2', () => {
        describe( 'configureGifts', () => {
          beforeEach( angular.mock.module( module.name ) );
          let $ctrl;

          beforeEach( inject( ( $componentController ) => {
            $ctrl = $componentController( module.name, {}, jasmine.createSpyObj( 'bindings', ['next', 'previous'] ) );
          } ) );

          it( 'is defined', () => {
            expect( $ctrl ).toBeDefined();
          } );
        } );
      } );
    } );
  } );
} );
