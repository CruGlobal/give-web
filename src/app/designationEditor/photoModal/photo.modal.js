import angular from 'angular'
import 'angular-upload'

import designationEditorService from 'common/services/api/designationEditor.service'

const controllerName = 'photoCtrl'

class ModalInstanceCtrl {
  /* @ngInject */
  constructor ($timeout, designationNumber, campaignPage, photos, photoLocation, selectedPhoto, designationEditorService) {
    this.$timeout = $timeout
    this.designationEditorService = designationEditorService

    this.designationNumber = designationNumber
    this.campaignPage = campaignPage
    this.photoLocation = photoLocation
    this.selectedPhoto = selectedPhoto
    this.photos = photos
    this.trash = []
  }

  uploadComplete () {
    // refresh photos (set timeout to give Adobe time to add to DAM)
    this.$timeout(() => {
      this.designationEditorService.getPhotos(this.designationNumber).then((response) => {
        this.photos = response.data
        this.uploading = false
      }, angular.noop)
    }, 3500)
  }

  dropCallback(index, item, external, type) {
    if (type === 'secondaryphoto') {
      return item;
    }
  }
}

export default angular
  .module(controllerName, [
    'lr.upload',
    designationEditorService.name
  ])
  .controller(controllerName, ModalInstanceCtrl)
