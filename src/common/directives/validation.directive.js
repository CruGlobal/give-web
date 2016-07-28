import angular from 'angular';

let directiveName = 'validation';

class Validation{

  /* @ngInject */
  constructor($scope, $element){
    this.$scope = $scope;
    this.$element = $element;
    this.waitForTouchOrSubmit();

    if(this.showError !== 'asClass'){
      this.$element.attr('style', 'display: none');
    }
  }

  waitForTouchOrSubmit(){
    let unregisterTouch = this.$scope.$watch('$ctrl.validation.$touched', (touched) => {
      if(touched === true) {
        unregisterTouch();
        unregisterSubmit();
        this.watchErrors();
      }
    });
    let unregisterSubmit = this.$scope.$watch('$ctrl.validation.$$parentForm.$submitted', (submitted) => {
      if(submitted === true) {
        unregisterTouch();
        unregisterSubmit();
        this.watchErrors();
      }
    });
  }

  watchErrors(){
    this.$scope.$watch('$ctrl.validation.$error', () => {
      if(this.showError === 'asClass') {
        if (this.validation.$valid === true) {
          this.$element.addClass('has-success');
          this.$element.removeClass('has-error');
        } else {
          this.$element.addClass('has-error');
          this.$element.removeClass('has-success');
        }
      } else {
        if (this.validation.$error[this.showError]) {
          this.$element.removeAttr('style');
        } else {
          this.$element.attr('style', 'display: none');
        }
      }
    }, true);
  }

}

export default angular
  .module(directiveName, [

  ])
  .directive(directiveName, () => ({
    restrict: 'A',
    controller: Validation,
    controllerAs: '$ctrl',
    bindToController: true,
    scope: {
      validation: '<',
      showError: '@'
    }
  }));
