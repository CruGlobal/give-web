import angular from 'angular';
import 'angular-mocks';
import module from './imageUpload.directive';

const uploadFile = (input, file) => {
  // jsdom doesn't yet support changing an inputs' files because it doesn't let you instantiate a
  // FileList and it doesn't yet support DataTransfer. The easiest way around this to send a change
  // event with `target.files` manually mocked.
  // Reference: https://github.com/jsdom/jsdom/issues/1272
  const event = new Event('change');
  // Use defineProperty because `target` is a getter and can't be set normally
  Object.defineProperty(event, 'target', {
    get: () => ({ files: file ? [file] : [] }),
  });
  input.dispatchEvent(event);
};

describe('imageUpload', () => {
  beforeEach(angular.mock.module(module.name));

  let $httpBackend, $scope, element;
  beforeEach(() => {
    inject(($compile, $injector, $rootScope) => {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenPOST(/^\/upload$/).respond(() => [200, 'Success', {}]);

      $scope = $rootScope.$new();
      $scope.onInvalidFileType = jest.fn();
      $scope.onUpload = jest.fn();
      $scope.onSuccess = jest.fn();
      $scope.onError = jest.fn();
      $scope.onComplete = jest.fn();

      element = $compile(
        '<div class="btn btn-primary btn-upload" image-upload url="/upload" on-invalid-file-type="onInvalidFileType()" on-upload="onUpload()" on-success="onSuccess()" on-error="onError()" on-complete="onComplete()"><button>Upload</button></div>',
      )($scope);
    });
  });

  it('should display input', () => {
    $scope.$digest();
    expect(element.html()).toContain('type="file"');
  });

  it('should set accept', () => {
    $scope.$digest();
    expect(element.find('input').attr('accept')).toEqual(
      'image/jpeg,image/png',
    );
  });

  it('should accept file uploads for JPEG', () => {
    const file = new File(['contents'], 'file.jpg', { type: 'image/jpeg' });
    uploadFile(element.find('input')[0], file);
    $scope.$digest();

    expect($scope.onUpload).toHaveBeenCalled();
  });

  it('should accept file uploads for PNG', () => {
    const file = new File(['contents'], 'file.png', { type: 'image/png' });
    uploadFile(element.find('input')[0], file);
    $scope.$digest();

    expect($scope.onUpload).toHaveBeenCalled();
  });

  it('should ignore null file', () => {
    uploadFile(element.find('input')[0], null);
    $scope.$digest();

    expect($scope.onUpload).not.toHaveBeenCalled();
  });

  it('should reject non-image files', () => {
    const file = new File(['contents'], 'file.txt', { type: 'text/plain' });
    uploadFile(element.find('input')[0], file);
    $scope.$digest();

    expect($scope.onInvalidFileType).toHaveBeenCalled();
    expect($scope.onUpload).not.toHaveBeenCalled();
  });

  it('should reject HEIC files', () => {
    const file = new File(['contents'], 'file.heic', { type: 'image/heic' });
    uploadFile(element.find('input')[0], file);
    $scope.$digest();

    expect($scope.onInvalidFileType).toHaveBeenCalled();
    expect($scope.onUpload).not.toHaveBeenCalled();
  });

  it('should call onSuccess and onComplete', () => {
    const file = new File(['contents'], 'file.png', { type: 'image/png' });
    uploadFile(element.find('input')[0], file);
    $scope.$digest();
    $httpBackend.flush();

    expect($scope.onSuccess).toHaveBeenCalled();
    expect($scope.onComplete).toHaveBeenCalled();
  });

  it('should call onError and onComplete', () => {
    $httpBackend.matchLatestDefinitionEnabled(true);
    $httpBackend.whenPOST(/^\/upload$/).respond(() => [500, 'Error', {}]);

    const file = new File(['contents'], 'file.png', { type: 'image/png' });
    uploadFile(element.find('input')[0], file);
    $scope.$digest();
    $httpBackend.flush();

    expect($scope.onSuccess).not.toHaveBeenCalled();
    expect($scope.onError).toHaveBeenCalled();
    expect($scope.onComplete).toHaveBeenCalled();
  });
});
