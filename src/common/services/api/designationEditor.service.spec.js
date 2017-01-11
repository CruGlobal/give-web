import angular from 'angular';
import 'angular-mocks';

import module from './designationEditor.service';
import designationConstants from './designationEditor.constants';

describe( 'donation editor service', () => {
  beforeEach( angular.mock.module( module.name ) );
  let designationEditorService, $httpBackend, designationNumber = '000555';

  beforeEach( inject( ( _designationEditorService_, _$httpBackend_ ) => {
    designationEditorService = _designationEditorService_;
    $httpBackend = _$httpBackend_;
  } ) );

  afterEach( () => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  } );

  it( 'should return success if user has permission to edit', () => {
    $httpBackend
      .expectHEAD( designationConstants.designationEndpoint + '?designationNumber=' + designationNumber )
      .respond( 200 );

    designationEditorService.checkPermission(designationNumber).then(() => {}, () => {
      fail();
    });
    $httpBackend.flush();

    $httpBackend
      .expectHEAD( designationConstants.designationEndpoint + '?designationNumber=' + designationNumber )
      .respond( 498 );

    designationEditorService.checkPermission(designationNumber).then(() => {}, () => {
      fail();
    });
    $httpBackend.flush();
  } );

  it( 'should return error if user does not have permission to edit', () => {
    $httpBackend
      .expectHEAD( designationConstants.designationEndpoint + '?designationNumber=' + designationNumber )
      .respond( 401 );

    designationEditorService.checkPermission(designationNumber).then(() => {
      fail();
    }, () => {});
    $httpBackend.flush();
  } );

  it( 'should get designation content', () => {
    $httpBackend
      .expectGET( designationConstants.designationEndpoint + '?designationNumber=' + designationNumber )
      .respond( 200, {} );

    designationEditorService.getContent(designationNumber);
    $httpBackend.flush();
  } );

  it( 'should call designation photos endpoint', () => {
    $httpBackend
      .expectGET( designationConstants.designationImagesEndpoint + '?designationNumber=' + designationNumber )
      .respond( 200, [] );

    designationEditorService.getPhotos(designationNumber);
    $httpBackend.flush();
  } );

  it( 'should call save endpoint', () => {
    $httpBackend
      .expectPOST( designationConstants.designationEndpoint )
      .respond( 200 );

    designationEditorService.save({});
    $httpBackend.flush();
  } );
} );
