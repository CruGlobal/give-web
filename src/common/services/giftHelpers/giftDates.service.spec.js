import angular from 'angular';
import 'angular-mocks';


import module from './giftDates.service';

describe('giftDates service', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject((giftDatesService, $httpBackend) => {
    self.giftDatesService = giftDatesService;
    self.$httpBackend = $httpBackend;
  }));

  afterEach(() => {
    self.$httpBackend.verifyNoOutstandingExpectation();
    self.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('possibleTransactionDays', () => {
    it('should calculate gift start date', () => {
      expect(self.giftDatesService.possibleTransactionDays()).toEqual([
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
        '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
        '21', '22', '23', '24', '25', '26', '27', '28'
      ]);
    });
  });

  describe('getNextDrawDate', () => {
    it('should get next draw date', () => {
      self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/nextdrawdate')
        .respond(200, {"next-draw-date": "2016-10-01"});
      self.giftDatesService.getNextDrawDate().subscribe(date => {
        expect(date).toEqual('2016-10-01');
      });

      self.$httpBackend.flush();
    });
  });

  describe('startDate', () => {
    it('should calculate gift start date', () => {
      expect(self.giftDatesService.startDate('10', '2017-01-02')).toEqual(new Date(2017, 0, 10));
      expect(self.giftDatesService.startDate('1', '2017-01-02')).toEqual(new Date(2017, 1, 1));
    });
  });
});
