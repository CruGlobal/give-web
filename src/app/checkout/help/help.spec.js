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

  // it('get help block content from AEM', function () {
  //   $httpBackend.expectGET('/designations/jcr:content/need-help-ipar/contentfragment.html')
  //     .respond(200, '<p>Help Content</p>')
  //
  //   $ctrl.$onInit()
  //   $httpBackend.flush()
  //
  //   expect($ctrl.helpHTML).toEqual('<p>Help Content</p>')
  // })

  // it('should log an error on failure', () => {
  //   $httpBackend.expectGET('/designations/jcr:content/need-help-ipar/contentfragment.html').respond(500, 'some error')
  //   $ctrl.$onInit()
  //   $httpBackend.flush()
  //
  //   expect($ctrl.$log.error.logs[0]).toEqual(['Error loading give-need-help', expect.objectContaining({ data: 'some error' })])
  // })

  it('uses hardcoded help block content', function () {

    $ctrl.$onInit()

    expect($ctrl.helpHTML).toEqual('<div><h3 class="panel-name">Need Help?</h3>\n'
      + '<p>Call us at <b>(888)278-7233</b> from <b>9:00 a.m. to 5:00 p.m. ET,</b> Monday-Friday, or email us at <a href="mailto:eGift@cru.org" target="_top">eGift@cru.org</a>.</p>\n'
      + '<p>We have also compiled a list of answers to <a>Frequently Asked Questions.</a></p>\n'
      + '</div>')
  })
})
