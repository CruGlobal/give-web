import angular from 'angular';
import 'angular-ui-bootstrap';
import 'rxjs/add/operator/toPromise';

import productConfigModal from 'app/productConfig/productConfigModal/productConfig.modal.component';
import giveModalWindowTemplate from 'ngtemplate-loader?relativeTo=src!common/templates/giveModalWindow.tpl.html';

const serviceName = 'productModalService';

class ProductModalService {

  /*@ngInject*/
  constructor( $uibModal ){
    this.$uibModal = $uibModal;
    this.modalOpen = false;
  }

  configureProduct( code, itemConfig, isEdit, uri ) {
    if ( this.modalOpen ) {
      return;
    }
    this.modalOpen = true;
    let modalInstance = this.$uibModal
      .open( {
        component:    productConfigModal.name,
        size:         'lg',
        windowTemplateUrl: giveModalWindowTemplate,
        resolve:      {
          code: () => code,
          itemConfig:  () => itemConfig,
          isEdit: () => isEdit,
          uri: () => uri
        }
      } );
    modalInstance.result
      .finally( () => {
        this.modalOpen = false;
      } );
    return modalInstance;
  }
}

export default angular
  .module( serviceName, [
    'ui.bootstrap',
    productConfigModal.name
  ] )
  .service( serviceName, ProductModalService );
