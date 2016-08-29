import angular from 'angular';
import 'angular-mocks';
import { ccpKey, ccpStagingKey } from 'common/app.constants';
import ccp from 'common/lib/ccp';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import module from './ccp.service';

describe('ccp service', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(($httpBackend, envService, ccpService) => {
    self.$httpBackend = $httpBackend;
    self.envService = envService;
    self.ccpService = ccpService;
  }));

  afterEach(function() {
    self.$httpBackend.verifyNoOutstandingExpectation();
    self.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('get', () => {
    it('should use previous Observable if it exists', () => {
      self.ccpService.currentRequest = Observable.of('initialized placeholder');
      self.ccpService.get()
        .subscribe((initializedCcp) => {
          expect(initializedCcp).toEqual('initialized placeholder');
        });
    });
    function testCcpInit(env, url, status, response){
      self.envService.set(env);
      self.$httpBackend.expectGET(url).respond(status, response);
      self.ccpService.get()
        .subscribe((initializedCcp) => {
          expect(initializedCcp).toEqual(ccp);
          expect(self.ccpService.currentRequest).toBeDefined();
          // Test that ccp doesn't throw a key undefined error
          expect((new initializedCcp.CardNumber('4111111111111111')).validate()).toBeNull();
        });

      self.$httpBackend.flush();
    }
    it('should load the production key from the ccp servers', () => {
      testCcpInit('production', 'https://ccp.ccci.org/api/v1/rest/client-encryption-keys/current', 200, ccpKey);
    });
    it('should load the staging key from the ccp servers', () => {
      testCcpInit('staging', 'https://ccpstaging.ccci.org/api/v1/rest/client-encryption-keys/current', 200, ccpStagingKey);
    });
    it('should load the hardcoded backup production key if there is an error fetching it from the ccp servers', () => {
      testCcpInit('production', 'https://ccp.ccci.org/api/v1/rest/client-encryption-keys/current', -1);
    });
    it('should load the hardcoded backup staging key if there is an error fetching it from the ccp servers', () => {
      testCcpInit('staging', 'https://ccpstaging.ccci.org/api/v1/rest/client-encryption-keys/current', -1);
    });
  });
});
