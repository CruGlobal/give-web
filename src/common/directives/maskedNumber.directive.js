import angular from 'angular';

const directiveName = 'maskedNumber';

export const formatters = {
  card: (digits) => `**** **** **** ${digits.slice(-4)}`,
  account: (digits) =>
    '*'.repeat(Math.max(0, digits.length - 4)) + digits.slice(-4),
};

export const getMaskedNumber = (value, format) => {
  if (!value) {
    return '';
  }
  return formatters[format](String(value).replace(/\D/g, ''));
};

const maskedNumberDirective = /* @ngInject */ function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, ngModelCtrl) {
      const format = formatters[attrs.maskedNumber]
        ? attrs.maskedNumber
        : 'account';
      const overlay = angular.element(
        '<span class="masked-number" aria-hidden="true"></span>',
      );
      let isFocused = false;
      let isShowingOverlay = false;

      const shouldMask = () =>
        !isFocused && !!ngModelCtrl.$modelValue && ngModelCtrl.$valid;

      const update = () => {
        const mask = shouldMask();
        element.toggleClass('is-masked', mask);
        if (mask) {
          overlay.text(getMaskedNumber(ngModelCtrl.$modelValue, format));
          if (!isShowingOverlay) {
            element.after(overlay);
            isShowingOverlay = true;
          }
        } else if (isShowingOverlay) {
          overlay.remove();
          isShowingOverlay = false;
        }
      };

      element.on('focus', () => {
        isFocused = true;
        update();
      });
      element.on('blur', () => {
        isFocused = false;
        update();
      });

      scope.$watchGroup(
        [() => ngModelCtrl.$modelValue, () => ngModelCtrl.$valid],
        update,
      );

      scope.$on('$destroy', () => overlay.remove());
    },
  };
};

export default angular
  .module(directiveName, [])
  .directive(directiveName, maskedNumberDirective);
