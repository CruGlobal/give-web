import angular from 'angular';
import 'angular-sanitize';
import 'angular-ui-bootstrap';
import find from 'lodash/find';

import commonModule from 'common/common.module';
import sessionService from 'common/services/session/session.service';
import sessionModalService from 'common/services/session/sessionModal.service';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';

import titleModalController from './titleModal/title.modal';
import pageOptionsModalController from './pageOptionsModal/pageOptions.modal';
import photoModalController from './photoModal/photoModal.modal';
import textEditorModalController from './textEditorModal/textEditor.modal';
import websiteModalController from './websiteModal/website.modal';

import template from './designationEditor.tpl';
import titleModalTemplate from './titleModal/titleModal.tpl';
import pageOptionsModalTemplate from './pageOptionsModal/pageOptionsModal.tpl';
import photoModalTemplate from './photoModal/photoModal.tpl';
import textEditorModalTemplate from './textEditorModal/textEditorModal.tpl';
import websiteModalTemplate from './websiteModal/websiteModal.tpl';

const designationSecurityEndpoint = '/bin/crugive/designation-security';
const designationImagesEndpoint = '/bin/crugive/image';
const saveEndpoint = '/bin/crugive/upsert';

let componentName = 'designationEditor';

class DesignationEditorController {

  /* @ngInject */
  constructor( $http, $q, $uibModal, $location, envService, sessionService, sessionModalService ) {
    this.sessionService = sessionService;
    this.sessionModalService = sessionModalService;
    this.imgDomain = envService.read('imgDomain');
    this.imgDomainDesignation = envService.read('imgDomainDesignation');
    this.$http = $http;
    this.$q = $q;
    this.$uibModal = $uibModal;

    this.designationNumber = $location.search().d;
  }

  $onInit() {
    if(this.sessionService.getRole() !== 'REGISTERED'){
      this.sessionModalService
        .signIn()
        .then( () => {
          this.getDesignationContent();
        } );
    }else{
      this.getDesignationContent();
    }
  }

  getDesignationContent() {
    if(!this.designationNumber){ return; }
    this.loadingOverlay = true;

    this.$q.all([
      //get designation content
      this.$http.get(designationSecurityEndpoint, {
        params: {
          designationNumber: this.designationNumber
        },
        withCredentials: true
      }).then((response) => {
        this.designationContent = response.data;
      }),

      //get designation photos
      this.$http.get(designationImagesEndpoint, {
        params: {
          designationNumber: this.designationNumber
        },
        withCredentials: true
      }).then((response) => {
        this.designationPhotos = response.data;
      })
    ]).then(() => {
      this.loadingOverlay = false;
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
      });
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
        organizationId: () => {
          return this.designationContent.organizationId;
        },
        suggestedAmounts: () => {
          return this.designationContent.suggestedAmounts;
        }
      }
    };
    this.$uibModal.open( modalOptions ).result
      .then( (parentDesignationNumber) => {
        this.designationContent.parentDesignationNumber = parentDesignationNumber;
        // this.designationContent.suggestedAmounts = suggestedAmounts;
      });
  }

  selectPhoto(photoLocation, selectedPhoto) {
    let modalOptions = {
      templateUrl: photoModalTemplate.name,
      controller: photoModalController.name,
      controllerAs: '$ctrl',
      resolve: {
        designationNumber: () => { return this.designationContent.designationNumber; },
        photos: () => { return this.designationPhotos; },
        photoLocation: () => { return photoLocation; },
        selectedPhoto: () => { return selectedPhoto; }
      }
    };
    this.$uibModal.open( modalOptions ).result.then( (photo) => {
      this.designationContent[photoLocation] = photo;
    });
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
    });
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
      });
  }

  save() {
    this.$http.post(saveEndpoint, this.designationContent, {
      withCredentials: true
    }).then(() => {
      alert('Changes saved.');
    }, () => {
      alert('An error has occurred.');
    });
  }
}

export default angular
  .module( componentName, [
    'environment',
    'ngSanitize',
    commonModule.name,
    sessionService.name,
    sessionModalService.name,
    loadingOverlay.name,
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
