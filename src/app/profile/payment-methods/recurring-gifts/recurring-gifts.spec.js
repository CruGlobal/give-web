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

    self.controller.buildGifts();
    expect(self.controller.gifts.length).toBe(4);
  });

  it('should give next gift date', () => {
    let data = {};
    expect(self.controller.getNextGiftDate(data)).toBe(false);
    data['recurring-day-of-month'] = '25';
    // im not sure how to test this function without duplicating its functionality into here =))
    expect(self.controller.getNextGiftDate(data).indexOf('25/') != -1).toBe(true);
  });


});
