import angular from 'angular';
import 'angular-mocks';
import module from './payment-methods.component';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

fdescribe('payment methods', function() {
  beforeEach(angular.mock.module(module.name));
  let self = {},
      uibModal = jasmine.createSpyObj('$uibModal', ['open']);

  beforeEach(inject(function($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(module.name, {
      $scope: $scope,
      $uibModal: uibModal,
      profileService: {
        getPaymentMethodsWithDonations: angular.noop
      }
    });
  }));

  it('to be defined', () => {
    expect(self.controller).toBeDefined();
  });

  it('should load payment methods on $onInit()', () => {
    spyOn(self.controller.profileService, 'getPaymentMethodsWithDonations').and.returnValue(Observable.of('data'));
    self.controller.$onInit();
    expect(self.controller.paymentMethods).toBe('data');
  });

  it('should handle and error of loading payment methods on $onInit()', () => {
    spyOn(self.controller.profileService, 'getPaymentMethodsWithDonations').and.returnValue(Observable.throw({ data: 'some error' }));
    self.controller.$onInit();
    expect(self.controller.error).toBe('Failed retrieving payment methods');
  })

  it('should open a modal', () => {
    self.controller.addPaymentMethod();
    expect(self.controller.$uibModal.open).toHaveBeenCalled();
  });

  it('should add payment method', () => {
    let e = {
      success: true,
      data: 'som data'
    };
    self.controller.onSubmit(e);
    spyOn(self.controller.profileService, 'addPaymentMethod').and.returnValue(Observable.of('data'));
  })
});
