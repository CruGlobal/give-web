import angular from 'angular';

import indexOf from 'lodash/indexOf';
import range from 'lodash/range';

import designationsService from 'common/services/api/designations.service';
import cartService from 'common/services/api/cart.service';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';

let controllerName = 'productConfigController';

class ModalInstanceCtrl{

  /* @ngInject */
  constructor($uibModalInstance, designationsService, cartService, productData, itemConfig, removingItem) {
    this.$uibModalInstance = $uibModalInstance;
    this.designationsService = designationsService;
    this.cartService = cartService;
    this.productData = productData;
    this.itemConfig = itemConfig;
    this.removingItem = removingItem;

    this.selectableAmounts = [50, 100, 250, 500, 1000, 5000];
    if(this.selectableAmounts.indexOf(itemConfig.amount) === -1){
      this.customAmount = this.itemConfig.amount;
    }
  }

  frequencyOrder(f){
    let order = ['NA', 'MON', 'QUARTERLY', 'ANNUAL'];
    return indexOf(order, f.name);
  }

  changeFrequency(product){
    this.designationsService.productLookup(product.selectAction, true).subscribe((data) => {
      this.productData = data;
    });
    this.productData.frequency = product.name;
  }

  changeAmount(amount){
    this.itemConfig.amount = amount;
    this.customAmount = '';
  }

  addToCart(){
    if(!this.itemConfigForm.$valid){ return; }
    this.submittingGift = true;
    this.giftSubmitted = false;

    this.cartService.addItem(this.productData.id, this.itemConfig)
      .subscribe(() => {
        if(this.removingItem){
          this.$uibModalInstance.close();
        }else{
          this.submittingGift = false;
          this.giftSubmitted = true;
        }
      }, () => {
        this.submittingGift = false;
      });
  }

  daysInMonth(month){
    var daysInMonth = new Date(2001, month, 0).getDate();
    return range(1, daysInMonth + 1).map(function(n){ return n.toString(); });
  }
}

export default angular
  .module(controllerName, [
    loadingOverlay.name,
    designationsService.name,
    cartService.name
  ])
  .controller(controllerName, ModalInstanceCtrl);
