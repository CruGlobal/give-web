import angular from 'angular';
import 'angular-mocks';
import module from './step-3.component';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

describe('checkout', function() {
  describe('step 3', function() {
    beforeEach(angular.mock.module(module.name));
    var self = {};

    beforeEach(inject(function($rootScope, $componentController) {
      var $scope = $rootScope.$new();

      self.controller = $componentController(module.name, {
        $scope: $scope,
        // Mock services
        cartService: {
          getDonorDetails: () => Observable.of('donor details')
        },
        orderService: {
          getCurrentPayment: () => Observable.of('payment details')
        }
      });
    }));

    describe('init', () => {
      it('should load donor and payment details', function() {
        self.controller.init();
        expect(self.controller.donorDetails).toEqual('donor details');
        expect(self.controller.paymentDetails).toEqual('payment details');
      });
    });
  });
});
