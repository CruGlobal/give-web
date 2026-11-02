import angular from 'angular';
import 'angular-mocks';
import 'angular-translate';

import module from './checkout-error-messages.component';

describe('checkoutErrorMessages', () => {
  beforeEach(angular.mock.module(module.name, 'pascalprecht.translate'));
  let $compile, $rootScope;

  beforeEach(inject((_$compile_, _$rootScope_) => {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  const render = (submissionError) => {
    const scope = $rootScope.$new();
    scope.submissionError = submissionError;
    const element = $compile(
      '<checkout-error-messages submission-error="submissionError"></checkout-error-messages>',
    )(scope);
    $rootScope.$digest();
    return element.text();
  };

  it('shows the verification error for Invalid Data', () => {
    const text = render('Invalid Data');

    expect(text).toContain('REVIEW_VERIFICATION_ERROR');
    expect(text).not.toContain('REVIEW_DEFAULT_ERROR');
  });

  it('shows the default error for an unknown error', () => {
    const text = render('Something else');

    expect(text).toContain('REVIEW_DEFAULT_ERROR');
    expect(text).not.toContain('REVIEW_VERIFICATION_ERROR');
  });
});
