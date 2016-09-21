import angular from 'angular';
import 'angular-mocks';
import module from './sessionEnforcer.service';
import {Roles} from 'common/services/session/session.service';

describe( 'sessionEnforcerService', function () {
  beforeEach( angular.mock.module( module.name ) );
  let sessionEnforcerService, sessionModalService, sessionService, deferred;

  beforeEach( inject( function ( _sessionEnforcerService_, _sessionModalService_, _sessionService_, _$q_ ) {
    sessionEnforcerService = _sessionEnforcerService_;
    sessionModalService = _sessionModalService_;
    sessionService = _sessionService_;
    spyOn( sessionService, 'getRole' ).and.returnValue( Roles.public );
    deferred = _$q_.defer();
    spyOn( sessionModalService, 'open' ).and.callFake( () => {
      return {result: deferred.promise};
    } );
  } ) );

  it( 'should be defined', () => {
    expect( sessionEnforcerService ).toBeDefined();
  } );

  describe( 'sessionEnforcerService()', () => {
    it( 'requires roles', () => {
      expect( sessionEnforcerService() ).toEqual( false );
    } );

    it( 'returns id', () => {
      expect( sessionEnforcerService( [Roles.public, Roles.registered] ) ).toEqual( jasmine.any( String ) );
      expect( sessionModalService.open ).not.toHaveBeenCalled();
    } );

    it( 'accepts \'sign-in\', \'cancel\' and \'change\' callbacks', () => {
      expect( sessionEnforcerService(
        [Roles.public, Roles.registered], {
          'sign-in': () => {
          },
          cancel:    () => {
          },
          change:    () => {
          }
        }
      ) ).toEqual( jasmine.any( String ) );
      expect( sessionModalService.open ).not.toHaveBeenCalled();
    } );

    describe( 'does not include current role', () => {
      let signIn, cancel, change, $rootScope;
      beforeEach( inject( function ( _$rootScope_ ) {
        $rootScope = _$rootScope_;
        signIn = jasmine.createSpy( 'success' );
        cancel = jasmine.createSpy( 'failure' );
        change = jasmine.createSpy( 'change' );
        sessionEnforcerService( [Roles.registered], {'sign-in': signIn, cancel: cancel, change: change} );
      } ) );

      it( 'opens sign-in modal and calls \'change\' callback', () => {
        expect( change ).toHaveBeenCalledWith( Roles.public );
        expect( sessionModalService.open ).toHaveBeenCalledWith( 'sign-in', {backdrop: 'static', keyboard: false} );
      } );

      describe( 'sign-in success', () => {
        it( 'calls \'sign-in\' callback', () => {
          deferred.resolve();
          $rootScope.$digest();
          expect( signIn ).toHaveBeenCalled();
        } );
      } );

      describe( 'sign-in canceled', () => {
        it( 'calls \'cancel\' callback', () => {
          deferred.reject();
          $rootScope.$digest();
          expect( cancel ).toHaveBeenCalled();
        } );
      } );
    } );
  } );

  describe( 'sessionEnforcerService.cancel', () => {
    it( 'cancels known enforcer', () => {
      let id = sessionEnforcerService( [Roles.public, Roles.registered] ),
        result = sessionEnforcerService.cancel( id );
      expect( result ).toEqual( true );
    } );

    it( 'returns false on unknown id', () => {
      expect( sessionEnforcerService.cancel( 'abcdefg' ) ).toEqual( false );
    } );
  } );
} );
