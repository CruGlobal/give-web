import angular from 'angular';
import 'angular-ordinal';
import 'angular-sanitize';

import indexOf from 'lodash/indexOf';
import find from 'lodash/find';
import omit from 'lodash/omit';
import map from 'lodash/map';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/do';

import designationsService from 'common/services/api/designations.service';
import cartService from 'common/services/api/cart.service';
import { possibleTransactionDays, startDate } from 'common/services/giftHelpers/giftDates.service';
import desigSrcDirective from 'common/directives/desigSrc.directive';
import showErrors from 'common/filters/showErrors.filter';
import { giftAddedEvent, cartUpdatedEvent } from 'common/components/nav/navCart/navCart.component';
import { giveGiftParams } from '../giveGiftParams';
import loading from 'common/components/loading/loading.component';
import analyticsFactory from 'app/analytics/analytics.factory';

import template from './productConfigForm.tpl.html';

const componentName = 'productConfigForm';


class ProductConfigFormController {

  /* @ngInject */
  constructor( $scope, $log, designationsService, cartService, commonService, analyticsFactory ) {
    this.$scope = $scope;
    this.$log = $log;
    this.designationsService = designationsService;
    this.cartService = cartService;
    this.commonService = commonService;
    this.possibleTransactionDays = possibleTransactionDays;
    this.startDate = startDate;
    this.analyticsFactory = analyticsFactory;

    this.selectableAmounts = [50, 100, 250, 500, 1000, 5000];
  }

  $onInit(){
    this.itemConfig = this.itemConfig || {};
    this.loadData();
    this.waitForFormInitialization();
  }

  $onChanges(changes) {
    if (changes.submitted && changes.submitted.currentValue === true) {
      this.saveGiftToCart();
    }
  }

  loadData(){
    this.loading = true;
    this.errorLoading = false;

    this.showRecipientComments = !!this.itemConfig['recipient-comments'];
    this.showDSComments = !!this.itemConfig['donation-services-comments'];

    const productLookupObservable = this.designationsService.productLookup( this.code )
      .do(productData => {
        this.productData = productData;
        this.setDefaultAmount();
        this.setDefaultFrequency();
      });

    const nextDrawDateObservable = this.commonService.getNextDrawDate()
      .do(nextDrawDate => {
        this.nextDrawDate = nextDrawDate;
        if(!this.itemConfig['recurring-day-of-month'] && this.nextDrawDate) {
          this.itemConfig['recurring-day-of-month'] = startDate(null, this.nextDrawDate).format('DD');
        }
      });

    const suggestedAmountsObservable = this.designationsService.suggestedAmounts(this.code, this.itemConfig)
      .do(suggestedAmounts => {
        this.suggestedAmounts = suggestedAmounts;
        this.useSuggestedAmounts = !isEmpty(this.suggestedAmounts);
      });

    Observable.merge(productLookupObservable, nextDrawDateObservable, suggestedAmountsObservable)
      .subscribe(null,
        error => {
          this.errorLoading = true;
          this.onStateChange({ state: 'errorLoading' });
          this.$log.error('Error loading data for product config form', error);
          this.loading = false;
        },
        () => {
          this.analyticsFactory.giveGiftModal(this.code);
          this.loading = false;
          this.onStateChange({ state: 'unsubmitted' });
        });
  }

  setDefaultAmount(){
    const amountOptions = isEmpty(this.suggestedAmounts) ?
      this.selectableAmounts :
      map(this.suggestedAmounts, 'amount');

    if(this.itemConfig.amount){
      if(amountOptions.indexOf(this.itemConfig.amount) === -1){
        this.changeCustomAmount(this.itemConfig.amount);
      }
    }else{
      this.itemConfig.amount = amountOptions[0];
    }
  }

  setDefaultFrequency() {
    if ( this.defaultFrequency ) {
      let frequency = find( this.productData.frequencies, ['name', this.defaultFrequency] );
      if ( frequency && frequency.selectAction ) {
        this.changeFrequency( frequency );
      }
    }
  }

  waitForFormInitialization() {
    let unregister = this.$scope.$watch('$ctrl.itemConfigForm.amount', () => {
      if(this.itemConfigForm && this.itemConfigForm.amount) {
        unregister();
        this.addCustomValidators();
      }
    });
  }

  addCustomValidators() {
    this.itemConfigForm.amount.$parsers.push(value => value.replace('$', '')); // Ignore a dollar sign if included by the user
    this.itemConfigForm.amount.$validators.minimum = value => {
      return !this.customInputActive || value*1.0 >= 1;
    };
    this.itemConfigForm.amount.$validators.maximum = value => {
      return !this.customInputActive || value*1.0 < 10000000;
    };
    this.itemConfigForm.amount.$validators.pattern = value => {
      const regex = /^([0-9]*)(\.[0-9]{1,2})?$/;
      return !this.customInputActive || regex.test(value);
    };
  }

