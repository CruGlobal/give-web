import angular from 'angular';
import map from 'lodash/map';
import flatMap from 'lodash/flatMap';
import groupBy from 'lodash/groupBy';
import zipObject from 'lodash/zipObject';
import flatten from 'lodash/flatten';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/map';

import cortexApiService from '../cortexApi.service';
import profileService from './profile.service';
import commonService from './common.service';
import RecurringGiftModel from 'common/models/recurringGift.model';

import filter from 'lodash/filter';

const serviceName = 'donationsService';

export const RecurringGiftsType = {
  active: 'managerecurringdonations',
  hold: 'onholdrecurringdonations',
  suspended: 'restartrecurringdonations',
  errored: 'erroredrecurringdonations',
  future: 'futurerecurringdonations',
  cancelled: 'cancelledrecurringdonations',
};

const DonationsService = /* @ngInject */ function (
  cortexApiService,
  profileService,
  commonService,
) {
  function getRecipients(year) {
    const path = [
      'donations',
      'historical',
      cortexApiService.scope,
      'recipient',
    ];
    path.push(angular.isDefined(year) ? year : 'recent');

    return cortexApiService
      .get({
        path: path,
      })
      .map((response) => {
        return response['donation-summaries'];
      });
  }

  function getRecipientsRecurringGifts(link) {
    return cortexApiService.get({
      path: link.uri,
    });
  }

  function getReceipts(data) {
    return cortexApiService
      .post({
        path: '/receipts/form',
        followLocation: true,
        data: data,
      })
      .map((response) => {
        const links = filter(response.links, (link) => {
          return link.rel === 'element';
        });
        for (let i = 0; i < links.length; i++) {
          response['receipt-summaries'][i]['pdf-link'] = links[i];
        }
        return response;
      })
      .pluck('receipt-summaries');
  }

  function getRecentRecipients() {
    return cortexApiService
      .get({
        path: ['profiles', cortexApiService.scope, 'default'],
        zoom: {
          recentGifts: 'givingdashboard:recentdonations',
        },
        cache: true,
      })
      .pluck('recentGifts')
      .pluck('donation-summaries');
  }

  function getRecurringGifts(recurringGiftsTypes, withoutExtraData) {
    recurringGiftsTypes = angular.isUndefined(recurringGiftsTypes)
      ? [RecurringGiftsType.active]
      : recurringGiftsTypes;
    recurringGiftsTypes = angular.isArray(recurringGiftsTypes)
      ? recurringGiftsTypes
      : [recurringGiftsTypes];

    const requests = [
      cortexApiService.get({
        path: ['profiles', cortexApiService.scope, 'default'],
        zoom: zipObject(
          recurringGiftsTypes,
          map(recurringGiftsTypes, (type) => `givingdashboard:${type}`),
        ),
      }),
    ];
    if (!withoutExtraData) {
      requests.push(commonService.getNextDrawDate());
      requests.push(profileService.getPaymentMethods());
    }
    return Observable.forkJoin(requests).map(
      ([data, nextDrawDate, paymentMethods]) => {
        if (!withoutExtraData) {
          RecurringGiftModel.nextDrawDate = nextDrawDate;
          RecurringGiftModel.paymentMethods = paymentMethods;
        }
        return flatMap(
          flatten(map(recurringGiftsTypes, (type) => data[type].donations)),
          (donation) => {
            return map(donation['donation-lines'], (donationLine) => {
              return new RecurringGiftModel(donationLine, donation);
            });
          },
        );
      },
    );
  }

  function updateRecurringGifts(gifts) {
    gifts = angular.isArray(gifts) ? gifts : [gifts];
    const groupedGifts = groupBy(gifts, 'parentDonation["donation-row-id"]');
    const donations = map(groupedGifts, (lines, donationId) => {
      return {
        'donation-lines': map(lines, 'toObject'),
        'donation-status': lines[0].parentDonation['donation-status'],
        'effective-status': lines[0].parentDonation['effective-status'],
        rate: lines[0].parentDonation.rate,
        'donation-row-id': donationId,
      };
    });
    return cortexApiService.put({
      path: ['donations', 'recurring', cortexApiService.scope, 'active'],
      data: {
        donations: donations,
      },
    });
  }

  function addRecurringGifts(gifts) {
    gifts = angular.isArray(gifts) ? gifts : [gifts];
    return cortexApiService.post({
      path: ['donations', 'recurring', cortexApiService.scope, 'form'],
      data: {
        'donation-lines': map(gifts, 'toObject'),
      },
    });
  }

  function getSuggestedRecipients() {
    return cortexApiService
      .get({
        path: [
          'donations',
          'historical',
          cortexApiService.scope,
          'recipient',
          'suggested',
        ],
        zoom: {
          recipients: 'element[],element:definition,element:code',
        },
      })
      .map((response) => {
        return map(response.recipients, (recipient) => {
          return {
            'designation-name': recipient.definition['display-name'],
            'designation-number': recipient.code.code,
          };
        });
      });
  }

  return {
    getRecipients: getRecipients,
    getRecipientsRecurringGifts: getRecipientsRecurringGifts,
    getReceipts: getReceipts,
    getRecentRecipients: getRecentRecipients,
    getRecurringGifts: getRecurringGifts,
    updateRecurringGifts: updateRecurringGifts,
    addRecurringGifts: addRecurringGifts,
    getSuggestedRecipients: getSuggestedRecipients,
  };
};

export default angular
  .module(serviceName, [
    cortexApiService.name,
    profileService.name,
    commonService.name,
  ])
  .factory(serviceName, DonationsService);
