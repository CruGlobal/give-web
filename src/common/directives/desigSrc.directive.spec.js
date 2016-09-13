import angular from 'angular';
import 'angular-mocks';
import module from './desigSrc.directive';

describe( 'desigSrc', function () {
  beforeEach( angular.mock.module( module.name ) );
  let img, scope, desigNum = '0561484';

  beforeEach( inject( function ( _$compile_, _$rootScope_ ) {
    let tpl = '<img desig-src="' + desigNum + '" class="giftsum-profile pull-left">';
    scope = _$rootScope_.$new();
    img = _$compile_( tpl )( scope );
    scope.$digest();
  } ) );

  it( 'is src set', () => {
    expect( img.attr('src').includes('thumbnailDesigNumber=' + desigNum) ).toEqual( true );
  } );
} );
