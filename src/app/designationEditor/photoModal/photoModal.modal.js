import angular from 'angular';

let controllerName = 'photoCtrl';

class ModalInstanceCtrl {

  /* @ngInject */
  constructor( envService, designationNumber, photos, photoLocation, selectedPhoto ) {
    this.imgDomainDesignation = envService.read('imgDomainDesignation');

    this.designationNumber = designationNumber;
    this.photoLocation = photoLocation;
    this.selectedPhoto = selectedPhoto;
    this.photos = photos;
  }
}


export default angular
  .module( controllerName, [
    'environment'
  ] )
  .controller( controllerName, ModalInstanceCtrl );
