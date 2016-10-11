import angular from 'angular';
import 'angular-mocks';
import module from './registerAccount.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import {Roles} from 'common/services/session/session.service';

describe( 'registerAccountService', function () {
  beforeEach( angular.mock.module( module.name ) );
  let registerAccountService,
    sessionModalService,
    sessionService,
    orderService,
    $rootScope,
    signInPromise,
    userMatchPromise,
    donorDetailsPromise,
    registerAccountPromise,
    result;

  beforeEach( inject( function ( _registerAccountService_, _sessionModalService_, _sessionService_, _orderService_, _$q_, _$rootScope_ ) {
    registerAccountService = jasmine.createSpy( 'registerAccountService', _registerAccountService_ ).and.callThrough();
    sessionModalService = _sessionModalService_;
    sessionService = _sessionService_;
    orderService = _orderService_;
    $rootScope = _$rootScope_;
    signInPromise = _$q_.defer();
    userMatchPromise = _$q_.defer();
    donorDetailsPromise = _$q_.defer();
    registerAccountPromise = _$q_.defer();
    spyOn( sessionModalService, 'open' ).and.callFake( ( type ) => {
      switch ( type ) {
        case 'sign-in':
          return {result: signInPromise.promise};
        case 'register-account':
          return {result: registerAccountPromise.promise};
        case 'user-match':
          return {result: userMatchPromise.promise};
      }
    } );
    spyOn( orderService, 'getDonorDetails' ).and.callFake( () => Observable.from( donorDetailsPromise.promise ) );
  } ) );

  it( 'should be defined', () => {
    expect( registerAccountService ).toBeDefined();
  } );

  describe( 'registerAccount', () => {
    describe( '\'REGISTERED\' role', () => {
      beforeEach( () => {
        spyOn( sessionService, 'getRole' ).and.returnValue( Roles.registered );
      } );

      it( 'should skip sign-in modal', () => {
        registerAccountService();
        $rootScope.$digest();
        expect( sessionModalService.open ).not.toHaveBeenCalledWith( 'sign-in', jasmine.any( Object ) );
        expect( sessionModalService.open ).toHaveBeenCalledWith( 'register-account', jasmine.any( Object ) );
      } );
    } );

    describe( '\'PUBLIC\' role', () => {
      beforeEach( () => {
        spyOn( sessionService, 'getRole' ).and.returnValue( Roles.public );
        result = registerAccountService();
        $rootScope.$digest();
      } );

      it( 'should show sign-in modal', () => {
        expect( sessionModalService.open ).toHaveBeenCalledWith( 'sign-in', jasmine.any( Object ) );
      } );

      describe( 'sign-in/up failure/cancel', () => {
        beforeEach( () => {
          signInPromise.reject();
        } );

        it( 'registerAccount should fail', ( done ) => {
          result.then( () => {
            done( new Error( 'registerAccount should not succeed.' ) );
          }, () => {
            done();
          } );
          $rootScope.$digest();
        } );
      } );

      describe( 'sign-in/up success', () => {
        beforeEach( () => {
          signInPromise.resolve();
        } );

        it( 'get donorDetails', () => {
          $rootScope.$digest();
          expect( orderService.getDonorDetails ).toHaveBeenCalled();
        } );

        describe( '\'COMPLETED\' registration-state', () => {
          beforeEach( () => {
            donorDetailsPromise.resolve( {'registration-state': 'COMPLETED'} );
          } );
          it( 'registerAccount to complete successfully', ( done ) => {
            result.then( () => {
              done();
            }, () => {
              done( new Error( 'registerAccount should succeed.' ) );
            } );
            $rootScope.$digest();
          } );
        } );

        describe( 'getDonorDetails failed', () => {
          it( 'rejects the promise', () => {
            donorDetailsPromise.reject();
            $rootScope.$digest();
            expect( sessionModalService.open ).toHaveBeenCalledWith( 'register-account', jasmine.any( Object ) );
          } );
        } );

        describe( '\'NEW\' registration-state', () => {
          beforeEach( () => {
            donorDetailsPromise.resolve( {'registration-state': 'NEW'} );
          } );

          it( 'should show register-account modal', () => {
            $rootScope.$digest();
            expect( sessionModalService.open ).toHaveBeenCalledWith( 'register-account', jasmine.any( Object ) );
          } );

          describe( '\'register-account\' modal success', () => {
            beforeEach( () => {
              registerAccountPromise.resolve();
            } );

            it( 'should show \'user-match\' modal', () => {
              $rootScope.$digest();
              expect( sessionModalService.open ).toHaveBeenCalledWith( 'user-match', jasmine.any( Object ) );
            } );

            describe( '\'user-match\' success', () => {
              it( 'registerAccount to complete successfully', ( done ) => {
                userMatchPromise.resolve();
                result.then( () => {
                  done();
                }, () => {
                  done( new Error( 'registerAccount should succeed.' ) );
                } );
                $rootScope.$digest();
              } );
            } );

            describe( '\'user-match\' failure/cancel', () => {
              it( 'registerAccount should fail', ( done ) => {
                userMatchPromise.reject();
                result.then( () => {
                  done( new Error( 'registerAccount should not succeed.' ) );
                }, () => {
                  done();
                } );
                $rootScope.$digest();
              } );
            } );
          } );

          describe( '\'register-account\' modal failure/cancel', () => {
            beforeEach( () => {
              registerAccountPromise.reject();
            } );

            it( 'registerAccount should fail', ( done ) => {
              result.then( () => {
                done( new Error( 'registerAccount should not succeed.' ) );
              }, () => {
                done();
              } );
              $rootScope.$digest();
            } );
          } );
        } );
      } );
    } );
  } );
} );
