import angular from 'angular';
import 'angular-mocks';

import module from './globalWebsitesModal.component.js';

describe('globalWebsitesModal', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(($componentController) => {
    self.controller = $componentController(module.name, {}, {
      close: jasmine.createSpy('close'),
      dismiss: jasmine.createSpy('dismiss')
    });
  }));

  it('should be defined', () => {
    expect(self.controller).toBeDefined();
  });
});
