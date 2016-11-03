import angular from 'angular';
import 'angular-mocks';
import module from './suspendedGifts.component';

describe( 'your giving', () => {
  describe( 'stopStartRecurringGiftsModal', () => {
    describe( 'restartGift', () => {
      describe( 'step1', () => {
        describe( 'suspendedGifts', () => {
          beforeEach( angular.mock.module( module.name ) );
          let $ctrl;

          beforeEach( inject( ( $componentController ) => {
            $ctrl = $componentController( module.name, {}, jasmine.createSpyObj( 'bindings', ['next', 'previous'] ) );
          } ) );

          it( 'is defined', () => {
            expect( $ctrl ).toBeDefined();
          } );

          describe( 'selectGifts()', () => {
            beforeEach( () => {
              $ctrl.gifts = [{gift: 1}, {gift: 2}, {gift: 3}, {gift: 4}, {gift: 5}];
            } );

            it( 'filters only selected gifts', () => {
              $ctrl.gifts[0]._selectedGift = true;
              $ctrl.gifts[2]._selectedGift = false;
              $ctrl.selectGifts();
              expect( $ctrl.next ).toHaveBeenCalledWith( {
                selected: [{gift: 1, _selectedGift: true}]
              } );
            } );
          } );
        } );
      } );
    } );
  } );
} );
