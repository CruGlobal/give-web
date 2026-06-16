import angular from 'angular';
import 'angular-mocks';
import 'angular-translate';
import moment from 'moment';

import module from './giftSummaryView.component';

describe('giftViews', () => {
  describe('giftSummaryView', () => {
    beforeEach(angular.mock.module(module.name, 'pascalprecht.translate'));
    let $ctrl;

    beforeEach(inject(($componentController) => {
      $ctrl = $componentController(module.name);
    }));

    it('is defined', () => {
      expect($ctrl).toBeDefined();
    });

    describe('template', () => {
      let $compile, $rootScope;

      beforeEach(inject((_$compile_, _$rootScope_) => {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
      }));

      const compileWithGift = (gift) => {
        const scope = $rootScope.$new();
        scope.gift = gift;
        const element = $compile(
          '<gift-summary-view gift="gift"></gift-summary-view>',
        )(scope);
        $rootScope.$digest();
        return element.text().replace(/\s+/g, ' ').trim();
      };

      const buildGift = (frequency) => ({
        amount: 25,
        frequency: frequency,
        transactionDay: '15',
        nextGiftDate: moment.utc('2056-07-15'),
      });

      it('renders the interpolated day label for monthly gifts', () => {
        const text = compileWithGift(buildGift('Monthly'));

        expect(text).toContain('On the 15th of each month');
        expect(text).not.toContain('{{');
      });

      it('renders the interpolated day label for quarterly gifts', () => {
        const text = compileWithGift(buildGift('Quarterly'));

        expect(text).toContain(
          'On the 15th of July, October, January, and April',
        );
        expect(text).not.toContain('{{');
      });

      it('renders the interpolated day label for annual gifts', () => {
        const text = compileWithGift(buildGift('Annual'));

        expect(text).toContain('On July 15th of each year');
        expect(text).not.toContain('{{');
      });
    });
  });
});
