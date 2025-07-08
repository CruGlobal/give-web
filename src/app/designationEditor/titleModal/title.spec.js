import angular from 'angular';
import 'angular-mocks';
import module from './title.modal';

describe('Designation Editor Title', function () {
  beforeEach(angular.mock.module(module.name));
  var $ctrl;

  beforeEach(inject(function ($rootScope, $controller) {
    var $scope = $rootScope.$new();

    $ctrl = $controller(module.name, {
      receiptTitle: 'Steve & Stacie',
      giveTitle: 'Steve & Stacie Give Page',
      $scope: $scope,
    });
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
  });

  it('to define modal resolves', function () {
    expect($ctrl.receiptTitle).toEqual('Steve & Stacie');
    expect($ctrl.giveTitle).toEqual('Steve & Stacie Give Page');
  });
});
