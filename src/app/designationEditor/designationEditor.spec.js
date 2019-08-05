import angular from 'angular'
import 'angular-mocks'
import module from './designationEditor.component'
import designationConstants from 'common/services/api/designationEditor.constants'
import { Roles } from 'common/services/session/session.service'

const designationSecurityResponse = {
  designationNumber: '000555',
  designationName: 'Steve & Stacie',
  designationType: 'Staff',
  title: 'Steve & Stacie Give Page',
  paragraphText: '<p>page info</p>',
  coverPhoto: '/content/dam/give/designations/photo.jpg',
  secondaryPhoto: '',
  websiteURL: '',
  organizationId: '1-TG-11',
  parentDesignationNumber: '',
  firstName: '',
  lastName: '',
  spouseName: '',
  secure: false,
  customized: true,
  hideInNav: true,
  redirectTarget: '',
  status: '',
  pointedToDesignationPath: '',
  suggestedAmounts: [],
  givingLinks: {
    'jcr:primaryType': 'nt:unstructured',
    item0: { 'jcr:primaryType': 'nt:unstructured', url: 'https://example.com', name: 'Name' }
  },
  primaryFirstName: '',
  primaryMiddleName: '',
  primaryLastName: '',
  primaryMaidenName: '',
  primarySuffix: '',
  secondaryFirstName: '',
  secondaryMiddleName: '',
  secondaryLastName: '',
  secondaryMaidenName: '',
  secondarySuffix: ''
}

