import angular from 'angular';
import 'angular-bootstrap';
import designationsService from 'common/services/api/designations.service';
import templateModal from 'app/productConfig/productConfigModal.tpl';
import modalController from 'app/productConfig/productConfig.modal';
import {giveGiftParams} from 'app/productConfig/productConfig.modal';

let serviceName = 'productModalService';

/*@ngInject*/
function ProductModalService( $uibModal, $location, designationsService ) {
  let modalOpen = false;

  function configureProduct( code, config, removingItem ) {
    if ( modalOpen ) {
      return;
    }
    modalOpen = true;
    removingItem = !!removingItem;
    let modalInstance = $uibModal
      .open( {
        templateUrl:  templateModal.name,
        controller:   modalController.name,
        controllerAs: '$ctrl',
        size:         'lg give-modal',
        resolve:      {
          productData:  function () {
            return designationsService.productLookup( code ).toPromise();
          },
          itemConfig:   () => config,
          removingItem: () => removingItem
        }
      } );
    modalInstance.result
      .finally( () => {
        modalOpen = false;
        // Clear the modal name and params when the modal closes
        $location.hash( null );
        angular.forEach( giveGiftParams, ( value ) => {
          $location.search( value, null );
        } );
      } );
    return modalInstance;
  }

  return {
    configureProduct: configureProduct
  };
}

export default angular
  .module( serviceName, [
    'ui.bootstrap',
    designationsService.name,
    modalController.name,
    templateModal.name
  ] )
  .factory( serviceName, ProductModalService );
