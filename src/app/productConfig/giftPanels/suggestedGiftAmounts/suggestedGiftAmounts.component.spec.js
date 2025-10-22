import angular from 'angular';
import 'angular-mocks';
import suggestedGiftAmounts from './suggestedGiftAmounts.component';

describe('suggestedGiftAmounts', () => {
  let $ctrl;
  let $componentController;

  beforeEach(() => {
    angular.mock.module(suggestedGiftAmounts.name);

    angular.mock.inject((_$componentController_) => {
      $componentController = _$componentController_;
    });

    $ctrl = $componentController('suggestedGiftAmounts');
  });

  describe('suggestedAmount()', () => {
    it('should format suggestedAmounts correctly', () => {
      expect($ctrl.suggestedAmount(123.45)).toEqual('$123.45');
      expect($ctrl.suggestedAmount(12345.67)).toEqual('$12,345.67');
      expect($ctrl.suggestedAmount(123.4)).toEqual('$123.40');
      expect($ctrl.suggestedAmount(123)).toEqual('$123');
      expect($ctrl.suggestedAmount(1234)).toEqual('$1,234');
    });
  });
});
