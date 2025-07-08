import angular from 'angular';
import transform from 'lodash/transform';
import sortBy from 'lodash/sortBy';

const controllerName = 'personalOptionsCtrl';

class ModalInstanceCtrl {
  /* @ngInject */
  constructor(
    $scope,
    designationNumber,
    designationType,
    giveDomain,
    hasNewsletter,
    givingLinks,
    showNewsletterForm,
  ) {
    this.$scope = $scope;
    this.designationNumber = designationNumber;
    this.designationType = designationType;
    this.giveDomain = giveDomain;
    this.showNewsletterForm = showNewsletterForm;
    this.hasNewsletter = hasNewsletter;

    this.givingLinks = transform(
      givingLinks,
      (result, value, key) => {
        if (key === 'jcr:primaryType') {
          return;
        }
        result.push({
          name: value.name,
          url: value.url,
          order: Number(key),
        });
      },
      [],
    );
    this.givingLinks = sortBy(this.givingLinks, 'order');

    this.tab = 'newsletter';
    this.givingLinksAvailable = designationType === 'National Staff';
  }

  transformGivingLinks() {
    return transform(
      this.givingLinks,
      (result, value, i) => {
        delete value.order;
        result[i + 1] = value;
      },
      {},
    );
  }

  saveChanges() {
    this.$scope.$close({
      givingLinks: this.transformGivingLinks(),
      showNewsletterForm: this.showNewsletterForm,
    });
  }
}

export default angular
  .module(controllerName, [])
  .controller(controllerName, ModalInstanceCtrl);
