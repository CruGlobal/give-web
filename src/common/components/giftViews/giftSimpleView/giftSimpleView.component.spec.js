import angular from 'angular';
import 'angular-mocks';

import module from './giftSimpleView.component';

describe( 'giftViews', () => {
  describe( 'giftSimpleView', () => {
    beforeEach( angular.mock.module( module.name ) );
    let $ctrl;

    beforeEach( inject( ( $componentController ) => {
      $ctrl = $componentController( module.name );
    } ) );

    it( 'is defined', () => {
      expect( $ctrl ).toBeDefined();
    } );
  } );
} );
