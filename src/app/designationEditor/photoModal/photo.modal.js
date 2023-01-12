import angular from 'angular'
import 'angular-upload'

import designationEditorService from 'common/services/api/designationEditor.service'

const controllerName = 'photoCtrl'

class ModalInstanceCtrl {
  /* @ngInject */
  constructor ($timeout, $scope, designationNumber, campaignPage, photos, photoLocation, selectedPhoto, designationEditorService) {
    this.$timeout = $timeout
    this.$scope = $scope
    this.designationEditorService = designationEditorService

    this.MAX_RETRIES = 3

    this.designationNumber = designationNumber
    this.campaignPage = campaignPage
    this.photoLocation = photoLocation
    this.selectedPhoto = selectedPhoto
    this.photos = photos
    this.currentNumberOfPhotos = this.photos.length
    this.desiredNumberOfPhotos = this.currentNumberOfPhotos
    this.intervalTries = 0
    this.maxNumberOfPhotos = 6

    this.$scope.$watch('$ctrl.intervalTries', () => {
      if (this.intervalTries >= this.MAX_RETRIES && this.intervalId) {
        clearInterval(this.intervalId)
      }
    })
  }

  uploadComplete () {
    // refresh photos (set timeout to give Adobe time to add to DAM)
    this.desiredNumberOfPhotos++
    this.intervalTries = 0
    this.$timeout(() => {
      this.designationEditorService.getPhotos(this.designationNumber).then((response) => {
        this.photos = response.data
        this.uploading = false
        this.currentNumberOfPhotos = this.photos.length
        this.intervalId = setInterval(this.queryPhotos, 3500, this)
      }, angular.noop)
    }, 3500)
  }

  queryPhotos (ctrl) {
    if (ctrl.currentNumberOfPhotos && ctrl.desiredNumberOfPhotos) {
      if (ctrl.desiredNumberOfPhotos > ctrl.currentNumberOfPhotos || ctrl.intervalTries < ctrl.MAX_RETRIES) {
        ctrl.designationEditorService.getPhotos(ctrl.designationNumber).then((response) => {
          ctrl.photos = response.data
          ctrl.currentNumberOfPhotos = ctrl.photos.length
          ctrl.intervalTries++
        }, angular.noop)
      } else {
        ctrl.intervalTries++
      }
    }
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
