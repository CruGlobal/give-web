import angular from 'angular';
import 'angular-mocks';
import module from './cortexApi.service';

describe('cortex api service', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function (cortexApiService, $httpBackend) {
    self.cortexApiService = cortexApiService;
    self.$httpBackend = $httpBackend;
  }));

  afterEach(function () {
    self.$httpBackend.verifyNoOutstandingExpectation();
    self.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('http', () => {
    it('should send a simple request', () => {
      self.$httpBackend
        .expectGET('https://give-stage2.cru.org/cortex/test')
        .respond(200, 'success');
      self.cortexApiService
        .http({
          method: 'GET',
          path: 'test',
        })
        .subscribe((data) => {
          expect(data).toEqual('success');
        });
      self.$httpBackend.flush();
    });

    it('should send a request with params', () => {
      self.$httpBackend
        .expectGET('https://give-stage2.cru.org/cortex/test?one=1&two=2')
        .respond(200, 'success');
      self.cortexApiService
        .http({
          method: 'GET',
          path: 'test',
          params: {
            one: 1,
            two: 2,
          },
        })
        .subscribe((data) => {
          expect(data).toEqual('success');
        });
      self.$httpBackend.flush();
    });

    it('should set the followLocation param if it is set in the config', () => {
      self.$httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/test?FollowLocation=true',
        )
        .respond(200, 'success');
      self.cortexApiService
        .http({
          method: 'GET',
          path: 'test',
          followLocation: true,
        })
        .subscribe((data) => {
          expect(data).toEqual('success');
        });
      self.$httpBackend.flush();
    });

    it('should send the data specified in the config', () => {
      self.$httpBackend
        .expectPOST('https://give-stage2.cru.org/cortex/test', 'testData')
        .respond(200, 'success');
      self.cortexApiService
        .http({
          method: 'POST',
          path: 'test',
          data: 'testData',
        })
        .subscribe((data) => {
          expect(data).toEqual('success');
        });
      self.$httpBackend.flush();
    });

    it('should throw an error if path is empty', () => {
      self.cortexApiService
        .http({
          method: 'POST',
          path: '',
          data: 'testData',
        })
        .subscribe(
          () => {
            fail();
          },
          (error) => {
            expect(error).toEqual(
              'The requested path is empty. cortexApiService is unable to send the request.',
            );
            expect(self.cortexApiService.$log.error.logs[0]).toEqual([
              'The requested path is empty. cortexApiService is unable to send the request.',
            ]);
          },
        );
    });

    describe('zoom config object', () => {
      it('should extract the data objects specified by the zoom values and place them as a keys in the response object', () => {
        const testResponse = {
          _firstlevel: [
            {
              _secondlevel: [
                {
                  dataKey: 'dataValue',
                },
              ],
            },
          ],
        };

        self.$httpBackend
          .expectGET(
            'https://give-stage2.cru.org/cortex/test?zoom=firstlevel:secondlevel',
          )
          .respond(200, testResponse);
        self.cortexApiService
          .http({
            method: 'GET',
            path: 'test',
            zoom: {
              nestedData: 'firstlevel:secondlevel',
            },
          })
          .subscribe((data) => {
            expect(data).toEqual({
              nestedData: {
                dataKey: 'dataValue',
              },
              rawData: testResponse,
            });
          });
        self.$httpBackend.flush();
      });
    });
  });

  describe('get', () => {
    it('should send a simple GET request', () => {
      self.$httpBackend
        .expectGET('https://give-stage2.cru.org/cortex/test')
        .respond(200, 'success');
      self.cortexApiService
        .get({
          path: 'test',
        })
        .subscribe((data) => {
          expect(data).toEqual('success');
        });
      self.$httpBackend.flush();
    });
  });

  describe('post', () => {
    it('should send a simple POST request', () => {
      self.$httpBackend
        .expectPOST('https://give-stage2.cru.org/cortex/test')
        .respond(200, 'success');
      self.cortexApiService
        .post({
          path: 'test',
        })
        .subscribe((data) => {
          expect(data).toEqual('success');
        });
      self.$httpBackend.flush();
    });
  });

  describe('put', () => {
    it('should send a simple PUT request', () => {
      self.$httpBackend
        .expectPUT('https://give-stage2.cru.org/cortex/test')
        .respond(200, 'success');
      self.cortexApiService
        .put({
          path: 'test',
        })
        .subscribe((data) => {
          expect(data).toEqual('success');
        });
      self.$httpBackend.flush();
    });
  });

  describe('delete', () => {
    it('should send a simple DELETE request', () => {
      self.$httpBackend
        .expectDELETE('https://give-stage2.cru.org/cortex/test')
        .respond(200, 'success');
      self.cortexApiService
        .delete({
          path: 'test',
        })
        .subscribe((data) => {
          expect(data).toEqual('success');
        });
      self.$httpBackend.flush();
    });
  });

  describe('serializePath', () => {
    it("should take an array of strings and join them with slashes and prepend a slash if the first item doesn't have one", () => {
      expect(
        self.cortexApiService.serializePath(['one', 'two', 'three']),
      ).toEqual('/one/two/three');
    });

    it('should take an array of strings and join them with slashes and not prepend a slash if the first item has one', () => {
      expect(
        self.cortexApiService.serializePath(['/one', 'two', 'three']),
      ).toEqual('/one/two/three');
    });

    it("should take a string and prepend a slash to the front if it doesn't exist", () => {
      expect(self.cortexApiService.serializePath('one/two/three')).toEqual(
        '/one/two/three',
      );
    });

    it('should take a string return it if it already starts with a slash', () => {
      expect(self.cortexApiService.serializePath('/one/two/three')).toEqual(
        '/one/two/three',
      );
    });
  });
});
