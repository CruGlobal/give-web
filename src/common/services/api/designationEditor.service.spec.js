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

  it( 'should call can edit endpoint', () => {
    $httpBackend
      .expectGET( designationConstants.designationCanEdit + '?designationNumber=' + designationNumber )
      .respond( 200 );

    designationEditorService.checkPermission(designationNumber);
    $httpBackend.flush();
  } );

  it( 'should call security endpoint', () => {
    $httpBackend
      .expectGET( designationConstants.designationSecurityEndpoint + '?designationNumber=' + designationNumber )
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
      .expectPOST( designationConstants.saveEndpoint )
      .respond( 200 );

    designationEditorService.save({});
    $httpBackend.flush();
  } );
} );
