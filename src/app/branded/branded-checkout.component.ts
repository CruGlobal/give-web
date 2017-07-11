import { Component, Input, OnInit } from '@angular/core';

import commonModule from 'common/common.module';

import 'common/lib/fakeLocalStorage';

import * as template from './branded-checkout.tpl.html';

@Component({
  selector: 'give-branded-checkout',
  template: template,
})
export class BrandedCheckoutComponent implements OnInit {
  @Input() code: string = '2294554'; // TODO: remove for prod
  @Input() campaignCode: string;
  private checkoutStep: 'giftContactPayment' | 'review' | 'thankYou';

  constructor(private Window: Window) {}

  ngOnInit() {
    this.checkoutStep = 'giftContactPayment';
  }

  next() {
    switch (this.checkoutStep) {
      case 'giftContactPayment':
        this.checkoutStep = 'review';
        break;
      case 'review':
        this.checkoutStep = 'thankYou';
        break;
    }
    this.Window.scrollTo(0, 0);
  }

  previous() {
    switch (this.checkoutStep) {
      case 'review':
        this.checkoutStep = 'giftContactPayment';
        break;
    }
    this.Window.scrollTo(0, 0);
  }
}
