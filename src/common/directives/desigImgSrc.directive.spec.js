import angular from 'angular'
import 'angular-mocks'
import module from './desigImgSrc.directive'

describe('desigImgSrc', () => {
  beforeEach(angular.mock.module(module.name))

  beforeEach(angular.mock.module(($provide) => {
    $provide.value('envService', {
      read: () => 'https://domain.com'
    })
  }))

  let $compile, $scope
  beforeEach(() => {
    inject(($injector, $rootScope) => {
      $compile = $injector.get('$compile')
      $scope = $rootScope.$new()
    })
  })

  it('should set the src for pathname', () => {
    const element = $compile('<img desig-img-src="/image.jpg" />')($scope)
    $scope.$digest()
    expect(element.attr('src')).toBe('https://domain.com/image.jpg')
  })

  it('should set the src for blobs', () => {
    const element = $compile('<img desig-img-src="blob:https://example.com/uuid" />')($scope)
    $scope.$digest()
    expect(element.attr('src')).toBe('blob:https://example.com/uuid')
  })
})
