import angular from 'angular';
import 'angular-mocks';

import module from './stopStartStep0.component';

describe('your giving', () => {
  describe('stopStartRecurringGiftsModal', () => {
    describe('stopStartStep0', () => {
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
});
