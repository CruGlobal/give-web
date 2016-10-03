import angular from 'angular';
import 'angular-mocks';
import module from './giftDetail.component';

describe( 'your giving', function () {
  describe( 'giving recipient view', () => {
    describe( 'donation recipient', () => {
      describe( 'gift detail', () => {
        beforeEach( angular.mock.module( module.name ) );
        let $compile, $rootScope;

        beforeEach( inject( ( _$compile_, _$rootScope_ ) => {
          $compile = _$compile_;
          $rootScope = _$rootScope_;
        } ) );

        it( 'inserts the giftDetail template', () => {
          let scope = $rootScope.$new();
          scope.gift = {a: 'a'};
          let element = $compile( '<tr gift-detail="gift"></tr>' )( scope );
          $rootScope.$digest();
          expect( element.children().length ).toEqual( 4 );
        } );
      } );
    } );
  } );
} );
