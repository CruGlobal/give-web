import angular from 'angular';
import 'angular-mocks';
import module from './give.component';

describe('give', function() {
  beforeEach(angular.mock.module(module.name));
  var self = {};
  var currentYear = new Date().getFullYear();

  beforeEach(inject(function($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(module.name, {
      $scope: $scope
    });
    self.controller.data = {
      payments: [
        {
          paymentDate: '03/30/2014',
          amount:  200.00
        },
        {
          paymentDate: '03/30/'+currentYear,
          amount:  500.00
        },
        {
          paymentDate: '03/30/'+currentYear,
          amount:  54.40
        }
      ]
    };

  }));

  it('to be defined', function() {
    expect(self.controller).toBeDefined();
  });

  it('should return year to date sum of donations', () => {
    expect(self.controller.yearToDateGiving()).toBe(554.40);
  });

  it('should return last payment date', () => {
    expect(self.controller.lastPaymentDate()).toBe('3/30/'+currentYear);
  });

});
