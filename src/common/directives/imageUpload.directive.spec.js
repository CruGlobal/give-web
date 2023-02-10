import angular from 'angular'
import 'angular-mocks'
import module from './imageUpload.directive'

describe('imageUpload', () => {
  beforeEach(angular.mock.module(module.name))
  let $compile, $rootScope;

  beforeEach(() => {
    inject( ($injector) =>{
      $compile = $injector.get('$compile');
      $rootScope = $injector.get('$rootScope');
    });
  });

  it('should display input', () => {
    const element = $compile('<div class="btn btn-primary btn-upload" image-upload><button>Upload</button></div>')($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain('type="file"');
  });

  it('should set accept', () => {
    const element = $compile('<div class="btn btn-primary btn-upload" image-upload><button>Upload</button></div>')($rootScope);
    $rootScope.$digest();
    expect(element.find('input').attr('accept')).toEqual('image/jpeg,image/png');
  });
});
