import angular from 'angular';
import 'angular-mocks';
import module from './imageCache.service';

describe('imageCacheService', () => {
  beforeEach(angular.mock.module(module.name));

  beforeEach(
    angular.mock.module(($provide) => {
      $provide.value('envService', {
        read: () => 'https://cdn.domain.com',
      });
    }),
  );

  let $flushPendingTasks,
    $httpBackend,
    $q,
    $verifyNoPendingTasks,
    imageCacheService;
  beforeEach(() => {
    inject(($injector) => {
      $flushPendingTasks = $injector.get('$flushPendingTasks');
      $httpBackend = $injector.get('$httpBackend');
      $q = $injector.get('$q');
      $verifyNoPendingTasks = $injector.get('$verifyNoPendingTasks');
      imageCacheService = $injector.get('imageCacheService');
    });

    $httpBackend
      .whenGET('https://cdn.domain.com/content/photo1.jpg')
      .respond(200, 'content');

    URL.createObjectURL = jest.fn().mockReturnValue('blob:url');
  });

  afterEach(() => {
    $verifyNoPendingTasks();
  });

  it('loads a photo URL as a blob', () => {
    expect(imageCacheService.cache('/content/photo1.jpg')).resolves.toBe(
      'blob:url',
    );
    $httpBackend.flush();
    $flushPendingTasks();

    expect(URL.createObjectURL).toHaveBeenCalledWith('content');
  });

  it('retrieves cached photos', () => {
    imageCacheService.cache('/content/photo1.jpg');
    $httpBackend.flush();
    $flushPendingTasks();

    expect(imageCacheService.get('/content/photo1.jpg')).toBe('blob:url');
    expect(imageCacheService.get('/content/photo2.jpg')).toBe(
      'https://cdn.domain.com/content/photo2.jpg',
    );
  });
});
