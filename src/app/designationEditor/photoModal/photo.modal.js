import angular from 'angular';
import 'angular-upload';

let controllerName = 'photoCtrl';

class ModalInstanceCtrl {

  /* @ngInject */
  constructor( designationNumber, campaignPage, photos, photoLocation, selectedPhoto ) {
    this.designationNumber = designationNumber;
    this.campaignPage = campaignPage;
    this.photoLocation = photoLocation;
    this.selectedPhoto = selectedPhoto;
    this.photos = photos;
  }

  uploadComplete(response) {
    this.photos = response.data;
    this.uploading = false;
  }
}


export default angular
  .module( controllerName, [
    'lr.upload'
  ] )
  .controller( controllerName, ModalInstanceCtrl );
