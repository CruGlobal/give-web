import angular from 'angular';
import 'angular-mocks';
import module from './recurring-gifts.component';

describe('recurringGiftsController', function() {
  beforeEach(angular.mock.module(module.name));
  let self = {};

  beforeEach(inject(function($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(module.name, {
      $scope: $scope
    });
  }));

  it('should call BuildGifts()', () => {
    spyOn(self.controller, 'buildGifts');
    self.controller.$onInit();
    expect(self.controller.buildGifts).toHaveBeenCalled();
  });

  it('to be defined', () => {
    expect(self.controller).toBeDefined();
  });

  it('should return an array of gifts', () => {
    self.controller.gifts = [
      {
        'rate': {},
        'recurring-day-of-month': '',
        'donation-lines': [{},{}]
      },
      {
        'rate': {},
        'recurring-day-of-month': '',
        'donation-lines': [{},{}]
      }
    ];

    expect(self.controller.buildGifts().length).toBe(4);
  });

});
