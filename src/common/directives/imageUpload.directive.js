import angular from 'angular';

const directiveName = 'imageUpload';

// Based on https://github.com/leon/angular-upload
// Fixes bug where even if accept is "image/*", you could still drag-and-drop non-image files onto the upload button
const imageUpload = /* @ngInject */ ($http) => ({
  restrict: 'EA',
  scope: {
    url: '@',
    onInvalidFileType: '&',
    onUpload: '&',
    onSuccess: '&',
    onError: '&',
    onComplete: '&',
  },
  link: (scope, element) => {
    const validMimeTypes = ['image/jpeg', 'image/png'];

    const el = angular.element(element);
    const fileInput = angular.element(
      `<input type="file" accept="${validMimeTypes.join(',')}" />`,
    );
    el.append(fileInput);

    fileInput.on('change', (event) => {
      const files = event.target.files;
      const file = files[0];
      if (!file) {
        return;
      }

      if (!validMimeTypes.includes(file.type)) {
        // Clear the selected file because it's not a valid image
        event.target.value = null;
        scope.$apply(() => {
          scope.onInvalidFileType();
        });
        return;
      }

      scope.$apply(() => {
        scope.onUpload({ file });
      });

      const formData = new FormData();
      formData.append('file', file);
      $http({
        url: scope.url,
        method: 'POST',
        headers: {
          // Allow the browser to automatically determine the content type
          'Content-Type': undefined,
        },
        data: formData,
      })
        .then((response) => {
          scope.onSuccess({ response, file });
          scope.onComplete({ response, file });
        })
        .catch((response) => {
          scope.onError({ response, file });
          scope.onComplete({ response, file });
        });
    });
  },
});

export default angular
  .module(directiveName, [])
  .directive(directiveName, imageUpload);
