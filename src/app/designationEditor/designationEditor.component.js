import angular from 'angular'
import 'angular-sanitize'
import find from 'lodash/find'
import includes from 'lodash/includes'
import uibModal from 'angular-ui-bootstrap/src/modal'

import commonModule from 'common/common.module'
import sessionEnforcerService, {
  EnforcerCallbacks,
  EnforcerModes
} from 'common/services/session/sessionEnforcer.service'
import sessionService, { Roles } from 'common/services/session/session.service'
import designationEditorService from 'common/services/api/designationEditor.service'

import titleModalController from './titleModal/title.modal'
import pageOptionsModalController from './pageOptionsModal/pageOptions.modal'
import personalOptionsModalController from './personalOptionsModal/personalOptions.modal'
import photoModalController from './photoModal/photo.modal'
import textEditorModalController from './textEditorModal/textEditor.modal'
import websiteModalController from './websiteModal/website.modal'

import template from './designationEditor.tpl.html'
import titleModalTemplate from './titleModal/titleModal.tpl.html'
import pageOptionsModalTemplate from './pageOptionsModal/pageOptionsModal.tpl.html'
import personalOptionsModalTemplate from './personalOptionsModal/personalOptionsModal.tpl.html'
import photoModalTemplate from './photoModal/photoModal.tpl.html'
import carouselModalTemplate from './carouselModal/carouselModal.tpl.html'
import textEditorModalTemplate from './textEditorModal/textEditorModal.tpl.html'
import websiteModalTemplate from './websiteModal/websiteModal.tpl.html'

import './designationEditor.scss'

const componentName = 'designationEditor'

class DesignationEditorController {
  /* @ngInject */
  constructor ($log, $q, $uibModal, $location, $window, envService, sessionService, sessionEnforcerService, designationEditorService) {
    this.$log = $log
    this.sessionService = sessionService
    this.sessionEnforcerService = sessionEnforcerService
    this.designationEditorService = designationEditorService

    this.imgDomain = envService.read('imgDomain')
    this.imgDomainDesignation = envService.read('imgDomainDesignation')
    this.giveDomain = envService.read('publicGive')

    this.$location = $location
    this.$q = $q
    this.$uibModal = $uibModal
    this.$window = $window
  }

  $onInit () {
    this.designationNumber = this.$location.search().d
    this.campaignPage = this.$location.search().campaign
    this.carouselLoaded = false

    // designationNumber is required
    if (!this.designationNumber) {
      this.$window.location = '/'
    }

    this.enforcerId = this.sessionEnforcerService([Roles.registered], {
      [EnforcerCallbacks.signIn]: () => {
        this.getDesignationContent()
      },
      [EnforcerCallbacks.cancel]: () => {
        // Authentication failure
        this.$window.location = '/'
      }
    }, EnforcerModes.session)
  }

  $onDestroy () {
    // Destroy enforcer
    this.sessionEnforcerService.cancel(this.enforcerId)
  }

  getDesignationContent () {
    if (!this.designationNumber) { return }
    this.loadingContentError = false
    this.contentLoaded = false
    this.loadingOverlay = true

    return this.$q.all([
      // get designation content
      this.designationEditorService.getContent(this.designationNumber, this.campaignPage),
      // get designation photos
      this.designationEditorService.getPhotos(this.designationNumber)
    ]).then(responses => {
      this.contentLoaded = true
      this.loadingOverlay = false
      this.designationContent = responses[0].data
      this.designationPhotos = responses[1].data
    }, error => {
      this.contentLoaded = false
      this.loadingOverlay = false
      this.loadingContentError = true
      this.$log.error('Error loading designation content or photos.', error)
    })
  }

  editTitle () {
    const modalOptions = {
      templateUrl: titleModalTemplate,
      controller: titleModalController.name,
      controllerAs: '$ctrl',
      resolve: {
        receiptTitle: () => {
          return this.designationContent.designationName
        },
        giveTitle: () => {
          return this.designationContent['jcr:title']
        }
      }
    }
    this.$uibModal.open(modalOptions).result
      .then((title) => {
        this.designationContent['jcr:title'] = title
        this.save()
      }, angular.noop)
  }

  editPageOptions () {
    const modalOptions = {
      templateUrl: pageOptionsModalTemplate,
      controller: pageOptionsModalController.name,
      controllerAs: '$ctrl',
      resolve: {
        parentDesignationNumber: () => {
          return this.designationContent.parentDesignationNumber
        },
        organizationId: () => {
          return this.designationContent.organizationId
        },
        suggestedAmounts: () => {
          return this.designationContent.suggestedAmounts
        },
        facebookPixelId: () => {
          return this.designationContent.facebookPixelId
        }
      }
    }
    this.$uibModal.open(modalOptions).result
      .then((data) => {
        this.designationContent.parentDesignationNumber = data.parentDesignationNumber
        this.designationContent.suggestedAmounts = data.suggestedAmounts
        this.designationContent.facebookPixelId = data.facebookPixelId
        this.save()
      }, angular.noop)
  }

