import angular from 'angular';

let controllerName = 'pageOptionsCtrl';

class ModalInstanceCtrl {

  /* @ngInject */
  constructor( parentDesignationNumber, organizationId, suggestedAmounts ) {
    this.parentDesignationNumber = parentDesignationNumber;
    this.organizationId = organizationId;
    this.suggestedAmounts = suggestedAmounts;
  }
}


export default angular
  .module( controllerName, [
  ] )
  .controller( controllerName, ModalInstanceCtrl );
