import angular from 'angular';
import 'angular-mocks';

import module from './display-address.component';

describe('display-address', function() {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function($componentController) {
    self.controller = $componentController(module.name);
  }));

  it('should be defined', () => {
    expect(self.controller).toBeDefined();
  });
});
