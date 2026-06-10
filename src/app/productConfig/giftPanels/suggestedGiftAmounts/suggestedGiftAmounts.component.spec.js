import angular from 'angular';
import 'angular-mocks';
import 'angular-translate';
import suggestedGiftAmounts from './suggestedGiftAmounts.component';

describe('suggestedGiftAmounts', () => {
  let $ctrl;
  let $componentController;

  beforeEach(() => {
    angular.mock.module(suggestedGiftAmounts.name, 'pascalprecht.translate');

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

  describe('template', () => {
    let $compile, $rootScope;

    beforeEach(inject((_$compile_, _$rootScope_) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    }));

    const compileComponent = (scopeValues) => {
      const scope = $rootScope.$new();
      Object.assign(
        scope,
        {
          itemConfig: {},
          customInputActive: false,
          customAmount: undefined,
          suggestedAmounts: [],
          selectableAmounts: [50, 100, 250, 500, 1000, 5000],
        },
        scopeValues,
      );
      const element = $compile(
        '<suggested-gift-amounts ' +
          'use-v3="useV3" ' +
          'use-suggested-amounts="useSuggestedAmounts" ' +
          'suggested-amounts="suggestedAmounts" ' +
          'selectable-amounts="selectableAmounts" ' +
          'custom-input-active="customInputActive" ' +
          'item-config="itemConfig" ' +
          'custom-amount="customAmount">' +
          '</suggested-gift-amounts>',
      )(scope);
      $rootScope.$digest();
      return element[0];
    };

    it('shows a visible "Other amount" label tied to the custom input in the default variant', () => {
      const element = compileComponent({ useSuggestedAmounts: false });
      const label = element.querySelector('#customAmountLabel');
      const input = element.querySelector('input[name="amount"]');

      expect(label).not.toBeNull();
      expect(label.textContent.trim()).toEqual('OTHER_AMOUNT');
      expect(input.getAttribute('aria-labelledby')).toEqual(
        'customAmountLabel',
      );
      expect(input.getAttribute('placeholder')).toBeNull();
    });

    it('shows a visible "Other amount" label tied to the custom input in the v3 variant', () => {
      const element = compileComponent({
        useSuggestedAmounts: true,
        useV3: true,
        suggestedAmounts: [{ amount: 50, label: 'Suggested', order: 1 }],
      });
      const label = element.querySelector('#customAmountLabelV3');
      const input = element.querySelector('input[name="amount"]');

      expect(label).not.toBeNull();
      expect(label.textContent.trim()).toEqual('OTHER_AMOUNT');
      expect(input.getAttribute('aria-labelledby')).toEqual(
        'customAmountLabelV3',
      );
      expect(input.getAttribute('placeholder')).toBeNull();
    });

    it('shows a visible "Other amount" label tied to the custom input in the non-v3 suggested amounts variant', () => {
      const element = compileComponent({
        useSuggestedAmounts: true,
        useV3: false,
        suggestedAmounts: [{ amount: 50, label: 'Suggested', order: 1 }],
      });
      const label = element.querySelector('#customAmountLabelRadio');
      const input = element.querySelector('input[name="amount"]');

      expect(label).not.toBeNull();
      expect(label.textContent.trim()).toEqual('OTHER_AMOUNT');
      expect(input.getAttribute('aria-labelledby')).toEqual(
        'customAmountLabelRadio',
      );
      expect(input.getAttribute('placeholder')).toBeNull();
    });
  });
});
