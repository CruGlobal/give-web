import angular from 'angular';
import donationsService from 'common/services/api/donations.service';
import recipientGift from './recipientGift/recipientGift.component';
import template from './recipientView.tpl.html';

const componentName = 'recipientView';

class RecipientView {
  /* @ngInject */
  constructor($log, donationsService) {
    this.donationsService = donationsService;
    this.$log = $log;
  }

  $onChanges(changes) {
    if (
      changes.filter ||
      (changes.reload && changes.reload.currentValue === true)
    ) {
      /* eslint-disable-line no-mixed-operators */ this.loadRecipients(
        this.filter === 'recent' ? undefined : this.filter,
      );
    }
  }

  loadRecipients(year) {
    this.loadingRecipientsError = false;
    this.setLoading({ loading: true });
    this.recipients = undefined;
    if (angular.isDefined(this.subscriber)) this.subscriber.unsubscribe();
    this.subscriber = this.donationsService.getRecipients(year).subscribe(
      (recipients) => {
        delete this.subscriber;
        this.recipients = recipients || [];
        this.setLoading({ loading: false });

        // get recurring donation for each recipient
        angular.forEach(recipients, (recipient) => {
          this.donationsService
            .getRecipientsRecurringGifts(recipient['recurring-donations-link'])
            .subscribe((donations) => {
              recipient['recurring-donations'] = donations;
            });
        });
      },
      (error) => {
        delete this.subscriber;
        this.setLoading({ loading: false });
        this.loadingRecipientsError = true;
        this.$log.error('Error loading recipients', error);
      },
    );
  }
}

export default angular
  .module(componentName, [donationsService.name, recipientGift.name])
  .component(componentName, {
    controller: RecipientView,
    templateUrl: template,
    bindings: {
      filter: '<',
      reload: '<',
      setLoading: '&',
    },
  });
