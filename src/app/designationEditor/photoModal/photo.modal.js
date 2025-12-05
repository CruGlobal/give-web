import angular from 'angular';
import 'angular-environment';

import loading from 'common/components/loading/loading.component';
import imageUploadDirective from 'common/directives/imageUpload.directive';
import designationEditorService from 'common/services/api/designationEditor.service';
import imageCacheService from 'common/services/imageCache.service';
import retryService from 'common/services/retry.service';

const controllerName = 'photoCtrl';

class ModalInstanceCtrl {
  /* @ngInject */
  constructor(
    $timeout,
    $interval,
    $http,
    $q,
    $window,
    designationEditorService,
    envService,
    imageCacheService,
    retryService,
    designationNumber,
    campaignPage,
    photos,
    photoLocation,
    selectedPhoto,
  ) {
    this.$timeout = $timeout;
    this.$interval = $interval;
    this.$http = $http;
    this.$q = $q;
    this.$window = $window;
    this.designationEditorService = designationEditorService;
    this.imageCacheService = imageCacheService;
    this.retryService = retryService;

    this.imgDomain = envService.read('imgDomain');
    // The key is the File, and the value is the blob URL
    // This can't just be a set because URL.createObjectURL(file) creates a new blob URL every
    // time, even when called with the same file
    this.processingPhotos = new Map();
    this.RETRY_DELAY_MS = 3000;
    this.MAX_RETRIES = 20;

    this.designationNumber = designationNumber;
    this.campaignPage = campaignPage;
    this.photoLocation = photoLocation;
    this.selectedPhoto = selectedPhoto;
    this.photos = photos;

    this.maxNumberOfPhotos = 6;
  }

  uploadStart(file) {
    this.uploading = true;

    this.processingPhotos.set(file, URL.createObjectURL(file));
  }

  uploadComplete(response, file) {
    this.uploading = false;

    this.refreshPhotos(
      new URL(response.headers('location'), this.$window.location).pathname,
    )
      .then((photos) => {
        this.photos = photos;
      }, angular.noop)
      .finally(() => {
        this.processingPhotos.delete(file);
      });
  }

  uploadError(file) {
    this.uploading = false;
    this.processingPhotos.delete(file);
  }

  // ng-repeat can only iterate over arrays, not Maps, generate an array of the blob URLs of all currently uploading/processing images
  getProcessingPhotos() {
    return Array.from(this.processingPhotos.values());
  }

  // Attempt to load a recently uploaded photo because newly uploaded photos will 404 for several seconds
  // Rejects if a photo with the `original` URL can't be found
  tryLoadUploadedPhoto(expectedUrl) {
    return this.designationEditorService
      .getPhotos(this.designationNumber)
      .then((response) => {
        const photos = response.data;
        const photo = photos.find((entry) => entry.original === expectedUrl);
        if (!photo) {
          // Not available yet
          return this.$q.reject();
        }

        return {
          expectedPhoto: photo,
          allPhotos: photos,
        };
      });
  }

  // Reload the photos until a photo with the URL `expectedUrl` exists
  refreshPhotos(expectedUrl) {
    // Step 1: Load the photos list until we find a photo with the original URL expectedUrl
    // Step 2: Load the cover, secondary, and thumbnail URLs independently until each of them succeeds once
    return this.executeWithRetries(() =>
      this.tryLoadUploadedPhoto(expectedUrl),
    ).then(({ expectedPhoto, allPhotos }) =>
      this.$q
        .all(
          [
            expectedPhoto.cover,
            expectedPhoto.original,
            expectedPhoto.secondary,
            expectedPhoto.thumbnail,
          ].map((url) => this.imageCacheService.cache(url)),
        )
        .then(() => allPhotos),
    );
  }

  executeWithRetries(execute) {
    return this.retryService.executeWithRetries(
      execute,
      this.MAX_RETRIES,
      this.RETRY_DELAY_MS,
    );
  }

  addImageToCarousel(photo) {
    if (
      !this.selectedPhoto ||
      (this.selectedPhoto && this.selectedPhoto.length < this.maxNumberOfPhotos)
    ) {
      this.maxCarouselError = false;
      this.selectedPhoto = [...this.selectedPhoto, { url: photo.original }];
    } else {
      // Send an error telling the user that they can only have this.maxNumberOfPhotos photos in the carousel
      this.maxCarouselError = true;
    }
  }

  reorderImageInCarousel(index, newIndex) {
    const item = this.selectedPhoto.splice(index, 1);
    this.selectedPhoto.splice(newIndex, 0, ...item);
    this.maxCarouselError = false;
  }

  onComplete() {
    this.invalidFileType = false;
    this.fileTooLarge = false;
  }
}

export default angular
  .module(controllerName, [
    'environment',
    loading.name,
    imageUploadDirective.name,
    designationEditorService.name,
    imageCacheService.name,
    retryService.name,
  ])
  .controller(controllerName, ModalInstanceCtrl);
