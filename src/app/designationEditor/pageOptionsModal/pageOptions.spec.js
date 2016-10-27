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
      suggestedAmounts: [],
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
});
