import 'babel/external-helpers';
import angular from 'angular';
import 'rxjs/add/operator/finally';

import appConfig from 'common/app.config';

import step1 from './step-1/step-1.component';
import step2 from './step-2/step-2.component';
import step3 from './step-3/step-3.component';
import cartSummary from './cart-summary/cart-summary.component';
import help from './help/help.component';
import loadingComponent from 'common/components/loading/loading.component';

import showErrors from 'common/filters/showErrors.filter';

import cartService from 'common/services/api/cart.service';
import designationsService from 'common/services/api/designations.service';
import commonModule from 'common/common.module';

import sessionEnforcerService, {EnforcerCallbacks} from 'common/services/session/sessionEnforcer.service';
import {Roles} from 'common/services/session/session.service';

import analyticsModule from 'app/analytics/analytics.module';
import analyticsFactory from 'app/analytics/analytics.factory';

import template from './checkout.tpl';

let componentName = 'checkout';

class CheckoutController{

  /* @ngInject */
  constructor($window, $location, $rootScope, $log, cartService, designationsService, sessionEnforcerService, analyticsFactory){
    this.$log = $log;
    this.$window = $window;
    this.$location = $location;
    this.$rootScope = $rootScope;
    this.cartService = cartService;
    this.designationsService = designationsService;
    this.sessionEnforcerService = sessionEnforcerService;
    this.loadingCartData = true;
    this.analyticsFactory = analyticsFactory;
  }

  $onInit() {
    this.enforcerId = this.sessionEnforcerService([Roles.public, Roles.registered], {
      [EnforcerCallbacks.signIn]: () => {
        this.loadCart();
      },
      [EnforcerCallbacks.cancel]: () => {
        this.$window.location = 'cart.html';
      }
    });
    this.initStepParam();
  }

  $onDestroy() {
    this.sessionEnforcerService.cancel(this.enforcerId);
    this.$locationChangeSuccessListener && this.$locationChangeSuccessListener();
  }

  initStepParam(){
    this.changeStep(this.$location.search().step || 'contact');
    this.$location.replace();
    this.$locationChangeSuccessListener = this.$locationChangeSuccessListener || this.$rootScope.$on('$locationChangeSuccess', () => {
      this.initStepParam();
    });
  }

  changeStep(newStep){
    this.$window.scrollTo(0, 0);
    this.checkoutStep = newStep;
    this.$location.search('step', this.checkoutStep);
  }

  loadCart(){
    this.cartService.get()
      .finally(()=> {
        this.loadingCartData = false;
      })
      .subscribe((data) => {
          this.cartData = data;
          this.analyticsFactory.pageLoaded();
          this.analyticsFactory.viewCart(data);
        },
        (error) => {
          this.$log.error("Error loading cart", error);
        });
  }
}

export default angular
  .module(componentName, [
    commonModule.name,
    template.name,
    appConfig.name,
    step1.name,
    step2.name,
    step3.name,
    help.name,
    cartSummary.name,
    cartService.name,
    designationsService.name,
    sessionEnforcerService.name,
    showErrors.name,
    loadingComponent.name,
    analyticsFactory.name
  ])
  .component(componentName, {
    controller: CheckoutController,
    templateUrl: template.name
  });