  frequencyOrder( f ) {
    let order = ['NA', 'MON', 'QUARTERLY', 'ANNUAL'];
    return indexOf( order, f.name );
  }

  changeFrequency( product ) {
    if(product.name === this.productData.frequency) {
      // Do nothing if same frequency is selected
      return;
    }

    this.errorAlreadyInCart = false;
    this.errorChangingFrequency = false;
    const lastFrequency = this.productData.frequency;
    this.productData.frequency = product.name;
    this.updateQueryParam({ key: giveGiftParams.frequency, value: product.name });
    if(product.selectAction) {
      this.changingFrequency = true;
      this.onStateChange({ state: 'changingFrequency' });
      this.designationsService.productLookup(product.selectAction, true)
        .subscribe(data => {
            this.itemConfigForm.$setDirty();
            this.productData = data;
            this.changingFrequency = false;
            this.onStateChange({ state: 'unsubmitted' });
          },
          error => {
            this.$log.error('Error loading new product when changing frequency', error);
            this.errorChangingFrequency = true;
            this.productData.frequency = lastFrequency;
            this.updateQueryParam({ key: giveGiftParams.frequency, value: lastFrequency });
            this.changingFrequency = false;
            this.onStateChange({ state: 'unsubmitted' });
          });
    }
  }

  changeAmount( amount ) {
    this.itemConfigForm.$setDirty();
    this.itemConfig.amount = amount;
    this.customAmount = '';
    this.customInputActive = false;
    this.updateQueryParam({ key: giveGiftParams.amount, value: amount });
  }

  changeCustomAmount( amount ) {
    this.itemConfig.amount = amount;
    this.customAmount = amount;
    this.customInputActive = true;
    this.updateQueryParam({ key: giveGiftParams.amount, value: amount });
  }

  changeStartDay( day ) {
    this.errorAlreadyInCart = false;
    this.updateQueryParam({ key: giveGiftParams.day, value: day });
  }

  saveGiftToCart() {
    this.itemConfigForm.$setSubmitted();
    this.submittingGift = false;
    this.errorAlreadyInCart = false;
    this.errorSavingGeneric = false;
    if ( !this.itemConfigForm.$valid ) {
      return;
    }
    this.submittingGift = true;
    this.onStateChange({ state: 'submitting' });

    let data = this.productData.frequency === 'NA' ? omit( this.itemConfig, 'recurring-day-of-month' ) : this.itemConfig;

    let savingObservable = this.isEdit ?
      this.cartService.editItem( this.uri, this.productData.uri, data ) :
      this.cartService.addItem( this.productData.uri, data, this.disableSessionRestart );

    savingObservable.subscribe( data => {
      if ( this.isEdit ) {
        this.$scope.$emit( cartUpdatedEvent );
      } else {
        this.$scope.$emit( giftAddedEvent );
        this.analyticsFactory.cartAdd(this.itemConfig, this.productData, 'cart modal');
      }
      this.uri = data.self.uri;
      this.submittingGift = false;
      this.onStateChange({ state: 'submitted' });
    }, error => {
      if(includes(error.data, 'already in the cart')){
        this.errorAlreadyInCart = true;
        this.onStateChange({ state: 'errorAlreadyInCart' });
      }else{
        this.errorSavingGeneric = true;
        this.$log.error('Error adding or updating item in cart', error);
        this.onStateChange({ state: 'errorSubmitting' });
      }
      this.submittingGift = false;
    } );
  }

  displayId() {
    if(!this.productData){
      return '';
    }
    let value = `#${this.productData.designationNumber}`;
    if(this.productData.displayName !== this.itemConfig['jcr-title'] && this.itemConfig['campaign-page']) {
      value += ` - ${this.productData.displayName}`;
    }
    return value;
  }
}

export default angular
  .module( componentName, [
    'ordinal',
    'ngSanitize',
    designationsService.name,
    cartService.name,
    desigSrcDirective.name,
    showErrors.name,
    loading.name,
    analyticsFactory.name
  ] )
  .component( componentName, {
    controller:  ProductConfigFormController,
    template: template,
    bindings:    {
      code: '<',
      itemConfig: '<',
      isEdit: '<',
      uri: '<',
      defaultFrequency: '<',
      disableSessionRestart: '@',
      updateQueryParam: '&',
      submitted: '<',
      onStateChange: '&'
    }
  } );
