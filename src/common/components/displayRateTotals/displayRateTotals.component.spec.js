import angular from 'angular';
import 'angular-mocks';

import module from './displayRateTotals.component';

describe('displayRateTotals', function () {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function ($componentController) {
    self.controller = $componentController(module.name);
  }));

  describe('rateTotalsComparator', () => {
    it('should return which of 2 values should be displayed first', () => {
      expect(
        self.controller.rateTotalsComparator(
          { value: 'Single' },
          { value: 'Monthly' },
        ),
      ).toEqual(-1);
      expect(
        self.controller.rateTotalsComparator(
          { value: 'Single' },
          { value: 'Quarterly' },
        ),
      ).toEqual(-1);
      expect(
        self.controller.rateTotalsComparator(
          { value: 'Single' },
          { value: 'Annually' },
        ),
      ).toEqual(-1);

      expect(
        self.controller.rateTotalsComparator(
          { value: 'Monthly' },
          { value: 'Single' },
        ),
      ).toEqual(1);
      expect(
        self.controller.rateTotalsComparator(
          { value: 'Monthly' },
          { value: 'Quarterly' },
        ),
      ).toEqual(-1);
      expect(
        self.controller.rateTotalsComparator(
          { value: 'Monthly' },
          { value: 'Annually' },
        ),
      ).toEqual(-1);

      expect(
        self.controller.rateTotalsComparator(
          { value: 'Quarterly' },
          { value: 'Single' },
        ),
      ).toEqual(1);
      expect(
        self.controller.rateTotalsComparator(
          { value: 'Quarterly' },
          { value: 'Monthly' },
        ),
      ).toEqual(1);
      expect(
        self.controller.rateTotalsComparator(
          { value: 'Quarterly' },
          { value: 'Annually' },
        ),
      ).toEqual(-1);

      expect(
        self.controller.rateTotalsComparator(
          { value: 'Annually' },
          { value: 'Single' },
        ),
      ).toEqual(1);
      expect(
        self.controller.rateTotalsComparator(
          { value: 'Annually' },
          { value: 'Monthly' },
        ),
      ).toEqual(1);
      expect(
        self.controller.rateTotalsComparator(
          { value: 'Annually' },
          { value: 'Quarterly' },
        ),
      ).toEqual(1);
    });
  });
});
