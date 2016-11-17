import angular from 'angular';
import 'angular-mocks';

import module from './globalWebsitesModal.component.js';

describe('globalWebsitesModal', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(($componentController) => {
    self.controller = $componentController(module.name, {}, {
      dismiss: jasmine.createSpy('dismiss')
    });
  }));

  it('should be defined', () => {
    expect(self.controller).toBeDefined();
    expect(self.controller.$anchorScroll).toBeDefined();
    expect(self.controller.$location).toBeDefined();
  });

  describe('scrollTo()', () => {
    it('should do anchor tag navigation', () => {
      spyOn(self.controller, '$anchorScroll');
      self.controller.scrollTo('ukraine');
      expect(self.controller.country).toBe('ukraine');
    });
  });

  describe('getContinentId()', () => {
    it('should return clean id', () => {
      expect(self.controller.getContinentId('/ukraine')).toBe('ukraine');
    });
  });
});
