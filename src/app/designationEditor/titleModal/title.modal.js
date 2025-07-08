import angular from 'angular';

const controllerName = 'titleCtrl';

class ModalInstanceCtrl {
  /* @ngInject */
  constructor(receiptTitle, giveTitle) {
    this.receiptTitle = receiptTitle;
    this.giveTitle = giveTitle;
  }
}

export default angular
  .module(controllerName, [])
  .controller(controllerName, ModalInstanceCtrl);
