import angular from 'angular';
import 'angular-mocks';
import module from './api.service';

describe('api service', function() {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function(api, $httpBackend) {
    self.api = api;
    self.$httpBackend = $httpBackend;
  }));

  describe('http', function() {
    it('should send a simple request', function() {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/test').respond(200, 'success');
      self.api.http({
        method: 'GET',
        path: 'test'
      }).then((response) => {
        expect(response.data).toEqual('success');
      });
      self.$httpBackend.flush();
    });
  });
});
