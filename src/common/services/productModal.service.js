import angular from 'angular';
import 'angular-ui-bootstrap';
import toFinite from 'lodash/toFinite';
import 'rxjs/add/operator/toPromise';

import designationsService from 'common/services/api/designations.service';
import commonService from 'common/services/api/common.service';
import productConfigModal, {giveGiftParams} from 'app/productConfig/productConfigModal/productConfig.modal.component';
import modalStateService from 'common/services/modalState.service';
import giveModalWindowTemplate from 'common/templates/giveModalWindow.tpl';

const serviceName = 'productModalService';

/*@ngInject*/
function ProductModalService( $uibModal, $location, designationsService, commonService, modalStateService ) {
  let modalOpen = false;

  function configureProduct( code, config, isEdit, uri ) {
    if ( modalOpen ) {
      return;
    }
    modalOpen = true;
    isEdit = !!isEdit;
    let modalInstance = $uibModal
      .open( {
        component:    productConfigModal.name,
        size:         'lg',
        windowTemplateUrl: giveModalWindowTemplate.name,
        resolve:      {
          productData: () => {
            return designationsService.productLookup( code ).toPromise();
          },
          nextDrawDate: function () {
            return commonService.getNextDrawDate().toPromise();
          },
          suggestedAmounts: /*@ngInject*/ function ( $http, $q ) {
            let params = $location.search();
            if ( params.hasOwnProperty( giveGiftParams.campaignPage ) ) {
              config['campaign-page'] = params[giveGiftParams.campaignPage];
            }

            let deferred = $q.defer();
            let c = code.split( '' ).slice( 0, 5 ).join( '/' ),
              path = config['campaign-page'] ?
                `/content/give/us/en/campaigns/${c}/${code}/${config['campaign-page']}.infinity.json` :
                `/content/give/us/en/designations/${c}/${code}.infinity.json`;
            $http.get( path ).then( ( data ) => {
              let suggestedAmounts = [];
              if ( data.data['jcr:content'] && data.data['jcr:content'].suggestedAmounts ) {
                angular.forEach( data.data['jcr:content'].suggestedAmounts, ( v, k ) => {
                  if ( toFinite( k ) > 0 ) suggestedAmounts.push( {
                    amount: toFinite( v.amount ),
                    label: v.description,
                    order: k
                  } );
                } );
              }
              deferred.resolve( suggestedAmounts );
            }, () => {
              deferred.resolve( [] );
            } );
            return deferred.promise;
          },
          itemConfig:  () => config,
          isEdit: () => isEdit,
          uri: () => uri
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
    commonService.name,
    designationsService.name,
    productConfigModal.name,
    modalStateService.name,
    giveModalWindowTemplate.name
  ] )
  .factory( serviceName, ProductModalService );
