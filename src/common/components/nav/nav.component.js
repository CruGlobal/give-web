import angular from 'angular';
import transform from 'lodash/transform';
import isObject from 'lodash/isObject';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import cartService from 'common/services/api/cart.service';
import loadingComponent from 'common/components/loading/loading.component';
import signInButton from 'common/components/signInButton/signInButton.component';
import mobileNavLevelComponent from './navMobileLevel.component';

import mobileTemplate from './mobileNav.tpl';

let componentName = 'nav';

class NavController{

  /* @ngInject */
  constructor($http, $document, $window, envService, cartService){
    this.$http = $http;
    this.$document = $document;
    this.$window = $window;
    this.cartService = cartService;
    this.imgDomain = envService.read('imgDomain');
    this.navFeed = envService.read('navFeed');
  }

  $onInit() {
    this.mobileMenuPath = [];

    // pre-set menu path like below
    // this.mobileMenuPath = ['opportunities', 'mission-trips', 'summer', 'explore', 'getting-a-job'];

    this.getNav().subscribe((structure) => {
      this.menuStructure = structure;
    });
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
        let menuStructure = replacePathDeep(jsonStructure['/content/cru/us/en'], {path: 'https://www.cru.org'});
        menuStructure.push({
          title: 'Give',
          path: '/give',
          children: replacePathDeep(jsonStructure['/content/give/us/en'], {path: 'https://give.cru.org'})
        });

        return menuStructure;
      });
  }

  loadCart() {
    this.cartService.get()
      .subscribe( ( data ) => {
        this.cartData = data;
      } );
  }

  toggleMenu(){
    this.mobileNavOpen = !this.mobileNavOpen;

    var body = angular.element(this.$document[0].body);
    body.toggleClass('body-scroll-lock');
  }

  cruSearch(term){
    this.$window.location.href = 'https://www.cru.org/search.' + encodeURIComponent(term) + '.html';
  }
}

export default angular
  .module(componentName, [
    'environment',
    mobileTemplate.name,
    cartService.name,
    loadingComponent.name,
    signInButton.name,
    mobileNavLevelComponent.name
  ])
  .component(componentName, {
    controller: NavController,
    templateUrl: mobileTemplate.name
  });
