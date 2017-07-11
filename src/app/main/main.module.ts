import 'common/polyfills';
import * as angular from 'angular';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule, downgradeComponent } from '@angular/upgrade/static';

import MainComponent from './main.component.js';

import { BrandedCheckoutModule } from 'app/branded/branded-checkout.module'
import { BrandedCheckoutComponent } from 'app/branded/branded-checkout.component';

angular.module('downgradedComponents', [])
  .directive(
    'giveBrandedCheckout',
    downgradeComponent({ component: BrandedCheckoutComponent }) as angular.IDirectiveFactory
  );

@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule,

    BrandedCheckoutModule
  ],
  declarations: [
    // TODO: move MainComponent here when it gets upgraded
  ]
})
export class MainModule {
  constructor(private upgrade: UpgradeModule) { }
  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, [MainComponent.name]);
  }
}

platformBrowserDynamic().bootstrapModule(MainModule);
