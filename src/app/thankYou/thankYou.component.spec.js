import angular from 'angular';
import 'angular-mocks';

import module from './thankYou.component.js';

describe('thank you', () => {
  beforeEach(angular.mock.module(module.name));
  const self = {};

  beforeEach(inject(($componentController) => {
    self.controller = $componentController(module.name);
  }));

  it('should be defined', () => {
    expect(self.controller).toBeDefined();
  });
});
