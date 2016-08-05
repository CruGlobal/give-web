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

  addToCart(){
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

module.exports =  ModalInstanceCtrl;
