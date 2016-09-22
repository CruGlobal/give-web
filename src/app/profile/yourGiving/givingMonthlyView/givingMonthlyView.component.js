import angular from 'angular';
import loadingComponent from 'common/components/loading/loading.component';
import profileService from 'common/services/api/profile.service';
import template from './givingMonthlyView.tpl';

let componentName = 'givingMonthlyView';

class GivingMonthlyView {

  /* @ngInject */
  constructor( profileService ) {
    this.profileService = profileService;
  }
}
export default angular
  .module( componentName, [
    loadingComponent.name,
    profileService.name,
    template.name
  ] )
  .component( componentName, {
    controller:  GivingMonthlyView,
    templateUrl: template.name,
    bindings:    {
      filters: '<'
    }
  } );
