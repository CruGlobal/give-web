import angular from 'angular';
import 'angular-mocks';

import module from './designationEditor.service';
import designationConstants from './designationEditor.constants';

describe('donation editor service', () => {
  beforeEach(angular.mock.module(module.name));
  let designationEditorService;
  let $httpBackend;
  const designationNumber = '000555';

  beforeEach(inject((_designationEditorService_, _$httpBackend_) => {
    designationEditorService = _designationEditorService_;
    $httpBackend = _$httpBackend_;
  }));

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should return success if user has permission to edit', () => {
    $httpBackend
      .expectHEAD(
        designationConstants.designationEndpoint +
          '?designationNumber=' +
          designationNumber,
      )
      .respond(200);

    designationEditorService.checkPermission(designationNumber).then(
      () => {},
      () => {
        fail();
      },
    );
    $httpBackend.flush();

    $httpBackend
      .expectHEAD(
        designationConstants.designationEndpoint +
          '?designationNumber=' +
          designationNumber,
      )
      .respond(422);

    designationEditorService.checkPermission(designationNumber).then(
      () => {},
      () => {
        fail();
      },
    );
    $httpBackend.flush();
  });

  it('should return error if user does not have permission to edit', () => {
    $httpBackend
      .expectHEAD(
        designationConstants.designationEndpoint +
          '?designationNumber=' +
          designationNumber,
      )
      .respond(401);

    designationEditorService.checkPermission(designationNumber).then(
      () => {
        fail();
      },
      () => {},
    );
    $httpBackend.flush();
  });

  it('should get designation content', () => {
    $httpBackend
      .expectGET(
        designationConstants.designationEndpoint +
          '?designationNumber=' +
          designationNumber,
      )
      .respond(200, {});

    designationEditorService.getContent(designationNumber);
    $httpBackend.flush();
  });

  it('should call designation photos endpoint', () => {
    $httpBackend
      .expectGET(
        designationConstants.designationImagesEndpoint +
          '?designationNumber=' +
          designationNumber,
      )
      .respond(200, []);

    designationEditorService.getPhotos(designationNumber);
    $httpBackend.flush();
  });

  it('should call save endpoint', () => {
    $httpBackend
      .expectPOST(designationConstants.designationEndpoint)
      .respond(200);

    designationEditorService.save({});
    $httpBackend.flush();
  });

  describe('hasNewsletter (designationNumber)', () => {
    it('should succeed if designationNumber has a newsletter', () => {
      $httpBackend
        .expectGET(
          `${designationConstants.designationNewsletter}?designationNumber=${designationNumber}`,
        )
        .respond(200, { user_exists: true });

      const result = designationEditorService.hasNewsletter(designationNumber);
      $httpBackend.flush();
      expect(result).resolves.toBe(true);
    });

    it('should fail if designationNumber does not exist', () => {
      $httpBackend
        .expectGET(
          `${designationConstants.designationNewsletter}?designationNumber=${designationNumber}`,
        )
        .respond(404, { user_exists: false });

      const result = designationEditorService.hasNewsletter(designationNumber);
      $httpBackend.flush();
      expect(result).resolves.toBe(false);
    });
  });

  describe('subscribeToNewsletter (designationNumber, attributes)', () => {
    it('should post attributes', () => {
      $httpBackend
        .expectPOST(designationConstants.designationNewsletterSubscription, {
          designation_number: designationNumber,
          first_name: 'Bob',
          last_name: 'Montgomery',
        })
        .respond(200);

      designationEditorService.subscribeToNewsletter(designationNumber, {
        first_name: 'Bob',
        last_name: 'Montgomery',
      });
      $httpBackend.flush();
    });
  });
});
