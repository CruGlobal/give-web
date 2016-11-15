import angular from 'angular';
import MobileDetect from 'mobile-detect';
import transform from 'lodash/transform';
import isObject from 'lodash/isObject';
import includes from 'lodash/includes';
import find from 'lodash/find';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import cartService from 'common/services/api/cart.service';
import sessionService, {SignOutEvent} from 'common/services/session/session.service';
import sessionModalService from 'common/services/session/sessionModal.service';
import loadingComponent from 'common/components/loading/loading.component';
import mobileNavLevelComponent from './navMobileLevel.component';
import subNavDirective from './subNav.directive';
import {giftAddedEvent} from 'app/productConfig/productConfig.modal';

import mobileTemplate from './mobileNav.tpl';
import desktopTemplate from './desktopNav.tpl';

let componentName = 'cruNav';

class NavController{

  /* @ngInject */
  constructor($rootScope, $http, $document, $window, $timeout, envService, cartService, sessionService, sessionModalService){
    this.$http = $http;
    this.$document = $document;
    this.$window = $window;
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;

    this.cartService = cartService;
    this.sessionService = sessionService;
    this.sessionModalService = sessionModalService;

    this.imgDomain = envService.read('imgDomain');
    this.navFeed = envService.read('navFeed');
  }

  $onInit() {
    this.setMenuTemplate();

    this.menuPath = {
      main: [],
      sub: [],
      global: []
    };

    // pre-set menu path like below
    // this.menuPath.main = ['opportunities', 'mission-trips', 'summer', 'explore', 'getting-a-job'];
    // this.menuPath.sub = ['communities', 'campus'];

    this.getNav().subscribe((structure) => {
      this.menuStructure = structure;
      this.subMenuStructure = this.makeSubNav(structure.main, this.menuPath.sub);
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

  setMenuTemplate() {
    let md = new MobileDetect(this.$window.navigator ? this.$window.navigator.userAgent : '');

    this.menuType = md.phone() ? 'mobile' : 'desktop';
    this.templateUrl = this.menuType === 'mobile' ? mobileTemplate.name : desktopTemplate.name;

    //set viewport
    this.changeMetaTag('viewport', this.menuType === 'mobile' ? 'width=device-width, minimum-scale=1.0' : 'width=1024');
  }

  giftAddedToCart() {
    this.$window.scrollTo(0, 0);
    this.loadCart();
    this.cartOpen = true;
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
      } );
  }

  signOut() {
    this.sessionService.downgradeToGuest().subscribe(angular.noop);
  }

  signedOut( event ) {
    if(!event.defaultPrevented) {
      // use $timeout here as workaround to Firefox bug
      this.$timeout(() => this.$window.location.reload());
    }
  }

  sessionChanged() {
    this.isSignedIn = includes( ['IDENTIFIED', 'REGISTERED'], this.sessionService.getRole() );
  }

  getNav() {
    return Observable.from(this.$http({
      method: 'GET',
      url: this.navFeed,
      headers: {
        'Accept': undefined
      }
    }))
      .map((response) => {
        let replacePathDeep = function(obj, keysMap) {
          let replacePath = function(obj) {
            return transform(obj, function(result, value, key) {
              var newValue = keysMap[key] ? (keysMap[key] + value) : value;
              result[key] = isObject(value) ? replacePath(value) : newValue;
            });
          };

          return replacePath(obj);
        };

        let jsonStructure = angular.fromJson(response.data.jsonStructure);
        let menuStructure = {
          main: replacePathDeep(jsonStructure['/content/cru/us/en'], {path: 'https://www.cru.org', featuredPath: 'https://www.cru.org'}),
          global: jsonStructure['/content/cru/us/en/global']
        };

        //add give to main nav
        menuStructure.main.push({
          title: 'Give',
          path: '/give',
          children: replacePathDeep(jsonStructure['/content/give/us/en'], {path: 'https://give.cru.org'})
        });

        return menuStructure;
      });
  }

  makeSubNav(structure, path){
    let subNav = [];
    angular.forEach(path, function(p, index){
      let children = index ? subNav[index - 1].children : structure;
      subNav[index] = find(children, function(item) { return item.path.split('/').pop() === p; });
    });

    return subNav;
  }

  loadCart() {
    this.cartData = null;
    this.cartService.get()
      .subscribe( ( data ) => {
        this.cartData = data;
      } );
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
    this.$window.location.href = 'https://www.cru.org/search.' + encodeURIComponent(term) + '.html';
  }
}

export default angular
  .module(componentName, [
    'environment',
    mobileTemplate.name,
    desktopTemplate.name,
    cartService.name,
    loadingComponent.name,
    sessionService.name,
    sessionModalService.name,
    mobileNavLevelComponent.name,
    subNavDirective.name
  ])
  .component(componentName, {
    controller: NavController,
    template: '<ng-include src="$ctrl.templateUrl"></ng-include>'
  });
