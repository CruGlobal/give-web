import angular from 'angular';
import 'angular-mocks';
import module from './payment-methods.component';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

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
        addPaymentMethod: angular.noop
      },
      $timeout: $timeout
    });

  }));

  it('to be defined', () => {
    expect(self.controller).toBeDefined();
  });

  it('should load payment methods on $onInit()', () => {
    spyOn(self.controller.profileService, 'getPaymentMethodsWithDonations').and.returnValue(Observable.of([{},{}]));
    self.controller.$onInit();
    expect(self.controller.paymentMethods).toEqual([{},{}]);
  });

  it('should handle and error of loading payment methods on $onInit()', () => {
    spyOn(self.controller.profileService, 'getPaymentMethodsWithDonations').and.returnValue(Observable.throw({
      data: 'some error'
    }));
    self.controller.$onInit();
    expect(self.controller.error).toBe('Failed retrieving payment methods');
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

  it('should not submit', ()=> {
    let e = {
      success: false
    };
    spyOn(self.controller.profileService, 'addPaymentMethod').and.returnValue(Observable.of('data'));
    self.controller.onSubmit(e);
    expect(self.controller.submitted).toBe(false);
  });
});
