import angular from 'angular';
import 'angular-mocks';

import module from './tsys.service';

describe('order service', () => {
  beforeEach(angular.mock.module(module.name));
  const self = {};

  beforeEach(inject((tsysService, $httpBackend) => {
    self.tsysService = tsysService;
    self.$httpBackend = $httpBackend;
  }));

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation();
    self.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('setDevice', () => {
    it('should set the branded checkout TSYS device', () => {
      expect(self.tsysService.device).toEqual('');
      self.tsysService.setDevice('test-env');

      expect(self.tsysService.device).toEqual('test-env');
    });
  });

  describe('getDevice', () => {
    it('should get the branded checkout TSYS device', () => {
      self.tsysService.device = 'test-env';
      const device = self.tsysService.getDevice();

      expect(device).toEqual('test-env');
    });
  });

  describe('getManifest', () => {
    it('should load the device id and manifest for TSYS tokenization', () => {
      self.$httpBackend
        .expectGET('https://give-stage2.cru.org/cortex/tsys/manifest')
        .respond(200, { deviceId: '<device id>', manifest: '<manifest>' });
      self.tsysService.getManifest().subscribe((data) => {
        expect(data).toEqual({
          deviceId: '<device id>',
          manifest: '<manifest>',
        });
      });
      self.$httpBackend.flush();
    });

    it('should use the branded checkout TSYS environment if specified', () => {
      self.tsysService.device = 'test-env';
      self.$httpBackend
        .expectGET('https://give-stage2.cru.org/cortex/tsys/manifest/test-env')
        .respond(200, { deviceId: '<device id>', manifest: '<manifest>' });
      self.tsysService.getManifest().subscribe((data) => {
        expect(data).toEqual({
          deviceId: '<device id>',
          manifest: '<manifest>',
        });
      });
      self.$httpBackend.flush();
    });
  });
});
