import angular from 'angular';
import 'angular-mocks';
import module from './payment-methods.component';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import {Roles} from 'common/services/session/session.service';

describe('payment methods', function() {
  beforeEach(angular.mock.module(module.name));
  var fakeModal = function() {
    return {
      result: {
        then: function(confirmCallback) {
          this.paymentMethods = [];
          confirmCallback();
        }
      }
    };
  };

  let self = {};
  let uibModal = jasmine.createSpyObj('$uibModal', ['open','close']);

  uibModal.open.and.callFake(fakeModal);

  beforeEach(inject(function($rootScope, $componentController, $timeout) {
    var $scope = $rootScope.$new();
    self.controller = $componentController(module.name, {
      $scope: $scope,
      $uibModal: uibModal,
      profileService: {
        getPaymentMethodsWithDonations: angular.noop,
        addPaymentMethod: angular.noop,
        getDonorDetails: angular.noop
      },
      $location: {},
      $window: {},
      $timeout: $timeout
    });

  }));

  it('to be defined', () => {
    expect(self.controller).toBeDefined();
  });

  describe( '$onInit()', () => {
    beforeEach( () => {
      spyOn( self.controller, 'sessionEnforcerService' );
      spyOn(self.controller, 'loadDonorDetails');
      spyOn(self.controller, 'loadPaymentMethods');
      self.controller.$onInit();
      expect(self.controller.loadDonorDetails).toHaveBeenCalled();
      expect(self.controller.loadPaymentMethods).toHaveBeenCalled();
    } );
    it( 'initializes the component', () => {
      expect( self.controller.sessionEnforcerService ).toHaveBeenCalledWith(
        [Roles.registered], jasmine.objectContaining( {
          'sign-in': jasmine.any( Function ),
          cancel:    jasmine.any( Function )
        } )
      );
    } );

    describe( 'sessionEnforcerService success', () => {
      it( 'executes success callback', () => {
        self.controller.sessionEnforcerService.calls.argsFor( 0 )[1]['sign-in']();
        expect(self.controller.loadDonorDetails).toHaveBeenCalled();
        expect(self.controller.loadPaymentMethods).toHaveBeenCalled();
      } );
    } );

    describe( 'sessionEnforcerService failure', () => {
      it( 'executes failure callback', () => {
        self.controller.sessionEnforcerService.calls.argsFor( 0 )[1]['cancel']();
        expect( self.controller.$window.location ).toEqual( '/' );
      } );
    } );

  } );

  it('should load payment methods on $onInit()', () => {
    spyOn(self.controller.profileService, 'getPaymentMethodsWithDonations').and.returnValue(Observable.of([{},{}]));
    self.controller.loadPaymentMethods();
    expect(self.controller.paymentMethods).toEqual([{},{}]);
  });

  it('should handle and error of loading payment methods on $onInit()', () => {
    spyOn(self.controller.profileService, 'getPaymentMethodsWithDonations').and.returnValue(Observable.throw({
      data: 'some error'
    }));
    self.controller.loadPaymentMethods();
    expect(self.controller.error).toBe('Failed retrieving payment methods.');
  });

  it('should get donor details', () => {
    spyOn(self.controller.profileService, 'getDonorDetails').and.returnValue(Observable.of({mailingAddress: 'address'}));
    self.controller.loadDonorDetails();
    expect(self.controller.mailingAddress).toBe('address');
  });

  it('should open add Payment Method Modal', () => {
    self.controller.paymentMethods = [{},{}];
    self.controller.addPaymentMethod();
    expect(self.controller.$uibModal.open).toHaveBeenCalled();
    self.controller.onSubmit = () => {return 'here';};
    expect(self.controller.$uibModal.open.calls.first().args[0].resolve.onSubmit()()).toBe('here');
  });

  it('should add payment method', () => {
    let e = {
      success: true,
      data: 'some data'
    };
    spyOn(self.controller.profileService, 'addPaymentMethod').and.returnValue(Observable.of('data'));
    self.controller.paymentMethodFormModal = jasmine.createSpyObj('paymentMethodFormModal',['close']);

    self.controller.parentComponent = self.controller;
    self.controller.onSubmit(e);
    expect(self.controller.paymentMethodFormModal.close).toHaveBeenCalled();
  });

  it('should update payment methods list on modal close', () => {
    self.controller.paymentMethods = [{},{}];
    self.controller.addPaymentMethod();
    let callback = () => {};
    self.controller.paymentMethodFormModal.result.then(callback);
    expect(self.controller.paymentMethods.length).toBe(3);
    self.controller.$timeout.flush();
    expect(self.controller.successMessage.show).toBe(false);
  });

  it('should fail adding payment method and show error message', () => {
    let e = {
      success: true,
      data: 'some data'
    };
    spyOn(self.controller.profileService, 'addPaymentMethod').and.returnValue(Observable.throw({
      data: 'some error'
    }));
    self.controller.onSubmit(e);
    expect(self.controller.submissionError.error).toBe('some error');
  });

  it('should close modal on component destroy', ()=>{
    self.controller.paymentMethodFormModal = jasmine.createSpyObj('self.controller.paymentMethodFormModal', ['close']);
    self.controller.$onDestroy();
    expect(self.controller.paymentMethodFormModal.close).toHaveBeenCalled();
  });

  it('should return true if payment method is a card', () => {
    expect(self.controller.isCard({'card-number': '2222'})).toBe(true);
    expect(self.controller.isCard({'bank': '2222'})).toBe(false);
  });

  it('should do stuff onDelete()', () => {
    self.controller.onDelete();
    expect(self.controller.successMessage.show).toBe(true);
    expect(self.controller.successMessage.type).toBe('paymentMethodDeleted');
    self.controller.$timeout.flush();
    expect(self.controller.successMessage.show).toBe(false);
  });

  it('should not try to add a payment method if success if false', ()=> {
    let e = {
      success: false
    };
    spyOn(self.controller.profileService, 'addPaymentMethod');
    self.controller.onSubmit(e);
    expect(self.controller.profileService.addPaymentMethod).not.toHaveBeenCalled();
  });
});
