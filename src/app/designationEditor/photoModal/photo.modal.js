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

    this.maxNumberOfPhotos = 6
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

  addImageToCarousel (photo) {
    if (!this.selectedPhoto || (this.selectedPhoto && this.selectedPhoto.length < this.maxNumberOfPhotos)) {
      this.maxCarouselError = false
      this.selectedPhoto = [...this.selectedPhoto, { url: photo.original }]
    } else {
      // Send an error telling the user that they can only have this.maxNumberOfPhotos photos in the carousel
      this.maxCarouselError = true
    }
  }

  reorderImageInCarousel (index, newIndex) {
    const item = this.selectedPhoto.splice(index, 1)
    this.selectedPhoto.splice(newIndex, 0, ...item)
    this.maxCarouselError = false
  }
}

export default angular
  .module(controllerName, [
    'lr.upload',
    designationEditorService.name
  ])
  .controller(controllerName, ModalInstanceCtrl)
