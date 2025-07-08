import angular from 'angular';
import 'angular-mocks';

import module from './giftSummaryView.component';

describe('giftViews', () => {
  describe('giftSummaryView', () => {
    beforeEach(angular.mock.module(module.name));
    let $ctrl;

    beforeEach(inject(($componentController) => {
      $ctrl = $componentController(module.name);
    }));

    it('is defined', () => {
      expect($ctrl).toBeDefined();
    });
  });
});