  editPersonalOptions () {
    const modalOptions = {
      templateUrl: personalOptionsModalTemplate,
      controller: personalOptionsModalController.name,
      controllerAs: '$ctrl',
      resolve: {
        giveDomain: () => { return this.giveDomain },
        designationNumber: () => { return this.designationNumber },
        designationType: () => { return this.designationContent.designationType },
        hasNewsletter: this.designationEditorService.hasNewsletter(this.designationNumber),
        givingLinks: () => { return this.designationContent.givingLinks },
        showNewsletterForm: () => { return this.designationContent.showNewsletterForm }
      }
    }
    this.$uibModal.open(modalOptions).result
      .then((data) => {
        this.designationContent.givingLinks = data.givingLinks
        this.designationContent.showNewsletterForm = data.showNewsletterForm
        this.save()
      }, angular.noop)
  }

  selectPhotos (photoLocation, selectedPhotos) {
    const imageUrls = this.getImageUrls(selectedPhotos)
    const selectedUrls = imageUrls.map(url => ({ url }))

    const modalOptions = {
      templateUrl: carouselModalTemplate,
      controller: photoModalController.name,
      controllerAs: '$ctrl',
      resolve: {
        designationNumber: () => {
          return this.designationContent.designationNumber
        },
        campaignPage: () => {
          return this.campaignPage
        },
        photos: () => {
          return this.designationPhotos
        },
        photoLocation: () => {
          return photoLocation
        },
        selectedPhoto: () => {
          return selectedUrls
        }
      }
    }
    this.$uibModal.open(modalOptions).result.then((data) => {
      this.designationContent[photoLocation] = (data.selected || []).map(photo => photo.url)
      this.designationPhotos = data.photos
      this.save()
    }, angular.noop)
  }

  selectPhoto (photoLocation, selectedPhoto) {
    const modalOptions = {
      templateUrl: photoModalTemplate,
      controller: photoModalController.name,
      controllerAs: '$ctrl',
      resolve: {
        designationNumber: () => {
          return this.designationContent.designationNumber
        },
        campaignPage: () => {
          return this.campaignPage
        },
        photos: () => {
          return this.designationPhotos
        },
        photoLocation: () => {
          return photoLocation
        },
        selectedPhoto: () => {
          return selectedPhoto
        }
      }
    }
    this.$uibModal.open(modalOptions).result.then((data) => {
      this.designationContent[photoLocation] = data.selected
      this.designationPhotos = data.photos
      this.save()
    }, angular.noop)
  }

  photoUrl (originalUrl) {
    return find(this.designationPhotos, { original: originalUrl })
  }

  images () {
    const designController = this.designationContent['design-controller']
    if (designController && designController['carousel']) {
      return this.getImageUrls(designController['carousel'])
    }
    return []
  }

  editText (field) {
    const modalOptions = {
      templateUrl: textEditorModalTemplate,
      controller: textEditorModalController.name,
      controllerAs: '$ctrl',
      size: 'lg designation-editor-modal',
      resolve: {
        initialText: () => {
          return this.designationContent[field]
        }
      }
    }
    this.$uibModal.open(modalOptions).result.then((text) => {
      this.designationContent[field] = text
      this.save()
    }, angular.noop)
  }

  editWebsite () {
    const modalOptions = {
      templateUrl: websiteModalTemplate,
      controller: websiteModalController.name,
      controllerAs: '$ctrl',
      resolve: {
        initialWebsite: () => {
          return this.designationContent.websiteURL
        }
      }
    }
    this.$uibModal.open(modalOptions).result
      .then((websiteURL) => {
        this.designationContent.websiteURL = websiteURL
        this.save()
      }, angular.noop)
  }

  save () {
    this.loadingOverlay = true
    this.saveDesignationError = false

    return this.designationEditorService.save(this.designationContent, this.designationNumber, this.campaignPage).then(() => {
      this.saveStatus = 'success'
      this.loadingOverlay = false
    }, error => {
      this.saveStatus = 'failure'
      this.saveDesignationError = true
      this.loadingOverlay = false
      this.$log.error('Error saving designation editor content.', error)
      this.$window.scrollTo(0, 0)
    })
  }

  isPerson () {
    return this.designationContent && includes([
      'National Staff', 'Staff', 'Student', 'Volunteer', 'People', 'Paid Staff', 'Student Pool', 'Trip Participant'
    ], this.designationContent.designationType)
  }

  isMinistry () {
    return this.designationContent && includes([
      'Project', 'Scholarship', 'Ministry', 'Staff Pool', 'Student Operations'
    ], this.designationContent.designationType)
  }

  isCampaign () {
    return this.designationContent && includes([
      'Campaign'
    ], this.designationContent.designationType)
  }

  getImageUrls (obj) {
    const imageUrls = []
    if (obj) {
      Object.keys(obj).forEach(key => {
        if (angular.isObject(obj[key])) {
          imageUrls.push(...this.getImageUrls(obj[key]))
        }
        if (key === 'fileReference') {
          imageUrls.push(obj[key])
        }
      })
    }
    return imageUrls
  }

  carouselLoad () {
    if (!this.carouselLoaded) {
      this.$window.document.dispatchEvent(new Event('DOMContentLoaded', {
        bubbles: true,
        cancelable: true
      }))
      this.carouselLoaded = true
    }
  }
}

export default angular
  .module(componentName, [
    'environment',
    'ngSanitize',
    commonModule.name,
    sessionService.name,
    sessionEnforcerService.name,
    designationEditorService.name,
    titleModalController.name,
    pageOptionsModalController.name,
    personalOptionsModalController.name,
    photoModalController.name,
    textEditorModalController.name,
    websiteModalController.name,
    uibModal
  ])
  .component(componentName, {
    controller: DesignationEditorController,
    templateUrl: template
  })
