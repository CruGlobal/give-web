import angular from 'angular';
import 'angular-mocks';
import module, {EnforcerCallbacks, EnforcerModes} from './sessionEnforcer.service';
import {Roles} from 'common/services/session/session.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

describe( 'sessionEnforcerService', function () {
  beforeEach( angular.mock.module( module.name ) );
  let sessionEnforcerService,
    sessionModalService,
    sessionService,
    deferred;

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
          [EnforcerCallbacks.signIn]: () => {
          },
          [EnforcerCallbacks.cancel]: () => {
          },
          [EnforcerCallbacks.change]: () => {
          }
        }
      ) ).toEqual( jasmine.any( String ) );
      expect( sessionModalService.open ).not.toHaveBeenCalled();
    } );

    describe( '\'session\' mode', () => {
      describe( 'does not include current role', () => {
        let signIn, cancel, change, $rootScope;
        beforeEach( inject( function ( _$rootScope_ ) {
          $rootScope = _$rootScope_;
          signIn = jasmine.createSpy( 'success' );
          cancel = jasmine.createSpy( 'failure' );
          change = jasmine.createSpy( 'change' );
          sessionEnforcerService( [Roles.registered], {
            [EnforcerCallbacks.signIn]: signIn,
            [EnforcerCallbacks.cancel]: cancel,
            [EnforcerCallbacks.change]: change
          }, EnforcerModes.session );
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

      describe( 'does not include current role, has no callbacks', () => {
        let signIn, cancel, change, $rootScope;
        beforeEach( inject( function ( _$rootScope_ ) {
          $rootScope = _$rootScope_;
          signIn = jasmine.createSpy( 'success' );
          cancel = jasmine.createSpy( 'failure' );
          change = jasmine.createSpy( 'change' );
          sessionEnforcerService( [Roles.registered], {}, EnforcerModes.session );
        } ) );

        it( 'opens sign-in modal and does not call \'change\' callback', () => {
          expect( change ).not.toHaveBeenCalled();
          expect( sessionModalService.open ).toHaveBeenCalledWith( 'sign-in', {backdrop: 'static', keyboard: false} );
        } );

        describe( 'sign-in success', () => {
          it( 'does not call \'sign-in\' callback', () => {
            deferred.resolve();
            $rootScope.$digest();
            expect( signIn ).not.toHaveBeenCalled();
          } );
        } );

        describe( 'sign-in canceled', () => {
          it( 'does not call \'cancel\' callback', () => {
            deferred.reject();
            $rootScope.$digest();
            expect( cancel ).not.toHaveBeenCalled();
          } );
        } );
      } );

      describe( 'includes current role', () => {
        let signIn, cancel, change, $rootScope;
        beforeEach( inject( function ( _$rootScope_ ) {
          $rootScope = _$rootScope_;
          signIn = jasmine.createSpy( 'success' );
          cancel = jasmine.createSpy( 'failure' );
          change = jasmine.createSpy( 'change' );
          sessionService.getRole.and.returnValue( Roles.registered );
        } ) );

        describe( 'callbackOnInit = true', () => {
          it( 'does not open sign-in modal and calls \'sign-in\' callback', () => {
            sessionEnforcerService( [Roles.registered], {
              [EnforcerCallbacks.signIn]: signIn,
              [EnforcerCallbacks.cancel]: cancel,
              [EnforcerCallbacks.change]: change
            }, 'blah', true );
            $rootScope.$digest();
            expect( signIn ).toHaveBeenCalled();
            expect( sessionModalService.open ).not.toHaveBeenCalled();
          } );
        } );

        describe( 'callbackOnInit = false', () => {
          it( 'does not open sign-in modal and does not call \'sign-in\' callback', () => {
            sessionEnforcerService( [Roles.registered], {
              [EnforcerCallbacks.signIn]: signIn,
              [EnforcerCallbacks.cancel]: cancel,
              [EnforcerCallbacks.change]: change
            }, 'blah', false );
            $rootScope.$digest();
            expect( signIn ).not.toHaveBeenCalled();
            expect( sessionModalService.open ).not.toHaveBeenCalled();
          } );
        } );
      } );
    } );

    describe( '\'donor\' mode', () => {
      let signIn, cancel, change, $rootScope, orderService;
      beforeEach( inject( function ( _$rootScope_, _orderService_, _$q_ ) {
        $rootScope = _$rootScope_;
        orderService = _orderService_;
        signIn = jasmine.createSpy( 'success' );
        cancel = jasmine.createSpy( 'failure' );
        change = jasmine.createSpy( 'change' );
        spyOn( orderService, 'getDonorDetails' ).and.callFake( () => Observable.of( {'registration-state': 'NEW'} ) );
      } ) );

      describe( 'does not include current role', () => {
        it( 'opens registerAccount modal and calls \'change\' callback', () => {
          sessionEnforcerService( [Roles.registered], {
            [EnforcerCallbacks.signIn]: signIn,
            [EnforcerCallbacks.cancel]: cancel,
            [EnforcerCallbacks.change]: change
          }, EnforcerModes.donor );

          expect( change ).toHaveBeenCalledWith( Roles.public );
          expect( sessionModalService.open ).toHaveBeenCalledWith( 'register-account', {
            backdrop: 'static',
            keyboard: false
          } );
        } );
      } );

      describe( '\'REGISTERED\' role with \'NEW\' registration-state', () => {
        beforeEach( () => {
          sessionService.getRole.and.returnValue( Roles.registered );
        } );

        describe( 'registerAccount', () => {
          beforeEach( () => {
            sessionEnforcerService( [Roles.registered], {
              [EnforcerCallbacks.signIn]: signIn,
              [EnforcerCallbacks.cancel]: cancel,
              [EnforcerCallbacks.change]: change
            }, EnforcerModes.donor );
          } );

          it( 'opens registerAccount modal and calls \'change\' callback', () => {
            $rootScope.$digest();
            expect( orderService.getDonorDetails ).toHaveBeenCalled();
            expect( change ).toHaveBeenCalledWith( Roles.registered );
            expect( sessionModalService.open ).toHaveBeenCalledWith( 'register-account', {
              backdrop: 'static',
              keyboard: false
            } );
          } );

          describe( 'register account success', () => {
            it( 'calls \'sign-in\' callback', () => {
              deferred.resolve();
              $rootScope.$digest();
              expect( signIn ).toHaveBeenCalled();
            } );
          } );

          describe( 'register account canceled', () => {
            it( 'calls \'cancel\' callback', () => {
              deferred.reject();
              $rootScope.$digest();
              expect( cancel ).toHaveBeenCalled();
            } );
          } );
        } );

        describe( 'orderService.getDonorDetails() fails', () => {
          beforeEach( () => {
            orderService.getDonorDetails.and.callFake( () => Observable.throw( {} ) );
          } );

          it( 'opens registerAccount modal and calls \'change\' callback', () => {
            sessionEnforcerService( [Roles.registered], {
              [EnforcerCallbacks.signIn]: signIn,
              [EnforcerCallbacks.cancel]: cancel,
              [EnforcerCallbacks.change]: change
            }, EnforcerModes.donor );
            $rootScope.$digest();

            expect( orderService.getDonorDetails ).toHaveBeenCalled();
            expect( change ).toHaveBeenCalledWith( Roles.registered );
            expect( sessionModalService.open ).toHaveBeenCalledWith( 'register-account', {
              backdrop: 'static',
              keyboard: false
            } );
          } );

          it( 'opens registerAccount modal', () => {
            sessionEnforcerService( [Roles.registered], {
              [EnforcerCallbacks.signIn]: signIn,
              [EnforcerCallbacks.cancel]: cancel
            }, EnforcerModes.donor );
            $rootScope.$digest();

            expect( orderService.getDonorDetails ).toHaveBeenCalled();
            expect( signIn ).not.toHaveBeenCalled();
            expect( change ).not.toHaveBeenCalled();
            expect( cancel ).not.toHaveBeenCalled();
            expect( sessionModalService.open ).toHaveBeenCalledWith( 'register-account', {
              backdrop: 'static',
              keyboard: false
            } );
          } );
        } );
      } );

      describe( '\'REGISTERED\' role with \'COMPLETED\' registration-state', () => {
        beforeEach( () => {
          sessionService.getRole.and.returnValue( Roles.registered );
          orderService.getDonorDetails.and.callFake( () => Observable.of( {'registration-state': 'COMPLETED'} ) );
        } );

        it( 'does not open registerAccount modal and calls \'sign-in\' callback', () => {
          sessionEnforcerService( [Roles.registered], {
            [EnforcerCallbacks.signIn]: signIn,
            [EnforcerCallbacks.cancel]: cancel,
            [EnforcerCallbacks.change]: change
          }, EnforcerModes.donor );
          $rootScope.$digest();

          expect( orderService.getDonorDetails ).toHaveBeenCalled();
          expect( signIn ).toHaveBeenCalled();
          expect( change ).not.toHaveBeenCalled();
          expect( sessionModalService.open ).not.toHaveBeenCalled();
        } );

        it( 'does not open registerAccount modal', () => {
          sessionEnforcerService( [Roles.registered], {}, EnforcerModes.donor );
          $rootScope.$digest();

          expect( orderService.getDonorDetails ).toHaveBeenCalled();
          expect( signIn ).not.toHaveBeenCalled();
          expect( change ).not.toHaveBeenCalled();
          expect( sessionModalService.open ).not.toHaveBeenCalled();
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