describe('Designation Editor', function () {
  beforeEach(angular.mock.module(module.name))
  let $rootScope, $ctrl, $q, $httpBackend

  beforeEach(inject(function (_$rootScope_, _$componentController_, _$httpBackend_, _$q_) {
    $httpBackend = _$httpBackend_
    $q = _$q_
    $rootScope = _$rootScope_
    $ctrl = _$componentController_(module.name,
      { $window: { location: '/designation-editor.html?d=' + designationSecurityResponse.designationNumber } }
    )
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  describe('$onInit', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'sessionEnforcerService').mockImplementation(() => {})
      jest.spyOn($ctrl, 'getDesignationContent').mockImplementation(() => {})
      jest.spyOn($ctrl.$location, 'search').mockReturnValue({ d: designationSecurityResponse.designationNumber })
    })

    it('get designationNumber', () => {
      $ctrl.$onInit()

      expect($ctrl.designationNumber).toEqual(designationSecurityResponse.designationNumber)
    })

    it('should require designationNumber', () => {
      $ctrl.$location.search.mockReturnValue({})
      $ctrl.$onInit()

      expect($ctrl.$window.location).toEqual('/')
    })

    describe('\'PUBLIC\' role', () => {
      it('sets profileLoading and registers sessionEnforcer', () => {
        jest.spyOn($ctrl.sessionService, 'getRole').mockReturnValue(Roles.public)
        $ctrl.$onInit()

        expect($ctrl.sessionEnforcerService).toHaveBeenCalledWith(
          [Roles.registered], expect.objectContaining({
            'sign-in': expect.any(Function),
            cancel: expect.any(Function)
          }), 'session'
        )

        expect($ctrl.getDesignationContent).not.toHaveBeenCalled()
      })
    })

    describe('sessionEnforcerService success', () => {
      it('executes success callback', () => {
        expect($ctrl.getDesignationContent).not.toHaveBeenCalled()

        $ctrl.$onInit()
        $ctrl.sessionEnforcerService.mock.calls[0][1]['sign-in']()

        expect($ctrl.getDesignationContent).toHaveBeenCalled()
      })
    })

    describe('sessionEnforcerService failure', () => {
      it('executes failure callback', () => {
        $ctrl.$onInit()
        $ctrl.sessionEnforcerService.mock.calls[0][1]['cancel']()

        expect($ctrl.$window.location).toEqual('/')
      })
    })
  })

  describe('$onDestroy()', () => {
    it('cleans up the component', () => {
      jest.spyOn($ctrl.sessionEnforcerService, 'cancel').mockImplementation(() => {})

      $ctrl.enforcerId = '1234567890'
      $ctrl.$onDestroy()

      expect($ctrl.sessionEnforcerService.cancel).toHaveBeenCalledWith('1234567890')
    })
  })

  describe('getDesignationContent()', () => {
    it('to skip if no designation number', () => {
      expect($ctrl.getDesignationContent()).toEqual(undefined)
    })

    it('to getDesignationContent', () => {
      $ctrl.designationNumber = designationSecurityResponse.designationNumber

      $httpBackend.expectGET(designationConstants.designationEndpoint + '?designationNumber=' + designationSecurityResponse.designationNumber)
        .respond(200, designationSecurityResponse)
      $httpBackend.expectGET(designationConstants.designationImagesEndpoint + '?designationNumber=' + designationSecurityResponse.designationNumber)
        .respond(200, [])

      $ctrl.getDesignationContent().then(() => {
        expect($ctrl.designationContent).toBeDefined()
        expect($ctrl.contentLoaded).toEqual(true)
        expect($ctrl.loadingContentError).toEqual(false)
      })
      $httpBackend.flush()
    })

    it('should log an error if content fails', () => {
      $ctrl.designationNumber = '0123456'
      jest.spyOn($ctrl.designationEditorService, 'getContent').mockImplementation(() => {
        const p = $q.defer()
        p.reject('some error')
        return p.promise
      })
      jest.spyOn($ctrl.designationEditorService, 'getPhotos').mockImplementation(() => {
        const p = $q.defer()
        p.resolve({})
        return p.promise
      })
      $ctrl.getDesignationContent()
      $rootScope.$digest()

      expect($ctrl.$log.error.logs[0]).toEqual(['Error loading designation content or photos.', 'some error'])
      expect($ctrl.contentLoaded).toEqual(false)
      expect($ctrl.loadingContentError).toEqual(true)
    })
  })

  describe('modals', () => {
    beforeEach(() => {
      const savePromise = $q.defer()
      jest.spyOn($ctrl, 'save').mockReturnValue({ result: savePromise.promise })
    })

    describe('title modal', () => {
      let modalPromise
      beforeEach(inject((_$q_) => {
        modalPromise = _$q_.defer()
        jest.spyOn($ctrl.$uibModal, 'open').mockReturnValue({ result: modalPromise.promise })
      }))

      it('should open modal', () => {
        $ctrl.designationContent = designationSecurityResponse

        $ctrl.editTitle()

        expect($ctrl.$uibModal.open).toHaveBeenCalled()
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.receiptTitle()).toEqual(designationSecurityResponse.designationName)
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.giveTitle()).toEqual(designationSecurityResponse['jcr:title'])

        modalPromise.resolve('Title A')
        $rootScope.$digest()

        expect($ctrl.designationContent['jcr:title']).toEqual('Title A')
      })
    })

    describe('page options modal', () => {
      let modalPromise
      beforeEach(inject((_$q_) => {
        modalPromise = _$q_.defer()
        jest.spyOn($ctrl.$uibModal, 'open').mockReturnValue({ result: modalPromise.promise })
      }))

      it('should open modal', () => {
        $ctrl.designationContent = designationSecurityResponse

        $ctrl.editPageOptions()

        expect($ctrl.$uibModal.open).toHaveBeenCalled()
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.parentDesignationNumber()).toEqual(designationSecurityResponse.parentDesignationNumber)
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.organizationId()).toEqual(designationSecurityResponse.organizationId)
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.facebookPixelId()).toEqual(designationSecurityResponse.facebookPixelId)
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.suggestedAmounts()).toEqual(designationSecurityResponse.suggestedAmounts)

        modalPromise.resolve({
          parentDesignationNumber: '000777',
          facebookPixelId: '563541681',
          suggestedAmounts: []
        })
        $rootScope.$digest()

        expect($ctrl.designationContent.parentDesignationNumber).toEqual('000777')
        expect($ctrl.designationContent.facebookPixelId).toEqual('563541681')
        expect($ctrl.designationContent.suggestedAmounts).toEqual([])
      })
    })

    describe('personal options modal', () => {
      let modalPromise
      beforeEach(inject((_$q_) => {
        modalPromise = _$q_.defer()
        jest.spyOn($ctrl.$uibModal, 'open').mockReturnValue({ result: modalPromise.promise })
      }))

      it('should open modal', () => {
        $ctrl.designationNumber = '000555'
        $ctrl.giveDomain = 'https://give.example.com'
        $ctrl.designationContent = designationSecurityResponse

        $ctrl.editPersonalOptions()

        expect($ctrl.$uibModal.open).toHaveBeenCalled()
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.designationNumber()).toEqual(designationSecurityResponse.designationNumber)
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.giveDomain()).toEqual($ctrl.giveDomain)
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.givingLinks()).toEqual(designationSecurityResponse.givingLinks)

        modalPromise.resolve({
          givingLinks: []
        })
        $rootScope.$digest()

        expect($ctrl.designationContent.suggestedAmounts).toEqual([])
      })
    })

    describe('photo modal', () => {
      let modalPromise
      beforeEach(inject((_$q_) => {
        modalPromise = _$q_.defer()
        jest.spyOn($ctrl.$uibModal, 'open').mockReturnValue({ result: modalPromise.promise })
      }))

      it('should open modal', () => {
        const photos = []
        const photoLocation = 'coverPhoto'
        $ctrl.designationContent = designationSecurityResponse
        $ctrl.designationPhotos = photos

        $ctrl.selectPhoto(photoLocation, designationSecurityResponse.coverPhoto)

        expect($ctrl.$uibModal.open).toHaveBeenCalled()
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.designationNumber()).toEqual(designationSecurityResponse.designationNumber)
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.campaignPage()).toBeUndefined()
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.photos()).toEqual(photos)
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.photoLocation()).toEqual(photoLocation)
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.selectedPhoto()).toEqual(designationSecurityResponse.coverPhoto)

        modalPromise.resolve({
          selected: null,
          photos: photos
        })
        $rootScope.$digest()

        expect($ctrl.designationContent.coverPhoto).toEqual(null)
      })
    })

    describe('edit text modal', () => {
      let modalPromise
      beforeEach(inject((_$q_) => {
        modalPromise = _$q_.defer()
        jest.spyOn($ctrl.$uibModal, 'open').mockReturnValue({ result: modalPromise.promise })
      }))

      it('should open modal', () => {
        $ctrl.designationContent = designationSecurityResponse

        $ctrl.editText('paragraphText')

        expect($ctrl.$uibModal.open).toHaveBeenCalled()
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.initialText()).toEqual(designationSecurityResponse.paragraphText)

        modalPromise.resolve('Text 123')
        $rootScope.$digest()

        expect($ctrl.designationContent.paragraphText).toEqual('Text 123')
      })
    })

    describe('edit website modal', () => {
      let modalPromise
      beforeEach(inject((_$q_) => {
        modalPromise = _$q_.defer()
        jest.spyOn($ctrl.$uibModal, 'open').mockReturnValue({ result: modalPromise.promise })
      }))

      it('should open modal', () => {
        $ctrl.designationContent = designationSecurityResponse

        $ctrl.editWebsite()

        expect($ctrl.$uibModal.open).toHaveBeenCalled()
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.initialWebsite()).toEqual(designationSecurityResponse.websiteURL)

        modalPromise.resolve('http://www.cru.org/website')
        $rootScope.$digest()

        expect($ctrl.designationContent.websiteURL).toEqual('http://www.cru.org/website')
      })
    })
  })

  describe('photoUrl', () => {
    it('find photo url', () => {
      const photos = [{
        original: '/content/dam/give/designations/026/CMS1_064561.jpg',
        cover: '/content/dam/give/designations/0/5/CMS1_064561.jpg.transform/GiveDesignationCoverPhoto/img.jpg',
        thumbnail: '/content/dam/give/designations/826/CMS1_064561.jpg.transform/GiveDesignationThumbnail/img.jpg',
        secondary: '/content/dam/give/designations/826/CMS1_064561.jpg.transform/GiveDesignationSmallerPhoto/img.jpg'
      }, {
        original: '/content/dam/give/designations/026/CMS1_063495.jpg',
        cover: '/content/dam/give/designations/0/5/CMS1_063495.jpg.transform/GiveDesignationCoverPhoto/img.jpg',
        thumbnail: '/content/dam/give/designations/826/CMS1_063495.jpg.transform/GiveDesignationThumbnail/img.jpg',
        secondary: '/content/dam/give/designations/826/CMS1_063495.jpg.transform/GiveDesignationSmallerPhoto/img.jpg'
      }, {
        original: '/content/dam/give/designations/026/CMS1_010.jpg',
        cover: '/content/dam/give/designations/0/5/CMS1_086010.jpg.transform/GiveDesignationCoverPhoto/img.jpg',
        thumbnail: '/content/dam/give/designations/826/CMS1_08010.jpg.transform/GiveDesignationThumbnail/img.jpg',
        secondary: '/content/dam/give/designations/826/CMS1_080.jpg.transform/GiveDesignationSmallerPhoto/img.jpg'
      }, {
        original: '/content/dam/give/designations/026/CMS1_055.jpg',
        cover: '/content/dam/give/designations/0/5/CMS1_0535.jpg.transform/GiveDesignationCoverPhoto/img.jpg',
        thumbnail: '/content/dam/give/designations/826/CMS1_035.jpg.transform/GiveDesignationThumbnail/img.jpg',
        secondary: '/content/dam/give/designations/826/CMS1_035.jpg.transform/GiveDesignationSmallerPhoto/img.jpg'
      }]
      $ctrl.designationPhotos = photos

      expect($ctrl.photoUrl(photos[0].original)).toEqual(photos[0])
    })
  })

  describe('save', () => {
    it('should save designation content', () => {
      $httpBackend.expectPOST(designationConstants.designationEndpoint).respond(200)
      $ctrl.designationContent = designationSecurityResponse

      $ctrl.save().then(() => {
        expect($ctrl.saveStatus).toEqual('success')
        expect($ctrl.saveDesignationError).toEqual(false)
      })
      $httpBackend.flush()
    })

    it('should try to save designation content', () => {
      $httpBackend.expectPOST(designationConstants.designationEndpoint).respond(500)
      $ctrl.designationContent = designationSecurityResponse

      $ctrl.save().then(() => {
        expect($ctrl.saveStatus).toEqual('failure')
        expect($ctrl.saveDesignationError).toEqual(true)
        expect($ctrl.$log.error.logs[0]).toEqual(['Error saving designation editor content.', expect.any(Object)])
      })
      $httpBackend.flush()
    })
  })

  describe('isPerson, isMinistry, isCampaign', () => {
    it('Staff', () => {
      $ctrl.designationContent = {
        designationType: 'Staff'
      }

      expect($ctrl.isPerson()).toEqual(true)
      expect($ctrl.isMinistry()).toEqual(false)
      expect($ctrl.isCampaign()).toEqual(false)
    })
  })
})
