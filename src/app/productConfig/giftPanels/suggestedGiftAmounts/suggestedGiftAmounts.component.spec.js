import angular from 'angular';
import 'angular-mocks';
import 'angular-translate';
import * as structuredErrorService from 'common/services/structuredError.service';
import suggestedGiftAmounts from './suggestedGiftAmounts.component';

describe('suggestedGiftAmounts', () => {
  let $ctrl;
  let $componentController;

  beforeEach(() => {
    angular.mock.module(suggestedGiftAmounts.name, 'pascalprecht.translate');

    // Match the strategy app.config.js configures, so the rendering tests below
    // exercise production's translate setup rather than angular-translate's
    // default of no strategy at all.
    angular.mock.module(($translateProvider) => {
      $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    });

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

  describe('amountFormatError', () => {
    let $compile;
    let $rootScope;

    const recipientCommentsMessage =
      'RECIPIENT_COMMENTS Value is too long. Max value is 250 characters.';
    const amountMessage = 'AMOUNT Value must be a valid decimal.';

    const structuredError = (...fieldNames) => ({
      config: {},
      data: {
        messages: fieldNames.map((fieldName) => ({
          data: { 'field-name': fieldName },
          'debug-message':
            fieldName === 'AMOUNT' ? amountMessage : recipientCommentsMessage,
          id: 'field.invalid.example',
          type: 'error',
        })),
      },
    });

    // Renders the real component template so we assert on the DOM the user
    // actually sees, not on the raw string the service returns.
    const renderErrorParagraph = (amountFormatError) => {
      const scope = $rootScope.$new();
      scope.amountFormatError = amountFormatError;
      const element = $compile(
        '<suggested-gift-amounts amount-format-error="amountFormatError"></suggested-gift-amounts>',
      )(scope);
      scope.$digest();
      return element[0].querySelector('.alert-danger p');
    };

    beforeEach(inject((_$compile_, _$rootScope_) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    }));

    it("should render the service's <br /> separator as a line break element", () => {
      const paragraph = renderErrorParagraph(
        structuredErrorService.getErrorMessage(
          structuredError('RECIPIENT_COMMENTS', 'AMOUNT'),
        ),
      );

      expect(paragraph.querySelectorAll('br').length).toEqual(1);
    });

    it('should not print the <br /> separator to the screen as literal text', () => {
      const paragraph = renderErrorParagraph(
        structuredErrorService.getErrorMessage(
          structuredError('RECIPIENT_COMMENTS', 'AMOUNT'),
        ),
      );

      expect(paragraph.textContent).not.toContain('<br');
      expect(paragraph.textContent).toContain(recipientCommentsMessage);
      expect(paragraph.textContent).toContain(amountMessage);
    });

    it('should not render a line break for a single error message', () => {
      const paragraph = renderErrorParagraph(
        structuredErrorService.getErrorMessage(
          structuredError('RECIPIENT_COMMENTS'),
        ),
      );

      expect(paragraph.querySelectorAll('br').length).toEqual(0);
      expect(paragraph.textContent).toEqual(recipientCommentsMessage);
    });
  });
});
