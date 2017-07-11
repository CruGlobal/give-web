import * as angular from 'angular';

import { NgModule, Directive, ElementRef, Injector, Input, Output, EventEmitter } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeComponent } from '@angular/upgrade/static';

import { BrandedCheckoutComponent } from './branded-checkout.component';

import step1 from './step-1/branded-checkout-step-1.component';
import step2 from './step-2/branded-checkout-step-2.component';
import thankYou from 'app/thankYou/thankYou.component';

export default angular.module('oldBrandedCheckout', [
  step1.name,
  step2.name,
  thankYou.name
]);

@Directive({
  selector: 'branded-checkout-step-1'
})
class BrandedCheckoutStep1Directive extends UpgradeComponent {
  @Input() code: string;
  @Input() campaignCode: string;
  @Output() next = new EventEmitter();
  constructor(elementRef: ElementRef, injector: Injector) {
    super(step1.name, elementRef, injector);
  }
}

@Directive({
  selector: 'branded-checkout-step-2'
})
class BrandedCheckoutStep2Directive extends UpgradeComponent {
  @Output() previous = new EventEmitter();
  @Output() next = new EventEmitter();
  constructor(elementRef: ElementRef, injector: Injector) {
    super(step2.name, elementRef, injector);
  }
}

@Directive({
  selector: 'thank-you'
})
class ThankYouDirective extends UpgradeComponent {
  @Input() disableAccountBenefits: boolean;
  constructor(elementRef: ElementRef, injector: Injector) {
    super(thankYou.name, elementRef, injector);
  }
}

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    BrandedCheckoutComponent,
    BrandedCheckoutStep1Directive,
    BrandedCheckoutStep2Directive,
    ThankYouDirective
  ],
  providers: [
    { provide: Window, useValue: window } // TODO: belongs in some common service
  ],
  bootstrap: [
    BrandedCheckoutComponent
  ]
})
export class BrandedCheckoutModule {}
