import angular from 'angular';
import 'angular-mocks';

import module from './tsys.service';

describe('order service', () => {
  beforeEach(angular.mock.module(module.name));
  let self = {};

  beforeEach(inject((tsysService, $httpBackend) => {
    self.tsysService = tsysService;
    self.$httpBackend = $httpBackend;
  }));

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation();
    self.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('setEnvironment', () => {
    it('should set the branded checkout TSYS environment', () => {
      expect(self.tsysService.environment).toEqual('');
      self.tsysService.setEnvironment('test-env');
      expect(self.tsysService.environment).toEqual('test-env');
    });
    
    it('should handle default', () => {
      expect(self.tsysService.environment).toEqual('');
      self.tsysService.setEnvironment('default');
      expect(self.tsysService.environment).toEqual('');
    });
  });

  describe('getManifest', () => {
    it('should load the device id and manifest for TSYS tokenization', () => {
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/tsys/manifest')
        .respond(200, { deviceId: '<device id>', manifest: '<manifest>' });
      self.tsysService.getManifest()
        .subscribe(data => {
          expect(data).toEqual({ deviceId: '<device id>', manifest: '<manifest>' });
        });
      self.$httpBackend.flush();
    });

    it('should use the branded checkout TSYS environment if specified', () => {
      self.tsysService.environment = 'test-env';
      self.$httpBackend.expectGET('https://give-stage2.cru.org/cortex/tsys/manifest/test-env')
        .respond(200, { deviceId: '<device id>', manifest: '<manifest>' });
      self.tsysService.getManifest()
        .subscribe(data => {
          expect(data).toEqual({ deviceId: '<device id>', manifest: '<manifest>' });
        });
      self.$httpBackend.flush();
    });
  });
});
