import angular from 'angular';
import 'angular-mocks';

import module from './stopGiftStep2.component';

describe( 'your giving', () => {
  describe( 'stopStartRecurringGiftsModal', () => {
    describe( 'stopGift', () => {
      describe( 'step2', () => {
        describe( 'stopGiftStep2', () => {
          beforeEach( angular.mock.module( module.name ) );
          let $ctrl;

          beforeEach( inject( ( $componentController ) => {
            $ctrl = $componentController( module.name, {}, {
              onSelectGifts: jasmine.createSpy( 'onSelectGifts' )
            } );
          } ) );

          it( 'is defined', () => {
            expect( $ctrl ).toBeDefined();
          } );
        } );
      } );
    } );
  } );
} );
