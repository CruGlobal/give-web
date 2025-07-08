import angular from 'angular';
import 'angular-mocks';
import module from './desigImgSrc.directive';

describe('desigImgSrc', () => {
  beforeEach(angular.mock.module(module.name));

  beforeEach(
    angular.mock.module(($provide) => {
      $provide.value('envService', {
        read: () => 'https://cdn.domain.com',
      });
    }),
  );

  let $compile, $scope, imageCacheService;
  beforeEach(() => {
    inject(($injector, $rootScope) => {
      $scope = $rootScope.$new();
      $compile = $injector.get('$compile');
      imageCacheService = $injector.get('imageCacheService');
    });
  });

  it('should set the src for pathname', () => {
    const element = $compile('<img desig-img-src="/image.jpg" />')($scope);
    $scope.$digest();
    expect(element.attr('src')).toBe('https://cdn.domain.com/image.jpg');
  });

  it('should set the src for cached URLs', () => {
    jest
      .spyOn(imageCacheService, 'get')
      .mockReturnValue('blob:https://domain.com/uuid');

    const element = $compile('<img desig-img-src="/image.jpg" />')($scope);
    $scope.$digest();
    expect(element.attr('src')).toBe('blob:https://domain.com/uuid');
    expect(imageCacheService.get).toHaveBeenCalledWith('/image.jpg');
  });
});
