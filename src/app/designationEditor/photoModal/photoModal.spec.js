import angular from 'angular'
import 'angular-mocks'
import module from './photo.modal'

describe('Designation Editor Photo', function () {
  beforeEach(angular.mock.module(module.name))
  var $rootScope, $ctrl, $q, $timeout

  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _$timeout_) {
    var $scope = _$rootScope_.$new()
    $rootScope = _$rootScope_
    $timeout = _$timeout_
    $q = _$q_

    $ctrl = _$controller_(module.name, {
      designationNumber: '000555',
      campaignPage: '7818',
      photos: [],
      photoLocation: 'coverPhoto',
      selectedPhoto: '/content/photo1.jpg',
      $scope: $scope
    })
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  it('to define modal resolves', function () {
    expect($ctrl.designationNumber).toEqual('000555')
    expect($ctrl.photoLocation).toEqual('coverPhoto')
    expect($ctrl.selectedPhoto).toEqual('/content/photo1.jpg')
    expect($ctrl.photos).toBeDefined()
  })

  it('uploadComplete', function () {
    const getPhotosPromise = $q.defer()
    jest.spyOn($ctrl.designationEditorService, 'getPhotos').mockReturnValue(getPhotosPromise.promise)

    $ctrl.uploadComplete()
    $timeout.flush()

    getPhotosPromise.resolve({ data: [] })
    $rootScope.$digest()

    expect($ctrl.designationEditorService.getPhotos).toHaveBeenCalled()
    expect($ctrl.photos).toEqual([])
  })
})
