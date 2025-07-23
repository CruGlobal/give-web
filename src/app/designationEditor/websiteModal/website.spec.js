import angular from 'angular';
import 'angular-mocks';
import module from './website.modal';

describe('Designation Editor Website', function () {
  beforeEach(angular.mock.module(module.name));
  var $ctrl;

  beforeEach(inject(function ($rootScope, $controller) {
    var $scope = $rootScope.$new();

    $ctrl = $controller(module.name, {
      initialWebsite: 'http://www.cru.org',
      $scope: $scope,
    });
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
  });

  it('to define modal resolves', function () {
    expect($ctrl.website).toEqual('http://www.cru.org');
  });
});
