import angular from 'angular';
import transform from 'lodash/transform';

let controllerName = 'pageOptionsCtrl';

class ModalInstanceCtrl {

  /* @ngInject */
  constructor( parentDesignationNumber, organizationId, suggestedAmounts ) {
    this.parentDesignationNumber = parentDesignationNumber;
    this.organizationId = organizationId;

    this.suggestedAmounts = transform(suggestedAmounts, function(result, value, key) {
      if(key === 'jcr:primaryType'){ return; }
      result.push({
        amount: Number(key),
        description: value
      });
    }, []);
  }

  transformSuggestedAmounts(){
    return transform(this.suggestedAmounts, function(result, n) {
      result[n.amount] = n.description;
    }, {});
  }
}


export default angular
  .module( controllerName, [
  ] )
  .controller( controllerName, ModalInstanceCtrl );
