import angular from 'angular';
import 'angular-upload';

import designationEditorService from 'common/services/api/designationEditor.service';

let controllerName = 'photoCtrl';

class ModalInstanceCtrl {

  /* @ngInject */
  constructor( $timeout, designationNumber, photos, photoLocation, selectedPhoto, designationEditorService ) {
    this.$timeout = $timeout;
    this.designationEditorService = designationEditorService;

    this.designationNumber = designationNumber;
    this.photoLocation = photoLocation;
    this.selectedPhoto = selectedPhoto;
    this.photos = photos;
  }

  uploadComplete() {
    //refresh photos (set timeout to give Adobe time to add to DAM)
    this.$timeout(() => {
      this.designationEditorService.getPhotos(this.designationNumber).then((response) => {
        this.photos = response.data;
      });
    }, 2500);
  }

  // deletePhoto(path){
  //
  // }
}


export default angular
  .module( controllerName, [
    'lr.upload',
    designationEditorService.name
  ] )
  .controller( controllerName, ModalInstanceCtrl );
