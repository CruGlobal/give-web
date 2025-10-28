import angular from 'angular';
import 'angular-mocks';
import module from './photo.modal';

describe('Designation Editor Photo', function () {
  beforeEach(angular.mock.module(module.name));
  let $ctrl, $flushPendingTasks, $q, $verifyNoPendingTasks;

  beforeEach(
    angular.mock.module(($provide) => {
      $provide.value('envService', {
        read: () => 'https://img-domain.com',
      });
    }),
  );

  const file = new File(['contents'], 'file.jpg');
  const file2 = new File(['contents'], 'file.jpg');

  beforeEach(inject(function (
    _$rootScope_,
    _$controller_,
    _$flushPendingTasks_,
    _$q_,
    _$verifyNoPendingTasks_,
  ) {
    const $scope = _$rootScope_.$new();
    $flushPendingTasks = _$flushPendingTasks_;
    $q = _$q_;
    $verifyNoPendingTasks = _$verifyNoPendingTasks_;

    $ctrl = _$controller_(module.name, {
      designationNumber: '000555',
      campaignPage: '7818',
      photos: [],
      photoLocation: 'coverPhoto',
      selectedPhoto: [{ url: '/content/photo1.jpg' }],
      $scope: $scope,
    });

    URL.createObjectURL = jest.fn().mockReturnValue('blob:url');
  }));

  afterEach(() => {
    $verifyNoPendingTasks();
  });

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
  });

  it('to define modal resolves', function () {
    expect($ctrl.designationNumber).toEqual('000555');
    expect($ctrl.photoLocation).toEqual('coverPhoto');
    expect($ctrl.selectedPhoto).toEqual([{ url: '/content/photo1.jpg' }]);
    expect($ctrl.photos).toBeDefined();
  });

  it('uploadStart', function () {
    $ctrl.uploadStart(file);
    expect($ctrl.uploading).toBe(true);
    expect($ctrl.processingPhotos.size).toBe(1);
  });

  it('uploadComplete', function () {
    const photos = [
      {
        original: '/content/photo1.jpg',
      },
      {
        original: '/content/photo2.jpg',
      },
      {
        original: '/content/photo3.jpg',
      },
    ];
    jest.spyOn($ctrl, 'refreshPhotos').mockReturnValueOnce($q.resolve(photos));

    $ctrl.uploadStart(file);
    $ctrl.uploadComplete({ headers: () => '/content/photo3.jpg' }, file);
    $flushPendingTasks();

    expect($ctrl.uploading).toBe(false);
    expect($ctrl.processingPhotos.size).toBe(0);

    expect($ctrl.refreshPhotos).toHaveBeenCalledWith('/content/photo3.jpg');
    expect($ctrl.photos).toBe(photos);
  });

  it('uploadError', function () {
    $ctrl.uploadStart(file);
    $ctrl.uploadError(file);
    expect($ctrl.uploading).toBe(false);
    expect($ctrl.processingPhotos.size).toBe(0);
  });

  it('getProcessingPhotos returns an array of processing photos', () => {
    $ctrl.uploadStart(file);
    $ctrl.uploadStart(file2);
    expect($ctrl.getProcessingPhotos()).toHaveLength(2);
  });

  describe('tryLoadUploadedPhoto', () => {
    beforeEach(() => {
      jest
        .spyOn($ctrl.designationEditorService, 'getPhotos')
        .mockReturnValueOnce(
          $q.resolve({
            data: [
              {
                original: '/content/photo1.jpg',
              },
              {
                original: '/content/photo2.jpg',
              },
            ],
          }),
        );
    });

    it('resolves if the photo is found', () => {
      expect(
        $ctrl.tryLoadUploadedPhoto('/content/photo1.jpg'),
      ).resolves.toEqual({
        expectedPhoto: {
          original: '/content/photo1.jpg',
        },
        allPhotos: [
          {
            original: '/content/photo1.jpg',
          },
          {
            original: '/content/photo2.jpg',
          },
        ],
      });
      $flushPendingTasks();
    });

    it('rejects if the photo is not found', () => {
      expect(
        $ctrl.tryLoadUploadedPhoto('/content/photo3.jpg'),
      ).rejects.toBeUndefined();
      $flushPendingTasks();
    });
  });

  it('refreshPhotos', () => {
    jest.spyOn($ctrl, 'tryLoadUploadedPhoto').mockReturnValueOnce(
      $q.resolve({
        expectedPhoto: {
          original: '/content/photo3.jpg',
          cover: '/content/photo3.cover.jpg',
          secondary: '/content/photo3.secondary.jpg',
          thumbnail: '/content/photo3.thumbnail.jpg',
        },
        allPhotos: [
          {
            original: '/content/photo1.jpg',
          },
          {
            original: '/content/photo2.jpg',
          },
          {
            original: '/content/photo3.jpg',
            cover: '/content/photo3.cover.jpg',
            secondary: '/content/photo3.secondary.jpg',
            thumbnail: '/content/photo3.thumbnail.jpg',
          },
        ],
      }),
    );

    jest
      .spyOn($ctrl.imageCacheService, 'cache')
      .mockImplementation((url) => $q.resolve(`blob:${url}`));

    expect($ctrl.refreshPhotos('/content/photo3.jpg')).resolves.toEqual([
      {
        original: '/content/photo1.jpg',
      },
      {
        original: '/content/photo2.jpg',
      },
      {
        original: '/content/photo3.jpg',
        cover: '/content/photo3.cover.jpg',
        secondary: '/content/photo3.secondary.jpg',
        thumbnail: '/content/photo3.thumbnail.jpg',
      },
    ]);
    $flushPendingTasks();
  });

  describe('addImageToCarousel(photo)', () => {
    it('should add image to carousel', () => {
      $ctrl.addImageToCarousel({ original: '/content/photo2.jpg' });
      expect($ctrl.selectedPhoto).toEqual([
        { url: '/content/photo1.jpg' },
        { url: '/content/photo2.jpg' },
      ]);
    });

    it('should fail to add an image to the carousel if the new image would exceed maximum number of images', () => {
      $ctrl.maxNumberOfPhotos = 1;
      $ctrl.addImageToCarousel({ original: '/content/photo2.jpg' });
      expect($ctrl.maxCarouselError).toEqual(true);
    });
  });

  describe('reorderImageInCarousel(index, newIndex)', () => {
    beforeEach(() => {
      $ctrl.selectedPhoto = [
        { url: '/content/photo1.jpg' },
        { url: '/content/photo2.jpg' },
        { url: '/content/photo3.jpg' },
      ];
    });

    it('reorders higher', () => {
      $ctrl.reorderImageInCarousel(0, 1);
      expect($ctrl.selectedPhoto).toEqual([
        { url: '/content/photo2.jpg' },
        { url: '/content/photo1.jpg' },
        { url: '/content/photo3.jpg' },
      ]);
    });

    it('reorders lower', () => {
      $ctrl.reorderImageInCarousel(2, 0);
      expect($ctrl.selectedPhoto).toEqual([
        { url: '/content/photo3.jpg' },
        { url: '/content/photo1.jpg' },
        { url: '/content/photo2.jpg' },
      ]);
    });
  });
});
