import angular from 'angular';

import cortexApiService from '../cortexApi.service';

let serviceName = 'purchasesService';

class Purchases{

  /*@ngInject*/
  constructor(cortexApiService){
    this.cortexApiService = cortexApiService;
  }

  getPurchase(uri){
    return this.cortexApiService.get({
        path: uri,
        zoom: {
          donorDetails: 'donordetails',
          paymentMeans: 'paymentmeans:element',
          lineItems: 'lineitems:element[],lineitems:element:code,lineitems:element:rate',
          rateTotals: 'ratetotals:element[]'
        }
      });
  }
}

export default angular
  .module(serviceName, [
    cortexApiService.name
  ])
  .service(serviceName, Purchases);
