import angular from 'angular';
import uibModal from 'angular-ui-bootstrap/src/modal';
import 'rxjs/add/operator/toPromise';

import productConfigModal from 'app/productConfig/productConfigModal/productConfig.modal.component';
import giveModalWindowTemplate from 'common/templates/giveModalWindow.tpl.html';

const serviceName = 'productModalService';

class ProductModalService {
  /* @ngInject */
  constructor($uibModal) {
    this.$uibModal = $uibModal;
    this.modalOpen = false;
  }

  configureProduct(code, itemConfig, isEdit, uri) {
    if (this.modalOpen) {
      return;
    }
    this.modalOpen = true;
    const modalInstance = this.$uibModal.open({
      component: productConfigModal.name,
      size: 'lg',
      windowTemplateUrl: giveModalWindowTemplate,
      ariaLabelledBy: 'product-config-header',
      resolve: {
        code: () => code,
        itemConfig: () => itemConfig,
        isEdit: () => isEdit,
        uri: () => uri,
      },
    });
    modalInstance.result.finally(() => {
      this.modalOpen = false;
    });
    return modalInstance;
  }
}

export default angular
  .module(serviceName, [uibModal, productConfigModal.name])
  .service(serviceName, ProductModalService);
