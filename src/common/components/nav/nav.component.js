import angular from 'angular';
import 'ng-resize';
import includes from 'lodash/includes';
import find from 'lodash/find';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/defer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';

import loading from 'common/components/loading/loading.component';
import sessionService, {SignOutEvent} from 'common/services/session/session.service';
import sessionModalService from 'common/services/session/sessionModal.service';
import mobileNavLevelComponent from './navMobileLevel.component';
import subNavDirective from './subNav.directive';
import {giftAddedEvent} from 'common/components/nav/navCart/navCart.component';
import globalWebsitesModalWindowTemplate from './globalWebsitesModal/globalWebsitesModalWindow.tpl.html';
import globalWebsitesModal from './globalWebsitesModal/globalWebsitesModal.component';
import navCart, {cartUpdatedEvent} from 'common/components/nav/navCart/navCart.component';
import autoFocus from 'common/directives/autoFocus.directive';

import mobileTemplate from './mobileNav.tpl.html';
import desktopTemplate from './desktopNav.tpl.html';
import signOutTemplate from './signOut.modal.tpl.html';

let componentName = 'cruNav';

class NavController{

  /* @ngInject */
  constructor($log, $rootScope, $http, $document, $window, $uibModal, $timeout, envService, sessionService, sessionModalService){
    this.$log = $log;
    this.$http = $http;
    this.$document = $document;
    this.$uibModal = $uibModal;
    this.$window = $window;
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;

    this.sessionService = sessionService;
    this.sessionModalService = sessionModalService;

    this.imgDomain = envService.read('imgDomain');
    this.publicCru = envService.read('publicCru');
  }

  $onInit() {
    this.defineAttributes();
    this.setMenuTemplate();

    this.menuPath = {
      main: [],
      sub: [],
      global: []
    };

    // set sub menu path based on url path
    let path = this.$window.location.pathname ? this.$window.location.pathname.replace('.html', '').split('/') : [];
    path.splice(0, this.submenuSkipLevels + 1);
    this.menuPath.currentPage = angular.copy(path).pop();
    this.menuPath.sub = path.slice(0, 3);

    this.getNav().subscribe((structure) => {
        this.menuStructure = structure;

        if(this.$window.location.hostname && includes(this.$window.location.hostname, 'give')){
          this.subMenuStructure = [{
            title: 'Give',
            path: '/',
            children: structure.give
          }];
          this.menuPath.sub = ['give'];
        }else{
          this.subMenuStructure = this.makeSubNav(structure.main, this.menuPath.sub);
        }
      },
      error => {
        if(error && error.status === -1){
          this.$log.warn('Aborted or timed out request while loading the nav.', error);
        }else{
          this.$log.error('Error loading the nav.', error);
        }
      });

    this.subscription = this.sessionService.sessionSubject.subscribe( () => this.sessionChanged() );

    this.$rootScope.$on(giftAddedEvent, () => this.giftAddedToCart() );
    // Register signedOut event on child scope
    // this basically sets the listener at a lower priority, allowing $rootScope listeners first chance to respond
    this.$rootScope.$new(true, this.$rootScope).$on(SignOutEvent, (event) => this.signedOut(event) );
  }

  $onDestroy() {
    this.subscription.unsubscribe();
  }

  defineAttributes() {
    this.submenuSkipLevels = Number(this.submenuSkipLevels) || 0;
    this.navFeed = this.navFeed || '/bin/cru/site-nav.json';
    this.searchResultsPath = this.searchResultsPath || 'https://www.cru.org/search.html';
    this.pullRightOptions = this.pullRightOptions || [{
        title: 'Find Cru Near Me',
        path: 'https://www.cru.org/communities/locations.html',
        class: 'nav-near-me'
      }, {
        title: 'Cru Around the World',
        class: 'nav-globe'
      }];
  }

  setMenuTemplate() {
    this.menuType = this.$window.innerWidth < 991 ? 'mobile' : 'desktop';
    this.templateUrl = this.menuType === 'mobile' ? mobileTemplate : desktopTemplate;

    //set viewport
    this.changeMetaTag('viewport', this.menuType === 'mobile' ? 'width=device-width, minimum-scale=1.0' : 'width=1024');
  }

