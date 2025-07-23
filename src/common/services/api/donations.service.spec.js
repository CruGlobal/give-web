import angular from 'angular';
import 'angular-mocks';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import module from './donations.service';

import RecurringGiftModel from 'common/models/recurringGift.model';

import historicalResponse from './fixtures/cortex-donations-historical.fixture';
import recipientResponse from './fixtures/cortex-donations-recipient.fixture';
import receiptsResponse from './fixtures/cortex-donations-receipts.fixture';
import activeRecurringGiftsResponse from './fixtures/cortex-donations-recurring-gifts-active.fixture';
import cancelledRecurringGiftsResponse from './fixtures/cortex-donations-recurring-gifts-cancelled.fixture';
import multipleRecurringGiftsResponse from './fixtures/cortex-donations-recurring-gifts-multiple.fixture';
import recentRecipientsResponse from './fixtures/cortex-donations-recent-recipients.fixture';
import suggestedRecipientsResponse from './fixtures/cortex-donations-suggested.fixture';

describe('donations service', () => {
  beforeEach(angular.mock.module(module.name));
  let donationsService, profileService, commonService, $httpBackend;

  beforeEach(inject((
    _donationsService_,
    _profileService_,
    _commonService_,
    _$httpBackend_,
  ) => {
    donationsService = _donationsService_;
    profileService = _profileService_;
    commonService = _commonService_;
    $httpBackend = _$httpBackend_;
  }));

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('getRecipients( year )', () => {
    it('should load recent when missing year', () => {
      $httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/donations/historical/crugive/recipient/recent',
        )
        .respond(200, recipientResponse);
      donationsService.getRecipients().subscribe((recipients) => {
        expect(recipients).toEqual(expect.any(Array));
      });
      $httpBackend.flush();
    });

    it('should load recipients by year', () => {
      $httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/donations/historical/crugive/recipient/2015',
        )
        .respond(200, recipientResponse);
      donationsService.getRecipients(2015).subscribe((recipients) => {
        expect(recipients).toEqual(expect.any(Array));
      });
      $httpBackend.flush();
    });
  });

  describe('getReceipts( data )', () => {
    it('should load receipts', () => {
      const response = [
        {
          'designation-names': ['David and Margo Neibling (0105987)'],
          'total-amount': 25,
          'transaction-date': {
            'display-value': '2016-11-16',
            value: 1447632000000,
          },
          'transaction-number': '1-1106420519',
          'pdf-link': {
            rel: 'element',
            rev: 'list',
            type: 'orderId',
            uri: '/receipt/1-1106420519',
            href: 'https://give-stage2.cru.org/cortex/receipt/1-1106420519',
          },
        },
        {
          'designation-names': ['David and Margo Neibling (0105987)'],
          'total-amount': 25,
          'transaction-date': {
            'display-value': '2015-10-15',
            value: 1444867200000,
          },
          'transaction-number': '1-1056130965',
          'pdf-link': {
            rel: 'element',
            rev: 'list',
            type: 'orderId',
            uri: '/receipt/1-1056130965',
            href: 'https://give-stage2.cru.org/cortex/receipt/1-1056130965',
          },
        },
      ];
      $httpBackend
        .expectPOST(
          'https://give-stage2.cru.org/cortex/receipts/form?FollowLocation=true',
        )
        .respond(200, receiptsResponse);
      donationsService.getReceipts({}).subscribe((receipts) => {
        expect(receipts).toEqual(response);
      });
      $httpBackend.flush();
    });
  });

  describe('getRecentRecipients', () => {
    it('should load recent recipients', () => {
      $httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/profiles/crugive/default?zoom=givingdashboard:recentdonations',
        )
        .respond(200, recentRecipientsResponse);
      donationsService.getRecentRecipients().subscribe((recentRecipients) => {
        expect(recentRecipients).toEqual([
          expect.objectContaining({
            'designation-name': 'Brian and Jennifer Richardson (0679537)',
            'designation-number': '0679537',
          }),
          expect.objectContaining({
            'designation-name': 'Steve Lamie (5460173)',
            'designation-number': '5460173',
          }),
        ]);
      });
      $httpBackend.flush();
    });
  });

  describe('getRecurringGifts()', () => {
    let paymentMethod;
    beforeEach(() => {
      paymentMethod = {
        self: {
          type: 'elasticpath.bankaccounts.bank-account',
          uri: '/selfservicepaymentinstruments/crugive/g4ywkyzvgrqtcljymuyweljugizgellbmnsdqljwg5stomrxg5qtqmrumm=',
          href: 'https://give-stage2.cru.org/cortex/selfservicepaymentinstruments/crugive/g4ywkyzvgrqtcljymuyweljugizgellbmnsdqljwg5stomrxg5qtqmrumm=',
        },
        'account-type': 'Savings',
        'bank-name': '2nd Bank',
        description: '2nd Bank - 3456',
        'display-account-number': '3456',
        'encrypted-account-number': '',
        'routing-number': '021000021',
      };
      jest
        .spyOn(profileService, 'getPaymentMethods')
        .mockReturnValue(Observable.of([paymentMethod]));
      jest
        .spyOn(commonService, 'getNextDrawDate')
        .mockReturnValue(Observable.of('2015-06-09'));
    });

    it('should load active recurring gifts', () => {
      $httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/profiles/crugive/default?zoom=givingdashboard:managerecurringdonations',
        )
        .respond(200, activeRecurringGiftsResponse);

      donationsService.getRecurringGifts().subscribe((gifts) => {
        expect(gifts[0].toObject).toEqual({
          amount: 25,
          'designation-name': 'David and Margo Neibling (0105987)',
          'designation-number': '0105987',
          'donation-line-row-id': '1-GVVEB6',
          'donation-line-status': 'Standard',
          'payment-instrument-id':
            'g4ywkyzvgrqtcljymuyweljugizgellbmnsdqljwg5stomrxg5qtqmrumm=',
          'updated-donation-line-status': '',
          'updated-payment-instrument-id': '',
          'updated-rate': { recurrence: { interval: '' } },
          'updated-recurring-day-of-month': '',
          'updated-start-month': '',
          'updated-start-year': '',
          'updated-amount': '',
          'updated-designation-number': '',
        });

        expect(gifts[0].parentDonation).toEqual({
          'donation-lines': expect.any(Array),
          'donation-row-id': '1-GVVEB4',
          'donation-status': 'Active',
          'effective-status': 'Active',
          'next-draw-date': {
            'display-value': '2016-01-15',
            value: 1452816000000,
          },
          rate: { recurrence: { interval: 'Monthly' } },
          'recurring-day-of-month': '15',
          'start-date': { 'display-value': '2015-09-29', value: 1443484800000 },
        });

        expect(gifts[0].paymentMethods).toEqual([paymentMethod]);
        expect(gifts[0].nextDrawDate).toEqual('2015-06-09');
      });
      $httpBackend.flush();
    });

    it('should load cancelled recurring gifts', () => {
      $httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/profiles/crugive/default?zoom=givingdashboard:cancelledrecurringdonations',
        )
        .respond(200, cancelledRecurringGiftsResponse);

      donationsService
        .getRecurringGifts('cancelledrecurringdonations')
        .subscribe((gifts) => {
          expect(gifts[0].toObject).toEqual({
            amount: 45,
            'designation-name': 'Jerry and Pam McCune Jr (0376390)',
            'designation-number': '0376390',
            'donation-line-row-id': '1-400ZBN',
            'donation-line-status': 'Cancelled',
            'payment-instrument-id':
              'g4ywkyzvgrqtcljymuyweljugizgellbmnsdqljwg5stomrxg5qtqmrumm=',
            'updated-donation-line-status': '',
            'updated-payment-instrument-id': '',
            'updated-rate': { recurrence: { interval: '' } },
            'updated-recurring-day-of-month': '',
            'updated-start-month': '',
            'updated-start-year': '',
            'updated-amount': '',
            'updated-designation-number': '',
          });

          expect(gifts[0].parentDonation).toEqual({
            'donation-lines': expect.any(Array),
            'donation-row-id': '1-400ZBL',
            'donation-status': 'Cancelled',
            'effective-status': 'Cancelled',
            'next-draw-date': {
              'display-value': '2016-01-15',
              value: 1452816000000,
            },
            rate: { recurrence: { interval: 'Monthly' } },
            'recurring-day-of-month': '15',
            'start-date': {
              'display-value': '2015-09-29',
              value: 1443484800000,
            },
          });

          expect(gifts[0].paymentMethods).toEqual([paymentMethod]);
          expect(gifts[0].nextDrawDate).toEqual('2015-06-09');
        });
      $httpBackend.flush();
    });

    it('should load active and cancelled recurring gifts', () => {
      $httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/profiles/crugive/default?zoom=givingdashboard:managerecurringdonations,givingdashboard:cancelledrecurringdonations',
        )
        .respond(200, multipleRecurringGiftsResponse);

      donationsService
        .getRecurringGifts([
          'managerecurringdonations',
          'cancelledrecurringdonations',
        ])
        .subscribe((gifts) => {
          expect(gifts.length).toEqual(2);
          expect(gifts[0].toObject['donation-line-status']).toEqual('Standard');
          expect(gifts[1].toObject['donation-line-status']).toEqual(
            'Cancelled',
          );
        });
      $httpBackend.flush();
    });
  });

  describe('updateRecurringGifts', () => {
    let gift;
    beforeEach(() => {
      gift = new RecurringGiftModel(
        {
          amount: 25,
          'designation-name': 'David and Margo Neibling (0105987)',
          'designation-number': '0105987',
          'donation-line-row-id': '1-GVVEB6',
          'donation-line-status': 'Standard',
          'payment-instrument-id':
            'g4ywkyzvgrqtcljymuyweljugizgellbmnsdqljwg5stomrxg5qtqmrumm=',
          'updated-donation-line-status': '',
          'updated-payment-instrument-id': '',
          'updated-rate': { recurrence: { interval: '' } },
          'updated-recurring-day-of-month': '',
          'updated-start-month': '',
          'updated-start-year': '',
        },
        {
          rate: { recurrence: { interval: 'Monthly' } },
          'donation-status': 'Active',
          'effective-status': 'Active',
          'donation-row-id': '1-GVVEB5',
        },
      );
    });

    it('should update a recurring gift', () => {
      $httpBackend
        .expectPUT(
          'https://give-stage2.cru.org/cortex/donations/recurring/crugive/active',
          {
            donations: [
              {
                'donation-lines': [
                  {
                    amount: 25,
                    'designation-name': 'David and Margo Neibling (0105987)',
                    'designation-number': '0105987',
                    'donation-line-row-id': '1-GVVEB6',
                    'donation-line-status': 'Standard',
                    'payment-instrument-id':
                      'g4ywkyzvgrqtcljymuyweljugizgellbmnsdqljwg5stomrxg5qtqmrumm=',
                    'updated-donation-line-status': '',
                    'updated-payment-instrument-id': '',
                    'updated-rate': { recurrence: { interval: '' } },
                    'updated-recurring-day-of-month': '',
                    'updated-start-month': '',
                    'updated-start-year': '',
                    'updated-amount': '',
                    'updated-designation-number': '',
                  },
                ],
                rate: { recurrence: { interval: 'Monthly' } },
                'donation-status': 'Active',
                'effective-status': 'Active',
                'donation-row-id': '1-GVVEB5',
              },
            ],
          },
        )
        .respond(204, {});

      donationsService.updateRecurringGifts(gift).subscribe(() => {});
      $httpBackend.flush();
    });

    it('should update recurring gifts', () => {
      $httpBackend
        .expectPUT(
          'https://give-stage2.cru.org/cortex/donations/recurring/crugive/active',
          {
            donations: [
              {
                'donation-lines': [
                  {
                    amount: 25,
                    'designation-name': 'David and Margo Neibling (0105987)',
                    'designation-number': '0105987',
                    'donation-line-row-id': '1-GVVEB6',
                    'donation-line-status': 'Standard',
                    'payment-instrument-id':
                      'g4ywkyzvgrqtcljymuyweljugizgellbmnsdqljwg5stomrxg5qtqmrumm=',
                    'updated-donation-line-status': '',
                    'updated-payment-instrument-id': '',
                    'updated-rate': { recurrence: { interval: '' } },
                    'updated-recurring-day-of-month': '',
                    'updated-start-month': '',
                    'updated-start-year': '',
                    'updated-amount': '',
                    'updated-designation-number': '',
                  },
                  {
                    amount: 25,
                    'designation-name': 'David and Margo Neibling (0105987)',
                    'designation-number': '0105987',
                    'donation-line-row-id': '1-GVVEB6',
                    'donation-line-status': 'Standard',
                    'payment-instrument-id':
                      'g4ywkyzvgrqtcljymuyweljugizgellbmnsdqljwg5stomrxg5qtqmrumm=',
                    'updated-donation-line-status': '',
                    'updated-payment-instrument-id': '',
                    'updated-rate': { recurrence: { interval: '' } },
                    'updated-recurring-day-of-month': '',
                    'updated-start-month': '',
                    'updated-start-year': '',
                    'updated-amount': '',
                    'updated-designation-number': '',
                  },
                ],
                rate: { recurrence: { interval: 'Monthly' } },
                'donation-status': 'Active',
                'effective-status': 'Active',
                'donation-row-id': '1-GVVEB5',
              },
            ],
          },
        )
        .respond(204, {});

      donationsService.updateRecurringGifts([gift, gift]).subscribe(() => {});
      $httpBackend.flush();
    });
  });

  describe('addRecurringGifts', () => {
    let gift;
    beforeEach(() => {
      gift = new RecurringGiftModel({
        'designation-name': 'David and Margo Neibling (0105987)',
        'designation-number': '0105987',
        'updated-amount': 25,
      });
    });

    it('should update a recurring gift', () => {
      $httpBackend
        .expectPOST(
          'https://give-stage2.cru.org/cortex/donations/recurring/crugive/form',
          {
            'donation-lines': [gift.toObject],
          },
        )
        .respond(204, {});

      donationsService.addRecurringGifts(gift).subscribe(() => {});
      $httpBackend.flush();
    });

    it('should update recurring gifts', () => {
      $httpBackend
        .expectPOST(
          'https://give-stage2.cru.org/cortex/donations/recurring/crugive/form',
          {
            'donation-lines': [gift.toObject, gift.toObject],
          },
        )
        .respond(204, {});

      donationsService.addRecurringGifts([gift, gift]).subscribe(() => {});
      $httpBackend.flush();
    });
  });

  describe('getSuggestedRecipients', () => {
    it('should load suggested recipients', () => {
      $httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/donations/historical/crugive/recipient/suggested?zoom=element,element:definition,element:code',
        )
        .respond(200, suggestedRecipientsResponse);
      donationsService
        .getSuggestedRecipients()
        .subscribe((suggestedRecipients) => {
          expect(suggestedRecipients).toEqual([
            expect.objectContaining({
              'designation-name': 'Steve and Cheryl Bratton',
              'designation-number': '0478064',
            }),
            expect.objectContaining({
              'designation-name': 'Matthew and Katie Watts',
              'designation-number': '0449995',
            }),
            expect.objectContaining({
              'designation-name': 'James and Gail Rohland',
              'designation-number': '0138072',
            }),
            expect.objectContaining({
              'designation-name': 'Aaron and Connie Thomson',
              'designation-number': '0774533',
            }),
            expect.objectContaining({
              'designation-name': 'Red River Region Bridges',
              'designation-number': '2781843',
            }),
          ]);
        });
      $httpBackend.flush();
    });
  });
});
