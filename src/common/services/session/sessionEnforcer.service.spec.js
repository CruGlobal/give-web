import angular from 'angular';
import 'angular-mocks';
import module, {
  EnforcerCallbacks,
  EnforcerModes,
} from './sessionEnforcer.service';
import { Roles } from 'common/services/session/session.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

describe('sessionEnforcerService Tests', () => {
  describe('sessionEnforcerService', function () {
    beforeEach(angular.mock.module(module.name));
    let sessionEnforcerService, sessionModalService, sessionService, deferred;

    beforeEach(inject(function (
      _sessionEnforcerService_,
      _sessionModalService_,
      _sessionService_,
      _$q_,
    ) {
      sessionEnforcerService = _sessionEnforcerService_;
      sessionModalService = _sessionModalService_;
      sessionService = _sessionService_;
      jest.spyOn(sessionService, 'getRole').mockReturnValue(Roles.public);
      deferred = _$q_.defer();
      jest.spyOn(sessionModalService, 'open').mockImplementation(() => {
        return { result: deferred.promise };
      });
    }));

    it('should be defined', () => {
      expect(sessionEnforcerService).toBeDefined();
    });

    describe('sessionEnforcerService()', () => {
      it('requires roles', () => {
        expect(sessionEnforcerService()).toEqual(false);
      });

      it('returns id', () => {
        expect(
          sessionEnforcerService([Roles.public, Roles.registered]),
        ).toEqual(expect.any(String));
        expect(sessionModalService.open).not.toHaveBeenCalled();
      });

      it("accepts 'sign-in', 'cancel' and 'change' callbacks", () => {
        expect(
          sessionEnforcerService([Roles.public, Roles.registered], {
            [EnforcerCallbacks.signIn]: () => {},
            [EnforcerCallbacks.cancel]: () => {},
            [EnforcerCallbacks.change]: () => {},
          }),
        ).toEqual(expect.any(String));

        expect(sessionModalService.open).not.toHaveBeenCalled();
      });

      describe("'session' mode", () => {
        describe('does not include current role', () => {
          let signIn, cancel, change, $rootScope;
          beforeEach(inject(function (_$rootScope_) {
            $rootScope = _$rootScope_;
            signIn = jest.fn();
            cancel = jest.fn();
            change = jest.fn();
            sessionEnforcerService(
              [Roles.registered],
              {
                [EnforcerCallbacks.signIn]: signIn,
                [EnforcerCallbacks.cancel]: cancel,
                [EnforcerCallbacks.change]: change,
              },
              EnforcerModes.session,
            );
          }));

          it("opens register-account modal and calls 'change' callback", () => {
            expect(change).toHaveBeenCalledWith(Roles.public, 'NEW');
            expect(sessionModalService.open).toHaveBeenCalledWith(
              'register-account',
              { backdrop: 'static', keyboard: false },
            );
          });

          describe('sign-in success', () => {
            it("calls 'sign-in' callback", () => {
              deferred.resolve();
              $rootScope.$digest();

              expect(signIn).toHaveBeenCalled();
            });
          });

          describe('sign-in canceled', () => {
            it("calls 'cancel' callback", () => {
              deferred.reject();
              $rootScope.$digest();

              expect(cancel).toHaveBeenCalled();
            });
          });

          describe('sign-in and sessionModalService.currentModal()', () => {
            beforeEach(() => {
              sessionService.getRole.mockReturnValue(Roles.registered);
              jest.spyOn(sessionModalService, 'currentModal');
            });

            it("should call 'signIn' and sessionModalService.currentModal callback", () => {
              $rootScope.$digest();
              expect(signIn).toHaveBeenCalled();
              expect(sessionModalService.currentModal).toHaveBeenCalled();
            });

            it('should close sessionModalService.currentModal', () => {
              let currentModalCloseMock = jest.fn();
              jest
                .spyOn(sessionModalService, 'currentModal')
                .mockImplementation(() => {
                  return {
                    close: currentModalCloseMock,
                  };
                });
              $rootScope.$digest();
              expect(currentModalCloseMock).toHaveBeenCalled();
            });
          });
        });

        describe('does not include current role, has no callbacks', () => {
          let signIn, cancel, change, $rootScope;
          beforeEach(inject(function (_$rootScope_) {
            $rootScope = _$rootScope_;
            signIn = jest.fn();
            cancel = jest.fn();
            change = jest.fn();
            sessionEnforcerService(
              [Roles.registered],
              {},
              EnforcerModes.session,
            );
          }));

          it("opens register-account modal and does not call 'change' callback", () => {
            expect(change).not.toHaveBeenCalled();
            expect(sessionModalService.open).toHaveBeenCalledWith(
              'register-account',
              { backdrop: 'static', keyboard: false },
            );
          });

          describe('register-account success', () => {
            it("does not call 'signIn' callback", () => {
              deferred.resolve();
              $rootScope.$digest();

              expect(signIn).not.toHaveBeenCalled();
            });
          });

          describe('register-account canceled', () => {
            it("does not call 'cancel' callback", () => {
              deferred.reject();
              $rootScope.$digest();

              expect(cancel).not.toHaveBeenCalled();
            });
          });
        });

        describe('includes current role', () => {
          let signIn, cancel, change, $rootScope;
          beforeEach(inject(function (_$rootScope_) {
            $rootScope = _$rootScope_;
            signIn = jest.fn();
            cancel = jest.fn();
            change = jest.fn();
            sessionService.getRole.mockReturnValue(Roles.registered);
          }));

          describe('callbackOnInit = true', () => {
            it("does not open sign-in modal and calls 'sign-in' callback", () => {
              sessionEnforcerService(
                [Roles.registered],
                {
                  [EnforcerCallbacks.signIn]: signIn,
                  [EnforcerCallbacks.cancel]: cancel,
                  [EnforcerCallbacks.change]: change,
                },
                'blah',
                true,
              );
              $rootScope.$digest();

              expect(signIn).toHaveBeenCalled();
              expect(sessionModalService.open).not.toHaveBeenCalled();
            });
          });

          describe('callbackOnInit = false', () => {
            it("does not open sign-in modal and does not call 'sign-in' callback", () => {
              sessionEnforcerService(
                [Roles.registered],
                {
                  [EnforcerCallbacks.signIn]: signIn,
                  [EnforcerCallbacks.cancel]: cancel,
                  [EnforcerCallbacks.change]: change,
                },
                'blah',
                false,
              );
              $rootScope.$digest();

              expect(signIn).not.toHaveBeenCalled();
              expect(sessionModalService.open).not.toHaveBeenCalled();
            });
          });
        });
      });

      describe("'donor' mode", () => {
        let signIn, cancel, change, $rootScope, orderService;
        beforeEach(inject(function (_$rootScope_, _orderService_) {
          $rootScope = _$rootScope_;
          orderService = _orderService_;
          signIn = jest.fn();
          cancel = jest.fn();
          change = jest.fn();
          jest
            .spyOn(orderService, 'getDonorDetails')
            .mockImplementation(() =>
              Observable.of({ 'registration-state': 'NEW' }),
            );
        }));

        describe('does not include current role', () => {
          it("opens registerAccount modal and calls 'change' callback", () => {
            sessionEnforcerService(
              [Roles.registered],
              {
                [EnforcerCallbacks.signIn]: signIn,
                [EnforcerCallbacks.cancel]: cancel,
                [EnforcerCallbacks.change]: change,
              },
              EnforcerModes.donor,
            );

            expect(change).toHaveBeenCalledWith(Roles.public, 'NEW');
            expect(sessionModalService.open).toHaveBeenCalledWith(
              'register-account',
              {
                backdrop: 'static',
                keyboard: false,
              },
            );
          });
        });

        describe("'REGISTERED' role with 'NEW' registration-state", () => {
          beforeEach(() => {
            sessionService.getRole.mockReturnValue(Roles.registered);
          });

          describe('registerAccount', () => {
            beforeEach(() => {
              sessionEnforcerService(
                [Roles.registered],
                {
                  [EnforcerCallbacks.signIn]: signIn,
                  [EnforcerCallbacks.cancel]: cancel,
                  [EnforcerCallbacks.change]: change,
                },
                EnforcerModes.donor,
              );
            });

            it("opens registerAccount modal and calls 'change' callback", () => {
              $rootScope.$digest();

              expect(orderService.getDonorDetails).toHaveBeenCalled();
              expect(change).toHaveBeenCalledWith(Roles.registered, 'NEW');
              expect(sessionModalService.open).toHaveBeenCalledWith(
                'register-account',
                {
                  backdrop: 'static',
                  keyboard: false,
                },
              );
            });

            describe('register account success', () => {
              it("calls 'sign-in' callback", () => {
                deferred.resolve();
                $rootScope.$digest();

                expect(signIn).toHaveBeenCalled();
              });
            });

            describe('register account canceled', () => {
              it("calls 'cancel' callback", () => {
                deferred.reject();
                $rootScope.$digest();

                expect(cancel).toHaveBeenCalled();
              });
            });
          });

          describe('orderService.getDonorDetails() fails', () => {
            beforeEach(() => {
              orderService.getDonorDetails.mockImplementation(() =>
                Observable.throw({}),
              );
            });

            it("opens registerAccount modal and calls 'change' callback", () => {
              sessionEnforcerService(
                [Roles.registered],
                {
                  [EnforcerCallbacks.signIn]: signIn,
                  [EnforcerCallbacks.cancel]: cancel,
                  [EnforcerCallbacks.change]: change,
                },
                EnforcerModes.donor,
              );
              $rootScope.$digest();

              expect(orderService.getDonorDetails).toHaveBeenCalled();
              expect(change).toHaveBeenCalledWith(Roles.registered, 'NEW');
              expect(sessionModalService.open).toHaveBeenCalledWith(
                'register-account',
                {
                  backdrop: 'static',
                  keyboard: false,
                },
              );
            });

            it('opens registerAccount modal', () => {
              sessionEnforcerService(
                [Roles.registered],
                {
                  [EnforcerCallbacks.signIn]: signIn,
                  [EnforcerCallbacks.cancel]: cancel,
                },
                EnforcerModes.donor,
              );
              $rootScope.$digest();

              expect(orderService.getDonorDetails).toHaveBeenCalled();
              expect(signIn).not.toHaveBeenCalled();
              expect(change).not.toHaveBeenCalled();
              expect(cancel).not.toHaveBeenCalled();
              expect(sessionModalService.open).toHaveBeenCalledWith(
                'register-account',
                {
                  backdrop: 'static',
                  keyboard: false,
                },
              );
            });
          });
        });

        describe("'REGISTERED' role with 'COMPLETED' registration-state", () => {
          let currentModalDismissMock = jest.fn();
          beforeEach(() => {
            sessionService.getRole.mockReturnValue(Roles.registered);
            orderService.getDonorDetails.mockImplementation(() =>
              Observable.of({ 'registration-state': 'COMPLETED' }),
            );
            jest
              .spyOn(sessionModalService, 'currentModal')
              .mockImplementation(() => {
                return {
                  dismiss: currentModalDismissMock,
                  close: jest.fn(),
                };
              });
            currentModalDismissMock.mockClear();
          });

          it("does not open registerAccount modal and calls 'sign-in' callback", () => {
            sessionEnforcerService(
              [Roles.registered],
              {
                [EnforcerCallbacks.signIn]: signIn,
                [EnforcerCallbacks.cancel]: cancel,
                [EnforcerCallbacks.change]: change,
              },
              EnforcerModes.donor,
            );
            $rootScope.$digest();

            expect(orderService.getDonorDetails).toHaveBeenCalled();
            expect(signIn).toHaveBeenCalled();
            expect(change).not.toHaveBeenCalled();
            expect(sessionModalService.open).not.toHaveBeenCalled();
          });

          it('does not open registerAccount modal', () => {
            sessionEnforcerService([Roles.registered], {}, EnforcerModes.donor);
            $rootScope.$digest();

            expect(orderService.getDonorDetails).toHaveBeenCalled();
            expect(signIn).not.toHaveBeenCalled();
            expect(change).not.toHaveBeenCalled();
            expect(sessionModalService.open).not.toHaveBeenCalled();
          });

          it('should call sessionModalService.currentModal', () => {
            expect(currentModalDismissMock).not.toHaveBeenCalled();

            sessionEnforcerService([Roles.registered], {}, EnforcerModes.donor);
            $rootScope.$digest();
            expect(sessionModalService.currentModal).toHaveBeenCalled();
            expect(currentModalDismissMock).toHaveBeenCalled();
          });
        });
      });
    });

    describe('sessionEnforcerService.cancel', () => {
      it('cancels known enforcer', () => {
        const id = sessionEnforcerService([Roles.public, Roles.registered]);
        const result = sessionEnforcerService.cancel(id);

        expect(result).toEqual(true);
      });

      it('returns false on unknown id', () => {
        expect(sessionEnforcerService.cancel('abcdefg')).toEqual(false);
      });
    });
  });
});
