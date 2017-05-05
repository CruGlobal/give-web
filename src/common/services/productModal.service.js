import angular from 'angular';
import 'angular-ui-bootstrap';
import toFinite from 'lodash/toFinite';
import 'rxjs/add/operator/toPromise';

import designationsService from 'common/services/api/designations.service';
import commonService from 'common/services/api/common.service';
import productConfigModal, {giveGiftParams} from 'app/productConfig/productConfigModal/productConfig.modal.component';
import modalStateService from 'common/services/modalState.service';
import giveModalWindowTemplate from 'common/templates/giveModalWindow.tpl.html';

const serviceName = 'productModalService';

/*@ngInject*/
function ProductModalService( $q, $uibModal, $location, designationsService, commonService, modalStateService ) {
  let modalOpen = false;

  function configureProduct( code, config, isEdit, uri ) {
    if ( modalOpen ) {
      return;
    }
    config = config || {};
    modalOpen = true;
    isEdit = !!isEdit;
    let modalInstance = $uibModal
      .open( {
        component:    productConfigModal.name,
        size:         'lg',
        windowTemplateUrl: giveModalWindowTemplate,
        resolve:      {
          productData: () => {
            return designationsService.productLookup( code ).toPromise($q);
          },
          nextDrawDate: function () {
            return commonService.getNextDrawDate().toPromise($q);
          },
          suggestedAmounts: /*@ngInject*/ function ( $http, $q ) {
            let params = $location.search();
            if ( params.hasOwnProperty( giveGiftParams.campaignPage ) && params[giveGiftParams.campaignPage] !== '' ) {
              config['campaign-page'] = params[giveGiftParams.campaignPage];
            }

            let deferred = $q.defer();
            let c = code.split( '' ).slice( 0, 5 ).join( '/' ),
              path = config['campaign-page'] ?
                `/content/give/us/en/campaigns/${c}/${code}/${config['campaign-page']}.infinity.json` :
                `/content/give/us/en/designations/${c}/${code}.infinity.json`;
            $http.get( path ).then( ( data ) => {
              let suggestedAmounts = [];
              if ( data.data['jcr:content'] ) {
                // Map suggested amounts
                if( data.data['jcr:content'].suggestedAmounts) {
                  angular.forEach( data.data['jcr:content'].suggestedAmounts, ( v, k ) => {
                    if ( toFinite( k ) > 0 ) suggestedAmounts.push( {
                      amount: toFinite( v.amount ),
                      label: v.description,
                      order: k
                    } );
                  } );
                }

                // Copy default-campaign-code to config
                if( data.data['jcr:content'].defaultCampaign && !config['campaign-code'] ) {
                  config['default-campaign-code'] = data.data['jcr:content'].defaultCampaign;
                }

                // Copy jcr:title
                if( data.data['jcr:content']['jcr:title'] ) {
                  config['jcr-title'] = data.data['jcr:content']['jcr:title'];
                }
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
          // Remove all query params except CampaignCode
          if( value !== giveGiftParams.campaignCode ) {
            $location.search(value, null);
          }
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
    modalStateService.name
  ] )
  .factory( serviceName, ProductModalService );
