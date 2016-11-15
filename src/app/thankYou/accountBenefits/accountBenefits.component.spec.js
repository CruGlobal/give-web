import angular from 'angular';
import 'angular-mocks';
import module from './accountBenefits.component';

import {Roles} from 'common/services/session/session.service';

describe( 'thank you', function () {
  describe( 'accountBenefits', function () {
    beforeEach( angular.mock.module( module.name ) );
    let $ctrl;

    beforeEach( inject( function ( $componentController ) {
      $ctrl = $componentController( module.name );
    } ) );

    it( 'should be defined', () => {
      expect( $ctrl ).toBeDefined();
      expect( $ctrl.sessionModalService ).toBeDefined();
      expect( $ctrl.sessionService ).toBeDefined();
      expect( $ctrl.isVisible ).toEqual( false );
    } );

    describe( '$onChanges', () => {
      it( 'is visible when registration-state is \'MATCHED\'', () => {
        $ctrl.$onChanges( {donorDetails: {currentValue: {'registration-state': 'MATCHED'}}} );
        expect( $ctrl.isVisible ).toEqual( true );
      } );
      it( 'is not visible when registration-state is \'COMPLETED\'', () => {
        $ctrl.$onChanges( {donorDetails: {currentValue: {'registration-state': 'COMPLETED'}}} );
        expect( $ctrl.isVisible ).toEqual( false );
      } );
    } );

    describe( 'doUserMatch()', () => {
      it( 'shows userMatch modal is role is \'REGISTERED\'', () => {
        spyOn( $ctrl.sessionService, 'getRole' ).and.returnValue( Roles.registered );
        spyOn( $ctrl.sessionModalService, 'userMatch' );

        $ctrl.doUserMatch();
        expect( $ctrl.sessionService.getRole ).toHaveBeenCalled();
        expect( $ctrl.sessionModalService.userMatch ).toHaveBeenCalled();
      } );

      describe( '\'PUBLIC\' role', () => {
        let deferred, $rootScope, userMatch;
        beforeEach( inject( ( _$q_, _$rootScope_ )=> {
          deferred = _$q_.defer();
          userMatch = _$q_.defer();
          $rootScope = _$rootScope_;
          spyOn( $ctrl.sessionModalService, 'signIn' ).and.returnValue( deferred.promise );
          spyOn( $ctrl.sessionModalService, 'userMatch' ).and.returnValue(userMatch.promise);
          $ctrl.isVisible = true;
        } ) );

        it( 'shows sign in modal, followed by userMatch', () => {
          $ctrl.doUserMatch();
          expect( $ctrl.sessionModalService.signIn ).toHaveBeenCalled();
          deferred.resolve();
          $rootScope.$digest();
          expect( $ctrl.isVisible ).toEqual( true );
          expect( $ctrl.sessionModalService.userMatch ).toHaveBeenCalled();
          userMatch.resolve();
          $rootScope.$digest();
          expect( $ctrl.isVisible ).toEqual( false );
        } );
      } );
    } );
  } );
} );
