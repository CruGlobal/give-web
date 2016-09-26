import angular from 'angular';
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
  constructor($http, $document, envService, cartService){
    this.$http = $http;
    this.$document = $document;
    this.cartService = cartService;
    this.imgDomain = envService.read('imgDomain');
    this.navFeed = envService.read('navFeed');
  }

  $onInit() {
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
        let structure = angular.fromJson(response.data.jsonStructure);
        return structure['/content/cru/us/en'];
      });
  }

  loadCart() {
    return this.cartService.get()
      .subscribe( ( data ) => {
        this.cartData = data;
      } );
  }

  toggleMenu(){
    this.mobileNavOpen = !this.mobileNavOpen;

    var body = angular.element(this.$document[0].body);
    body.toggleClass('body-scroll-lock');
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
