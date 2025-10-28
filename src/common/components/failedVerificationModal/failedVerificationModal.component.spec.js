import angular from 'angular';
import 'angular-mocks';
import module from './failedVerificationModal.component';

describe('failedVerificationModal', function () {
  beforeEach(angular.mock.module(module.name));
  let $ctrl;

  beforeEach(inject(function (_$componentController_) {
    $ctrl = _$componentController_(module.name);
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
  });
});
