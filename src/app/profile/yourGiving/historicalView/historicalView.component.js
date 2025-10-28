import angular from 'angular';
import historicalGift from './historicalGift/historicalGift.component';
import donationsService from 'common/services/api/donations.service';
import profileService from 'common/services/api/profile.service';
import template from './historicalView.tpl.html';
import moment from 'moment';
import cloneDeep from 'lodash/cloneDeep';

const componentName = 'historicalView';

class HistoricalView {
  /* @ngInject */
  constructor($log, donationsService, profileService) {
    this.$log = $log;
    this.donationsService = donationsService;
    this.profileService = profileService;
  }

  $onChanges(changes) {
    if (
      changes &&
      (changes.year ||
        changes.month ||
        (changes.reload && changes.reload.currentValue === true))
    ) {
      /* eslint-disable-line no-mixed-operators */ this.loadGifts(
        this.year,
        this.month.month,
      );
    }
  }

  loadGifts(year, month) {
    this.loadingGiftsError = false;
    this.setLoading({ loading: true });
    this.historicalGifts = undefined;
    if (angular.isDefined(this.subscriber)) {
      this.subscriber.unsubscribe();
    }
    const yearToQuery = this.isRecent(year, month) ? 'recent' : year;
    this.subscriber = this.donationsService
      .getRecipients(yearToQuery)
      .subscribe(
        (historicalGifts) => {
          delete this.subscriber;
          this.historicalGifts =
            this.parseHistoricalGifts(historicalGifts, year, month) || [];
          this.setLoading({ loading: false });
        },
        (error) => {
          delete this.subscriber;
          this.setLoading({ loading: false });
          this.$log.error('Error loading historical gifts', error);
          this.loadingGiftsError = true;
        },
      );
  }

  isRecent(year, month) {
    const today = moment();
    const queryDate = moment(`${year}/${month}/01`, 'YYYY/MM/DD');
    return today.diff(queryDate, 'months', true) <= 3;
  }

  parseHistoricalGifts(historicalGifts, year, month) {
    if (!historicalGifts.length || !historicalGifts[0].donations) {
      return historicalGifts;
    }

    const filteredGifts = cloneDeep(historicalGifts).filter(
      (historicalGift) => {
        historicalGift.donations = historicalGift.donations.filter(
          (donation) => {
            const transactionDate =
              donation['historical-donation-line']['transaction-date'];
            const momentDate = moment(
              transactionDate['display-value'],
              'YYYY/MM/DD',
            );

            return (
              momentDate.year() === year && momentDate.month() + 1 === month
            );
          },
        );
        return historicalGift.donations.length > 0;
      },
    );

    return filteredGifts.flatMap((donationSummary) => {
      donationSummary.donations.forEach((donation) => {
        const paymentInstrumentLinkUri =
          donation['payment-instrument-link'] &&
          donation['payment-instrument-link'].uri;
        if (paymentInstrumentLinkUri) {
          this.profileService
            .getPaymentMethod(paymentInstrumentLinkUri, true)
            .subscribe(
              (paymentMethod) => {
                donation.paymentmethod = paymentMethod;
              },
              (error) => {
                this.$log.error(
                  `Failed to load payment instrument at ${paymentInstrumentLinkUri}`,
                  error,
                );
              },
            );
        }

        const recurringDonationLink =
          donationSummary['recurring-donations-link'];
        if (recurringDonationLink) {
          this.donationsService
            .getRecipientsRecurringGifts(recurringDonationLink)
            .subscribe((recurringGifts) => {
              donation.recurringdonation = recurringGifts.donations
                ? recurringGifts.donations[0]
                : undefined;
            });
        }
      });
      return donationSummary.donations;
    });
  }
}
export default angular
  .module(componentName, [
    historicalGift.name,
    donationsService.name,
    profileService.name,
  ])
  .component(componentName, {
    controller: HistoricalView,
    templateUrl: template,
    bindings: {
      year: '<',
      month: '<',
      reload: '<',
      setLoading: '&',
      onManageGift: '&',
    },
  });
