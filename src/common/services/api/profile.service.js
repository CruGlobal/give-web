import angular from 'angular';
import formatAddressForTemplate from '../addressHelpers/formatAddressForTemplate';
import pick from 'lodash/pick';
import find from 'lodash/find';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/map';
import sortPaymentMethods from 'common/services/paymentHelpers/paymentMethodSort';

import cortexApiService from '../cortexApi.service';

let serviceName = 'profileService';

class Profile {

  /*@ngInject*/
  constructor( cortexApiService ) {
    this.cortexApiService = cortexApiService;
  }

  getManageGivingProfile() {
    return this.cortexApiService
      .get( {
        path: ['profiles', this.cortexApiService.scope, 'default'],
        zoom: {
          mailingAddress: 'addresses:mailingaddress',
          emailAddress:   'emails:element',
          phoneNumbers:   'phonenumbers:element[]',
          spouse:         'addspousedetails',
          yearToDate:     'givingdashboard:yeartodateamount'
        }
      } )
      .map( ( data ) => {
        let donor = pick( data.rawData, ['family-name', 'given-name'] ),
          spouse = pick( data.spouse, ['given-name'] ),
          phone = find( data.phoneNumbers, {primary: true} );
        return {
          name:       (spouse['given-name']) ?
                        `${donor['given-name']} & ${spouse['given-name']} ${donor['family-name']}` :
                        `${donor['given-name']} ${donor['family-name']}`,
          email:      data.emailAddress.email,
          phone:      phone['phone-number'],
          address:    formatAddressForTemplate( data.mailingAddress.address ),
          yearToDate: data.yearToDate['year-to-date-amount']
        };
      } );
  }

  getEmail() {
    return this.cortexApiService.get( {
      path: ['profiles', this.cortexApiService.scope, 'default'],
      zoom: {
        email: 'emails:element'
      }
    } )
      .pluck( 'email' )
      .pluck( 'email' );
  }

  getPaymentMethods() {
    return this.cortexApiService.get( {
      path: ['profiles', this.cortexApiService.scope, 'default'],
      zoom: {
        paymentMethods: 'paymentmethods:element[]'
      }
    } )
      .pluck( 'paymentMethods' )
      .map( ( paymentMethods ) => {
        return sortPaymentMethods( paymentMethods );
      } );
  }
}

export default angular
  .module( serviceName, [
    cortexApiService.name
  ] )
  .service( serviceName, Profile );
