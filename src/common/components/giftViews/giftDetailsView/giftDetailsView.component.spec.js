import angular from 'angular';
import 'angular-mocks';
import moment from 'moment';

import module from './giftDetailsView.component';

describe('giftViews', () => {
  describe('giftDetailsView', () => {
    beforeEach(angular.mock.module(module.name));
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

      it('renders the day label for annual gifts', () => {
        const scope = $rootScope.$new();
        scope.gift = {
          amount: 25,
          frequency: 'Annual',
          transactionDay: '15',
          nextGiftDate: moment.utc('2056-07-15'),
        };
        const element = $compile(
          '<gift-details-view gift="gift"></gift-details-view>',
        )(scope);
        $rootScope.$digest();
        const text = element.text().replace(/\s+/g, ' ').trim();

        expect(text).toContain('On July 15th of each year');
        expect(text).not.toContain('{{');
      });
    });
  });
});
