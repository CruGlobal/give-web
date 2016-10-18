import angular from 'angular';
import 'angular-ui-bootstrap';
import designationsService from 'common/services/api/designations.service';
import giftDatesService from 'common/services/giftHelpers/giftDates.service';
import templateModal from 'app/productConfig/productConfigModal.tpl';
import modalController from 'app/productConfig/productConfig.modal';
import modalStateService from 'common/services/modalState.service';
import {giveGiftParams} from 'app/productConfig/productConfig.modal';

let serviceName = 'productModalService';

/*@ngInject*/
function ProductModalService( $uibModal, $location, designationsService, giftDatesService, modalStateService ) {
  let modalOpen = false;

  function configureProduct( code, config, isEdit ) {
    if ( modalOpen ) {
      return;
    }
    modalOpen = true;
    isEdit = !!isEdit;
    let modalInstance = $uibModal
      .open( {
        templateUrl:  templateModal.name,
        controller:   modalController.name,
        controllerAs: '$ctrl',
        size:         'lg give-modal',
        resolve:      {
          productData: function () {
            return designationsService.productLookup( code ).toPromise();
          },
          nextDrawDate: function(){
            return giftDatesService.getNextDrawDate().toPromise();
          },
          itemConfig:  () => config,
          isEdit:      () => isEdit
        }
      } );
    modalInstance.result
      .finally( () => {
        modalOpen = false;
        // Clear the modal name and params when the modal closes
        modalStateService.name( null );
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
    giftDatesService.name,
    modalController.name,
    modalStateService.name,
    templateModal.name
  ] )
  .factory( serviceName, ProductModalService );
