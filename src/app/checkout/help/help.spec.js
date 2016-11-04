import angular from 'angular';
import 'angular-mocks';
import module from './help.component';

describe('Checkout Help', function() {
  beforeEach(angular.mock.module(module.name));
  var $ctrl, $httpBackend;

  beforeEach(inject(function(_$componentController_, _$httpBackend_) {
    $httpBackend = _$httpBackend_;

    $ctrl = _$componentController_( module.name, { } );
  }));

  it('to be defined', function() {
    expect($ctrl).toBeDefined();
  });

  it('get help block content from AEM', function() {
    $httpBackend.expectGET('/etc/designs/give/_jcr_content/content/give-need-help.json')
      .respond(200, {
        richtextglobal: '<p>Help Content</p>'
      });

    $ctrl.$onInit();
    $httpBackend.flush();

    expect( $ctrl.helpHTML ).toEqual('<p>Help Content</p>');

  });
});
