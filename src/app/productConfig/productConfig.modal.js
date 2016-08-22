import indexOf from 'lodash/indexOf';
import range from 'lodash/range';

class ModalInstanceCtrl{

  /* @ngInject */
  constructor($uibModalInstance, designationsService, cartService, productData, itemConfig) {
    this.$uibModalInstance = $uibModalInstance;
    this.designationsService = designationsService;
    this.cartService = cartService;
    this.productData = productData;

    this.itemConfig = itemConfig;

    this.selectableAmounts = [50, 100, 250, 500, 1000, 5000];
    if(this.selectableAmounts.indexOf(itemConfig.amount) === -1){
      this.customAmount = this.itemConfig.amount;
    }
  }

  frequencyOrder(f){
    let order = ['NA', 'MON', 'QUARTERLY', 'ANNUAL', 'SEMIANNUAL'];
    return indexOf(order, f.name);
  }

  changeFrequency(productId){
    this.designationsService.productLookup(productId, true).subscribe((data) => {
      this.productData = data;
    });
  }

  changeAmount(amount){
    this.itemConfig.amount = amount;
    this.customAmount = '';
  }

  addToCart(){
    if(!this.itemConfigForm.$valid){ return; }
    this.cartService.addItem(this.productData.id, this.itemConfig)
      .subscribe(() => {
        this.$uibModalInstance.close();
      });
  }

  daysInMonth(month){
    var daysInMonth = new Date(2001, month, 0).getDate();
    return range(1, daysInMonth + 1);
  }
}

export default ModalInstanceCtrl;
