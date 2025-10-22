import angular from 'angular';
import 'angular-mocks';
import giftFrequency from './giftFrequency.component';

describe('giftFrequency', () => {
  let $ctrl;
  let $componentController;

  beforeEach(() => {
    angular.mock.module(giftFrequency.name);

    angular.mock.inject((_$componentController_) => {
      $componentController = _$componentController_;
    });

    $ctrl = $componentController('giftFrequency');
  });

  describe('frequencyOrder()', () => {
    it('orders frequency by name', () => {
      expect($ctrl.frequencyOrder({ name: 'NA' })).toEqual(0);
      expect($ctrl.frequencyOrder({ name: 'MON' })).toEqual(1);
    });

    it('changes frequency order when quarterly is shown', () => {
      expect($ctrl.frequencyOrder({ name: 'QUARTERLY' })).toEqual(2);
    });

    it('should change frequency order when annual is shown', () => {
      expect($ctrl.frequencyOrder({ name: 'ANNUAL' })).toEqual(3);
    });
  });
});
