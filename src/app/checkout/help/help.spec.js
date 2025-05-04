import angular from 'angular'
import 'angular-mocks'
import module from './help.component'

describe('Checkout Help', function () {
  beforeEach(angular.mock.module(module.name))
  var $ctrl, $httpBackend

  beforeEach(inject(function (_$componentController_, _$httpBackend_) {
    $httpBackend = _$httpBackend_

    $ctrl = _$componentController_(module.name, { })
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  it('get help block content from AEM', function () {
    $httpBackend.expectGET('/designations/jcr:content/give-need-help.html')
      .respond(200, '<p>Help Content</p>')

    $ctrl.$onInit()
    $httpBackend.flush()

    expect($ctrl.helpHTML).toEqual('<p>Help Content</p>')
  })

  it('should log an error on failure', () => {
    $httpBackend.expectGET('/designations/jcr:content/give-need-help.html').respond(500, 'some error')
    $ctrl.$onInit()
    $httpBackend.flush()

    expect($ctrl.$log.error.logs[0]).toEqual(['Error loading give-need-help', expect.objectContaining({ data: 'some error' })])
  })
})
