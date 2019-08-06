import angular from 'angular'
import 'angular-mocks'
import module from './personalOptions.modal'

describe('Designation Editor Personal Options', function () {
  beforeEach(angular.mock.module(module.name))
  var $ctrl

  beforeEach(inject(function ($rootScope, $controller) {
    var $scope = $rootScope.$new()

    $ctrl = $controller(module.name, {
      designationNumber: '000555',
      designationType: 'Staff',
      giveDomain: 'https://give.cru.org',
      givingLinks: {
        'jcr:primaryType': 'nt:unstructured',
        1: { 'jcr:primaryType': 'nt:unstructured', url: 'https://example.com', name: 'Name' }
      },
      showNewsletterForm: true,
      $scope: $scope
    })
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  it('to define modal resolves', function () {
    expect($ctrl.designationNumber).toEqual('000555')
    expect($ctrl.designationType).toEqual('Staff')
    expect($ctrl.givingLinks).toEqual([{ name: 'Name', url: 'https://example.com', order: 1 }])
    expect($ctrl.showNewsletterForm).toEqual(true)
  })

  it('transforms giving links', function () {
    expect($ctrl.transformGivingLinks()).toEqual({
      1: { name: 'Name', url: 'https://example.com' }
    })
  })
})
