import angular from 'angular';
import 'angular-mocks';

import module from './common.service';

describe('common service', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject((commonService, $httpBackend) => {
    self.commonService = commonService;
    self.$httpBackend = $httpBackend;
  }));

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation();
    self.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('getNextDrawDate', () => {
    it('should get next draw date', () => {
      self.$httpBackend
        .expectGET('https://give-stage2.cru.org/cortex/nextdrawdate')
        .respond(200, {
          'next-draw-date': {
            chars: '2016-10-01',
            string: '2016-10-01',
            valueType: 'STRING',
          },
        });
      self.commonService.getNextDrawDate().subscribe((date) => {
        expect(date).toEqual('2016-10-01');
      });

      self.$httpBackend.flush();
    });
  });
});