  giftAddedToCart() {
    if(this.menuType === 'mobile'){
      this.mobileNavOpen = true;
      this.mobileTab = 'cart';
    }else{
      this.$window.scrollTo(0, 0);
      this.cartOpen = true;
    }
  }

  cartOpened(){
    if(!this.cartOpenedPreviously){ // Load cart on initial open only. Events will take care of other reloads
      this.cartOpenedPreviously = true;
      this.$rootScope.$emit( cartUpdatedEvent );
    }
  }

  changeMetaTag(tag, content) {
    let metas = this.$document[0].getElementsByTagName('meta');
    for (var i=0; i<metas.length; i++) {
      if (metas[i].getAttribute('name') && metas[i].getAttribute('name') === tag) {
        metas[i].setAttribute('content', content);
      }
    }
  }

  signIn() {
    this.sessionModalService
      .signIn()
      .then( () => {
        // use $timeout here as workaround to Firefox bug
        this.$timeout(() => this.$window.location.reload());
      }, angular.noop );
  }

  signOut() {
    let modal = this.$uibModal.open({
      templateUrl: signOutTemplate,
      backdrop: 'static',
      keyboard: false,
      size: 'sm'
    });
    this.sessionService[this.customProfile ? 'signOut' : 'downgradeToGuest']().subscribe(() => {
      modal.close();
      this.signedOut( {} );
    }, angular.noop);
  }

  signedOut( event ) {
    if(!event.defaultPrevented) {
      // use $timeout here as workaround to Firefox bug
      this.$timeout(() => this.$window.location.reload());
    }
  }

  sessionChanged() {
    this.isSignedIn = (this.customProfile && this.sessionService.session.email) ||
      includes(['IDENTIFIED', 'REGISTERED'], this.sessionService.getRole());
  }

  getNav() {
    return Observable.defer(() => this.$http({
      method: 'GET',
      url: this.navFeed
    }))
      .retry(1)
      .map((response) => {
        let jsonStructure = response.data;
        let menuStructure = {
          main: jsonStructure['/content/cru/us/en'] || jsonStructure['main'],
          global: jsonStructure['/content/cru/us/en/global'],
          give: jsonStructure['/content/give/us/en']
        };

        //add give to main nav
        if(jsonStructure['/content/cru/us/en']){
          menuStructure.main.push({
            title: 'Give',
            path: '/give',
            children: jsonStructure['/content/give/us/en']
          });
        }

        return menuStructure;
      });
  }

  makeSubNav(structure, path){
    let subNav = [];
    angular.forEach(path, function(p, index){
      if(index && !subNav[index - 1]){ return; }
      let children = index ? subNav[index - 1].children : structure;

      let navItem = find(children, function(item) { return item.path.split('/').pop().replace('.html', '') === p; });
      if(navItem){ subNav[index] = navItem; }
    });

    if(subNav.length && !subNav[subNav.length - 1].children){
      subNav.pop();
    }

    return subNav;
  }

  toggleMenu(value){
    this.mobileNavOpen = value;
    this.desktopSearch = value;

    var body = angular.element(this.$document[0].body);
    if(value){
      body.addClass('body-scroll-lock');
    }else{
      body.removeClass('body-scroll-lock');
    }
  }

  cruSearch(term){
    this.$window.location = this.searchResultsPath + '?q=' + encodeURIComponent(term);
  }

  openGlobalWebsitesModal(){
    this.$uibModal.open({
      component: 'globalWebsitesModal',
      backdrop: 'static',
      windowTemplateUrl: globalWebsitesModalWindowTemplate,
      windowClass: 'globalWebsites--is-open',
      resolve: {
        menuStructure: this.menuStructure
      }
    });
  }
}

export default angular
  .module(componentName, [
    'environment',
    'ngResize',
    sessionService.name,
    sessionModalService.name,
    mobileNavLevelComponent.name,
    subNavDirective.name,
    globalWebsitesModal.name,
    navCart.name,
    loading.name,
    autoFocus.name
  ])
  .component(componentName, {
    controller: NavController,
    template: '<ng-include src="$ctrl.templateUrl" ng-resize="$ctrl.setMenuTemplate()"></ng-include>',
    bindings: {
      navFeed: '@navigationEndpoint',
      submenuSkipLevels: '@',
      searchResultsPath: '@',
      editProfilePath: '@',
      customProfile: '<',
      pullRightOptions: '<'
    }
  });
