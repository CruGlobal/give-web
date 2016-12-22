import angular from 'angular';
import 'angular-sanitize';
import 'angular-ui-bootstrap';
import find from 'lodash/find';

import commonModule from 'common/common.module';
import sessionEnforcerService, {EnforcerCallbacks, EnforcerModes} from 'common/services/session/sessionEnforcer.service';
import sessionService, {Roles} from 'common/services/session/session.service';
import designationEditorService from 'common/services/api/designationEditor.service';

import titleModalController from './titleModal/title.modal';
import pageOptionsModalController from './pageOptionsModal/pageOptions.modal';
import photoModalController from './photoModal/photo.modal';
import textEditorModalController from './textEditorModal/textEditor.modal';
import websiteModalController from './websiteModal/website.modal';

import template from './designationEditor.tpl';
import titleModalTemplate from './titleModal/titleModal.tpl';
import pageOptionsModalTemplate from './pageOptionsModal/pageOptionsModal.tpl';
import photoModalTemplate from './photoModal/photoModal.tpl';
import textEditorModalTemplate from './textEditorModal/textEditorModal.tpl';
import websiteModalTemplate from './websiteModal/websiteModal.tpl';

let componentName = 'designationEditor';

class DesignationEditorController {

  /* @ngInject */
  constructor( $log, $q, $uibModal, $location, $window, envService, sessionService, sessionEnforcerService, designationEditorService ) {
    this.$log = $log;
    this.sessionService = sessionService;
    this.sessionEnforcerService = sessionEnforcerService;
    this.designationEditorService = designationEditorService;

    this.imgDomain = envService.read('imgDomain');
    this.imgDomainDesignation = envService.read('imgDomainDesignation');

    this.$location = $location;
    this.$q = $q;
    this.$uibModal = $uibModal;
    this.$window = $window;
  }

  $onInit() {
    this.designationNumber = this.$location.search().d;
    this.campaignPage = this.$location.search().campaign;

    // designationNumber is required
    if(angular.isUndefined(this.designationNumber)) {
      this.$window.location = '/';
    }

    this.enforcerId = this.sessionEnforcerService( [Roles.registered], {
      [EnforcerCallbacks.signIn]: () => {
        this.getDesignationContent();
      },
      [EnforcerCallbacks.cancel]: () => {
        // Authentication failure
        this.$window.location = '/';
      }
    }, EnforcerModes.session );
  }

  $onDestroy() {
    // Destroy enforcer
    this.sessionEnforcerService.cancel( this.enforcerId );
  }

  getDesignationContent() {
    if(!this.designationNumber){ return; }
    this.loadingContentError = false;
    this.contentLoaded = false;
    this.loadingOverlay = true;

    return this.$q.all([
      //get designation content
      this.designationEditorService.getContent(this.designationNumber, this.campaignPage),
      //get designation photos
      this.designationEditorService.getPhotos(this.designationNumber, this.campaignPage)
    ]).then(responses => {
      this.contentLoaded = true;
      this.loadingOverlay = false;
      this.designationContent = responses[0].data;
      this.designationPhotos = responses[1].data;
    }, error => {
      this.contentLoaded = false;
      this.loadingOverlay = false;
      this.loadingContentError = true;
      this.$log.error('Error loading designation content or photos.', error);
    });
  }

  editTitle() {
    let modalOptions = {
      templateUrl: titleModalTemplate.name,
      controller: titleModalController.name,
      controllerAs: '$ctrl',
      resolve : {
        receiptTitle: () => {
          return this.designationContent.designationName;
        },
        giveTitle: () => {
          return this.designationContent.title;
        }
      }
    };
    this.$uibModal.open( modalOptions ).result
      .then( (title) => {
        this.designationContent.title = title;
        this.save();
      }, angular.noop );
  }

  editPageOptions() {
    let modalOptions = {
      templateUrl: pageOptionsModalTemplate.name,
      controller: pageOptionsModalController.name,
      controllerAs: '$ctrl',
      resolve : {
        parentDesignationNumber: () => {
          return this.designationContent.parentDesignationNumber;
        },
        designationType: () => {
          return this.designationContent.designationType;
        },
        organizationId: () => {
          return this.designationContent.organizationId;
        },
        suggestedAmounts: () => {
          return this.designationContent.suggestedAmounts;
        }
      }
    };
    this.$uibModal.open( modalOptions ).result
      .then( (data) => {
        this.designationContent.parentDesignationNumber = data.parentDesignationNumber;
        this.designationContent.suggestedAmounts = data.suggestedAmounts;
        this.save();
      }, angular.noop );
  }

  selectPhoto(photoLocation, selectedPhoto) {
    let modalOptions = {
      templateUrl: photoModalTemplate.name,
      controller: photoModalController.name,
      controllerAs: '$ctrl',
      resolve: {
        designationNumber: () => { return this.designationContent.designationNumber; },
        campaignPage: () => { return this.campaignPage; },
        photos: () => { return this.designationPhotos; },
        photoLocation: () => { return photoLocation; },
        selectedPhoto: () => { return selectedPhoto; }
      }
    };
    this.$uibModal.open( modalOptions ).result.then( (data) => {
      this.designationContent[photoLocation] = data.selected;
      this.designationPhotos = data.photos;
      this.save();
    }, angular.noop );
  }

  photoUrl(originalUrl) {
    return find(this.designationPhotos, {'original': originalUrl});
  }

  editText(field) {
    let modalOptions = {
      templateUrl:       textEditorModalTemplate.name,
      controller:        textEditorModalController.name,
      controllerAs:      '$ctrl',
      resolve : {
        initialText: () => {
          return this.designationContent[field];
        }
      }
    };
    this.$uibModal.open( modalOptions ).result.then( (text) => {
      this.designationContent[field] = text;
      this.save();
    }, angular.noop );
  }

  editWebsite() {
    let modalOptions = {
      templateUrl:       websiteModalTemplate.name,
      controller:        websiteModalController.name,
      controllerAs:      '$ctrl',
      resolve : {
        initialWebsite: () => {
          return this.designationContent.websiteURL;
        }
      }
    };
    this.$uibModal.open( modalOptions ).result
      .then( (websiteURL) => {
        this.designationContent.websiteURL = websiteURL;
        this.save();
      }, angular.noop );
  }

  save() {
    this.loadingOverlay = true;
    this.saveDesignationError = false;

    return this.designationEditorService.save(this.designationContent).then(() => {
      this.saveStatus = 'success';
      this.loadingOverlay = false;
    }, error => {
      this.saveStatus = 'failure';
      this.saveDesignationError = true;
      this.loadingOverlay = false;
      this.$log.error('Error saving designation editor content.', error);
    });
  }
}

export default angular
  .module( componentName, [
    'environment',
    'ngSanitize',
    commonModule.name,
    sessionService.name,
    sessionEnforcerService.name,
    designationEditorService.name,
    template.name,

    titleModalTemplate.name,
    titleModalController.name,

    pageOptionsModalTemplate.name,
    pageOptionsModalController.name,

    photoModalTemplate.name,
    photoModalController.name,

    textEditorModalTemplate.name,
    textEditorModalController.name,

    websiteModalTemplate.name,
    websiteModalController.name
  ] )
  .component( componentName, {
    controller:  DesignationEditorController,
    templateUrl: template.name
  } );
