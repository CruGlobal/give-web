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
  secondarySuffix: '',
  'design-controller': {
    'carousel': {
      'image0': {
        'fileReference': '/content/dam/give/designations/0/1/2/3/4/0123456/some-image.jpg',
        'sling:resourceType': 'Give/components/content/image',
        'jcr:primaryType': 'nt:unstructured'
      },
      'image1': {
        'fileReference': '/content/dam/give/designations/0/1/2/3/4/0123456/another-image.jpg',
        'sling:resourceType': 'Give/components/content/image',
        'jcr:primaryType': 'nt:unstructured'
      },
      'image2': {
        'fileReference': '/content/dam/give/designations/0/1/2/3/4/0123456/third-image.jpg',
        'sling:resourceType': 'Give/components/content/image',
        'jcr:primaryType': 'nt:unstructured'
      },
      'jcr:primaryType': 'nt:unstructured'
    }
  },
  showNewsletterForm: true
}

describe('Designation Editor', function () {
  beforeEach(angular.mock.module(module.name))
  let $rootScope, $ctrl, $q, $httpBackend

  beforeEach(inject(function (_$rootScope_, _$componentController_, _$httpBackend_, _$q_) {
    $httpBackend = _$httpBackend_
    $q = _$q_
    $rootScope = _$rootScope_
    $ctrl = _$componentController_(module.name,
      {
        $window: {
          location: '/designation-editor.html?d=' + designationSecurityResponse.designationNumber,
          document: {
            dispatchEvent: jest.fn()
          },
          scrollTo: jest.fn()
        }
      }
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

    describe('onHandleOktaRedirect', () => {
      beforeEach(() => {
        jest.spyOn($ctrl.sessionHandleOktaRedirectService, 'onHandleOktaRedirect')
        $ctrl.$onInit()
      })

      it('should call onHandleOktaRedirect', () => {
        expect($ctrl.sessionHandleOktaRedirectService.onHandleOktaRedirect).toHaveBeenCalled()
      })
    })

    it('handles an Okta redirect error', () => {
      $ctrl.sessionHandleOktaRedirectService.errorMessageSubject = new Subject()
      jest.spyOn($ctrl.sessionHandleOktaRedirectService, 'onHandleOktaRedirect')
      $ctrl.$onInit()
      $ctrl.sessionHandleOktaRedirectService.errorMessageSubject.next('generic')

      expect($ctrl.errorMessage).toEqual('generic')
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
    it('should skip if no designation number', () => {
      expect($ctrl.getDesignationContent()).toEqual(undefined)
    })

    it('should load designation content and photos', (done) => {
      $ctrl.designationNumber = designationSecurityResponse.designationNumber

      $httpBackend.expectGET(designationConstants.designationEndpoint + '?designationNumber=' + designationSecurityResponse.designationNumber)
        .respond(200, designationSecurityResponse)
      $httpBackend.expectGET(designationConstants.designationImagesEndpoint + '?designationNumber=' + designationSecurityResponse.designationNumber)
        .respond(200, [])

      $ctrl.getDesignationContent().then(() => {
        expect($ctrl.designationContent).toBeDefined()
        expect($ctrl.contentLoaded).toEqual(false)
        expect($ctrl.loadingContentError).toEqual(false)
        done()
      }).catch(done)
      $httpBackend.flush()
    })

    it('should sign in and try again if the response is 422', (done) => {
      $ctrl.designationNumber = designationSecurityResponse.designationNumber

      $httpBackend.expectGET(designationConstants.designationEndpoint + '?designationNumber=' + designationSecurityResponse.designationNumber)
        .respond(422, null)
      $httpBackend.expectGET(designationConstants.designationImagesEndpoint + '?designationNumber=' + designationSecurityResponse.designationNumber)
        .respond(422, null)

      const signInDeferred = $q.defer()
      jest.spyOn($ctrl.sessionModalService, 'open').mockReturnValue({ result: signInDeferred.promise })

      $ctrl.getDesignationContent().then(() => {
        expect($ctrl.sessionModalService.open).toHaveBeenCalled()
        expect($ctrl.designationContent).toBeDefined()
        expect($ctrl.contentLoaded).toEqual(false)
        expect($ctrl.loadingContentError).toEqual(false)
        done()
      }).catch(done)
      $httpBackend.flush()

      $httpBackend.expectGET(designationConstants.designationEndpoint + '?designationNumber=' + designationSecurityResponse.designationNumber)
        .respond(200, designationSecurityResponse)
      $httpBackend.expectGET(designationConstants.designationImagesEndpoint + '?designationNumber=' + designationSecurityResponse.designationNumber)
        .respond(200, [])
      signInDeferred.resolve()
      $httpBackend.flush()
    })

    it('should only retry once if the response is repeatedly 422', (done) => {
      $ctrl.designationNumber = designationSecurityResponse.designationNumber

      $httpBackend.whenGET(designationConstants.designationEndpoint + '?designationNumber=' + designationSecurityResponse.designationNumber)
        .respond(422, null)
      $httpBackend.whenGET(designationConstants.designationImagesEndpoint + '?designationNumber=' + designationSecurityResponse.designationNumber)
        .respond(422, null)

      jest.spyOn($ctrl.sessionModalService, 'open').mockReturnValue({ result: $q.resolve() })

      $ctrl.getDesignationContent().then(() => {
        expect($ctrl.sessionModalService.open).toHaveBeenCalledTimes(1)
        expect($ctrl.designationContent).toBeUndefined()
        expect($ctrl.contentLoaded).toEqual(false)
        expect($ctrl.loadingContentError).toEqual(true)
        done()
      }).catch(done)
      $httpBackend.flush()
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
        jest.spyOn($ctrl.designationEditorService, 'hasNewsletter').mockResolvedValue(true)
      }))

      it('should open modal', async () => {
        $ctrl.designationNumber = '000555'
        $ctrl.giveDomain = 'https://give.example.com'
        $ctrl.designationContent = designationSecurityResponse

        $ctrl.editPersonalOptions()

        expect($ctrl.$uibModal.open).toHaveBeenCalled()
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.designationNumber()).toEqual(designationSecurityResponse.designationNumber)
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.giveDomain()).toEqual($ctrl.giveDomain)
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.designationType()).toEqual(designationSecurityResponse.designationType)
        await expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.hasNewsletter).resolves.toBe(true)
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.givingLinks()).toEqual(designationSecurityResponse.givingLinks)
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.showNewsletterForm()).toEqual(designationSecurityResponse.showNewsletterForm)

        modalPromise.resolve({
          givingLinks: [],
          showNewsletterForm: false
        })
        $rootScope.$digest()

        expect($ctrl.designationContent.suggestedAmounts).toEqual([])
        expect($ctrl.designationContent.showNewsletterForm).toEqual(false)
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

    describe('carousel modal', () => {
      let modalPromise
      beforeEach(inject((_$q_) => {
        modalPromise = _$q_.defer()
        jest.spyOn($ctrl.$uibModal, 'open').mockReturnValue({ result: modalPromise.promise })
        $ctrl.designationContent = designationSecurityResponse
        $ctrl.carouselImages = $ctrl.extractCarouselUrls()
      }))

      it('should open modal', () => {
        let photos = []
        $ctrl.designationPhotos = photos

        $ctrl.selectPhotos('secondaryPhotos')

        let selectedPhotos = [
          { url: '/content/dam/give/designations/0/1/2/3/4/0123456/some-image.jpg' },
          { url: '/content/dam/give/designations/0/1/2/3/4/0123456/another-image.jpg' },
          { url: '/content/dam/give/designations/0/1/2/3/4/0123456/third-image.jpg' }
        ]

        expect($ctrl.$uibModal.open).toHaveBeenCalled()
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.designationNumber()).toEqual(designationSecurityResponse.designationNumber)
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.campaignPage()).toBeUndefined()
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.photos()).toEqual(photos)
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.photoLocation()).toEqual('secondaryPhotos')
        expect($ctrl.$uibModal.open.mock.calls[0][0].resolve.selectedPhoto()).toEqual(selectedPhotos)
      })

      it('should have empty selectedPhotos', () => {
        $ctrl.selectPhotos('secondaryPhotos', designationSecurityResponse['design-controller'].carousel)
        modalPromise.resolve({
          selected: '',
          photos: []
        })
        $rootScope.$digest()
        expect($ctrl.designationContent['secondaryPhotos']).toEqual([])
      })

      it('should have selectedPhotos', () => {
        $ctrl.selectPhotos('secondaryPhotos', designationSecurityResponse['design-controller'].carousel)
        modalPromise.resolve({
          selected: [{ url: '/content/photo1.jpg' }, { url: '/content/photo2.jpg' }],
          photos: designationSecurityResponse['design-controller'].carousel
        })
        $rootScope.$digest()
        expect($ctrl.designationContent['secondaryPhotos']).toEqual(['/content/photo1.jpg', '/content/photo2.jpg'])
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
    it('should save designation content', done => {
      jest.spyOn($ctrl, 'sessionEnforcerService').mockImplementation((role, callbacks) => {
        const signInAsync = () => {
          return Promise.resolve(callbacks['sign-in']())
        }

        signInAsync().then(() => {
          expect($ctrl.designationEditorService.save).toHaveBeenCalled()
          done()
        })
      })
      $ctrl.designationContent = designationSecurityResponse
      jest.spyOn($ctrl.designationEditorService, 'save').mockImplementation(() => Promise.resolve({}))
      $ctrl.save()
    })

    it('should try to save designation content', done => {
      jest.spyOn($ctrl, 'sessionEnforcerService').mockImplementation((role, callbacks) => {
        const signInAsync = () => {
          return Promise.resolve(callbacks['sign-in']())
        }
        signInAsync().then(() => {
          expect($ctrl.saveStatus).toEqual('failure')
          expect($ctrl.saveDesignationError).toEqual(true)
          expect($ctrl.$log.error.logs[0]).toEqual(['Error saving designation editor content.', expect.any(Object)])
          done()
        })
      })
      jest.spyOn($ctrl.designationEditorService, 'save').mockImplementation(() => Promise.reject(new Error('error')))
      jest.spyOn($ctrl.$window, 'scrollTo').mockImplementation(() => {})
      $ctrl.designationContent = designationSecurityResponse
      $ctrl.save()
    })

    it('should handle cancelling the login', done => {
      jest.spyOn($ctrl, 'sessionEnforcerService').mockImplementation((role, callbacks) => {
        const signInAsync = () => {
          return Promise.resolve(callbacks.cancel())
        }

        signInAsync().then(() => {
          expect($ctrl.$window.location).toEqual('/')
          done()
        })
      })
      $ctrl.save()
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

    it('Staff Pool', () => {
      $ctrl.designationContent = {
        designationType: 'Staff Pool'
      }

      expect($ctrl.isPerson()).toEqual(false)
      expect($ctrl.isMinistry()).toEqual(true)
      expect($ctrl.isCampaign()).toEqual(false)
    })

    it('Campaign', () => {
      $ctrl.designationContent = {
        designationType: 'Campaign'
      }

      expect($ctrl.isPerson()).toEqual(false)
      expect($ctrl.isMinistry()).toEqual(false)
      expect($ctrl.isCampaign()).toEqual(true)
    })
  })

  describe('extractCarouselUrls', () => {
    it('should return all of the selected images for the carousel', () => {
      $ctrl.designationContent = designationSecurityResponse
      let expectedImageUrls = [
        '/content/dam/give/designations/0/1/2/3/4/0123456/some-image.jpg',
        '/content/dam/give/designations/0/1/2/3/4/0123456/another-image.jpg',
        '/content/dam/give/designations/0/1/2/3/4/0123456/third-image.jpg'
      ]

      expect($ctrl.extractCarouselUrls()).toEqual(expectedImageUrls)
    })

    it('should return an empty array if there is no carousel', () => {
      $ctrl.designationContent = {
        designationNumber: '0123456'
      }
      expect($ctrl.extractCarouselUrls()).toEqual([])
    })
  })

  describe('updateCarousel', () => {
    it('should hide then show the carousel', () => {
      $ctrl.updateCarousel()

      expect($ctrl.contentLoaded).toBe(false)

      $rootScope.$digest()

      expect($ctrl.contentLoaded).toBe(true)
    })
  })

  describe('getImageUrls', () => {
    it('should return just the URLs of the images in the carousel', () => {
      let expectedImageUrls = [
        '/content/dam/give/designations/0/1/2/3/4/0123456/some-image.jpg',
        '/content/dam/give/designations/0/1/2/3/4/0123456/another-image.jpg',
        '/content/dam/give/designations/0/1/2/3/4/0123456/third-image.jpg'
      ]
      const imageUrls = $ctrl.getImageUrls(designationSecurityResponse['design-controller'].carousel)
      expect(imageUrls).toEqual(expectedImageUrls)
    })

    it('should return empty array if there is no carousel', () => {
      const imageUrls = $ctrl.getImageUrls(undefined)
      expect(imageUrls).toEqual([])
    })
  })

  describe('carouselLoad()', () => {
    it('does nothing when loaded', () => {
      $ctrl.carouselLoaded = true
      $ctrl.carouselLoad()
      expect($ctrl.$window.document.dispatchEvent).not.toHaveBeenCalled()
    })

    it('fires event when not loaded', () => {
      $ctrl.carouselLoaded = false
      $ctrl.carouselLoad()
      expect($ctrl.$window.document.dispatchEvent).toHaveBeenCalled()
    })
  })

  describe ('getDoneEditingUrl()', () => {
    const cacheBust = '?doneEditing'
    const designationNumber = '0123456'

    it('should return the first vanity url', () => {
      $ctrl.designationContent = designationSecurityResponse
      $ctrl.designationContent['sling:vanityPath'] = [`/content/give/us/en/${designationNumber}`]
      expect($ctrl.getDoneEditingUrl()).toEqual(`/${designationNumber}${cacheBust}`)
    })

    it('should return the only vanity url', () => {
      $ctrl.designationContent = designationSecurityResponse
      $ctrl.designationContent['sling:vanityPath'] = `/content/give/us/en/${designationNumber}`
      expect($ctrl.getDoneEditingUrl()).toEqual(`/${designationNumber}${cacheBust}`)
    })

    it('should fallback to the designation number page', () => {
      $ctrl.designationNumber = designationNumber
      $ctrl.designationContent = designationSecurityResponse
      $ctrl.designationContent['sling:vanityPath'] = undefined
      expect($ctrl.getDoneEditingUrl()).toEqual(`/${designationNumber}${cacheBust}`)
    })
  })
})
