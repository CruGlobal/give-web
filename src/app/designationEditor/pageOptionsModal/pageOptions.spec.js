import angular from 'angular';
import 'angular-mocks';
import module from './pageOptions.modal';

describe('Designation Editor Page Options', function() {
  beforeEach(angular.mock.module(module.name));
  var $ctrl;

  beforeEach(inject(function($rootScope, $controller) {
    var $scope = $rootScope.$new();

    $ctrl = $controller( module.name, {
      parentDesignationNumber: '000555',
      organizationId: 'IT-001',
      suggestedAmounts: {
        'jcr:primaryType': 'content',
        '100': '1 Bible',
        '200': '2 Bibles'
      },
      $scope: $scope
    } );
  }));

  it('to be defined', function() {
    expect($ctrl).toBeDefined();
  });

  it('to define modal resolves', function() {
    expect($ctrl.parentDesignationNumber).toEqual('000555');
    expect($ctrl.organizationId).toEqual('IT-001');
    expect($ctrl.suggestedAmounts).toBeDefined();
  });

  it('transform suggested amounts', function() {
    expect($ctrl.suggestedAmounts).toEqual([
      {amount: 100, description: '1 Bible'},
      {amount: 200, description: '2 Bibles'}
    ]);

    expect($ctrl.transformSuggestedAmounts()).toEqual({
      '100': '1 Bible',
      '200': '2 Bibles'
    });
  });
});
