import './polyfills';
import 'angular';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import MainComponent from './main.component.js';

@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule
  ]
})
class MainModule {
  constructor(private upgrade: UpgradeModule) { }
  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, [MainComponent.name]);
  }
}



platformBrowserDynamic().bootstrapModule(MainModule);

