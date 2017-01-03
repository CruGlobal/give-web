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
  });

  describe('$onInit()', () => {
    it('should initialize the component', () => {
      let element = {id: 'container'};
      spyOn(document, 'getElementById').and.returnValue(element);
      self.controller.$onInit();
      // eslint-disable-next-line angular/document-service
      expect(document.getElementById).toHaveBeenCalledWith('globalWebsites-modal');
      expect(self.controller.container).toBeDefined();
    });
  });

  describe('scrollTo()', () => {
    it('should call container.scrollTo()', () => {
      let element = {id: 'globalWebsites-continent--africa'};
      spyOn(document, 'getElementById').and.returnValue(element);
      self.controller.container = jasmine.createSpyObj('container', ['scrollTo']);
      self.controller.scrollTo('globalWebsites-continent--africa');
      // eslint-disable-next-line angular/document-service
      expect(document.getElementById).toHaveBeenCalledWith('globalWebsites-continent--africa');
      expect(self.controller.container.scrollTo).toHaveBeenCalledWith(jasmine.anything(), 0, 300);
    });
  });

  describe('getContinentId()', () => {
    it('should return clean div id', () => {
      expect(self.controller.getContinentId('/africa')).toBe('globalWebsites-continent--africa');
    });
  });
});
