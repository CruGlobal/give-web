import angular from 'angular';
import 'angular-mocks';
import module from './pageOptions.modal';

describe('Designation Editor Page Options', function () {
  beforeEach(angular.mock.module(module.name));
  var $ctrl;

  beforeEach(inject(function ($rootScope, $controller) {
    var $scope = $rootScope.$new();

    $ctrl = $controller(module.name, {
      parentDesignationNumber: '000555',
      organizationId: 'IT-001',
      facebookPixelId: '635334562464',
      suggestedAmounts: {
        'jcr:primaryType': 'nt:unstructured',
        1: {
          'jcr:primaryType': 'nt:unstructured',
          description: '1 Bible',
          amount: 100,
        },
        2: {
          'jcr:primaryType': 'nt:unstructured',
          description: '2 Bibles',
          amount: 200,
        },
        3: {
          'jcr:primaryType': 'nt:unstructured',
          description: '2 Bibles',
          amount: 0,
        },
        4: {},
      },
      $scope: $scope,
    });
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
  });

  it('to define modal resolves', function () {
    expect($ctrl.parentDesignationNumber).toEqual('000555');
    expect($ctrl.organizationId).toEqual('IT-001');
    expect($ctrl.facebookPixelId).toEqual('635334562464');
    expect($ctrl.suggestedAmounts).toBeDefined();
  });

  it('transform suggested amounts', function () {
    expect($ctrl.suggestedAmounts).toEqual([
      { amount: 100, description: '1 Bible', order: 1 },
      { amount: 200, description: '2 Bibles', order: 2 },
    ]);

    expect($ctrl.transformSuggestedAmounts()).toEqual({
      1: { amount: 100, description: '1 Bible' },
      2: { amount: 200, description: '2 Bibles' },
    });
  });

  it('should remove zero or empty objects', function () {
    $ctrl.suggestedAmounts.push({
      amount: 0,
      description: '3 Bibles',
    });
    $ctrl.suggestedAmounts.push({
      amount: 400,
      description: '4 Bibles',
    });
    $ctrl.suggestedAmounts.push({ description: '5 Bibles' });

    expect($ctrl.transformSuggestedAmounts()).toEqual({
      1: { amount: 100, description: '1 Bible' },
      2: { amount: 200, description: '2 Bibles' },
      3: { amount: 400, description: '4 Bibles' },
    });
  });
});
