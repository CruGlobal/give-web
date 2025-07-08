import angular from 'angular';
import 'angular-mocks';
import module from './personalOptions.modal';

describe('Designation Editor Personal Options', function () {
  beforeEach(angular.mock.module(module.name));
  let $ctrl;

  const controllerInjections = {
    designationNumber: '000555',
    designationType: 'Staff',
    giveDomain: 'https://give.cru.org',
    givingLinks: {
      'jcr:primaryType': 'nt:unstructured',
      1: {
        'jcr:primaryType': 'nt:unstructured',
        url: 'https://example.com',
        name: 'Name',
      },
    },
    showNewsletterForm: true,
    hasNewsletter: true,
  };

  beforeEach(inject(function ($rootScope, $controller) {
    const $scope = $rootScope.$new();

    $ctrl = $controller(module.name, {
      ...controllerInjections,
      $scope: $scope,
    });
    $scope.$close = jest.fn();
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
  });

  it('to define modal resolves', function () {
    expect($ctrl.designationNumber).toEqual('000555');
    expect($ctrl.designationType).toEqual('Staff');
    expect($ctrl.givingLinks).toEqual([
      { name: 'Name', url: 'https://example.com', order: 1 },
    ]);
    expect($ctrl.showNewsletterForm).toEqual(true);
  });

  it('transforms giving links', function () {
    expect($ctrl.transformGivingLinks()).toEqual({
      1: { name: 'Name', url: 'https://example.com' },
    });
  });

  describe('givingLinksAvailable', () => {
    describe('for national staff', () => {
      beforeEach(inject(function ($rootScope, $controller) {
        const $scope = $rootScope.$new();

        $ctrl = $controller(module.name, {
          ...controllerInjections,
          designationType: 'National Staff',
          $scope: $scope,
        });
      }));

      it('is true', () => {
        expect($ctrl.givingLinksAvailable).toBe(true);
      });
    });

    it('otherwise is false', () => {
      expect($ctrl.givingLinksAvailable).toBe(false);
    });
  });

  describe('saveChanges()', () => {
    it('should close modal and provide updated properties', () => {
      $ctrl.showNewsletterForm = false;
      $ctrl.saveChanges();
      expect($ctrl.$scope.$close).toHaveBeenCalledWith({
        givingLinks: { 1: { name: 'Name', url: 'https://example.com' } },
        showNewsletterForm: false,
      });
    });
  });
});
