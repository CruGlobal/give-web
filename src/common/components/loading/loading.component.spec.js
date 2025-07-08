import angular from 'angular';
import 'angular-mocks';
import module from './loading.component';

describe('loading', () => {
  beforeEach(angular.mock.module(module.name));
  let $ctrl;

  beforeEach(inject(function ($componentController) {
    $ctrl = $componentController(module.name);
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
    expect($ctrl.type).toEqual('block');
    expect($ctrl.inline).toEqual(false);
    expect($ctrl.iconFirst).toEqual(false);
  });
});
