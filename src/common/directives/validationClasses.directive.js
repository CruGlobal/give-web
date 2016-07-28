import angular from 'angular';

let directiveName = 'validationClasses';

class ValidationClasses{

  /* @ngInject */
  constructor($scope, $element){
    this.$scope = $scope;
    this.$element = $element;
    this.waitForTouchOrSubmit();
  }

  waitForTouchOrSubmit(){
    let unregisterTouch = this.$scope.$watch('$ctrl.validationClasses.$touched', (touched) => {
      if(touched === true) {
        unregisterTouch();
        unregisterSubmit();
        this.watchValidity();
      }
    });
    let unregisterSubmit = this.$scope.$watch('$ctrl.validationClasses.$$parentForm.$submitted', (submitted) => {
      if(submitted === true) {
        unregisterTouch();
        unregisterSubmit();
        this.watchValidity();
      }
    });
  }

  watchValidity(){
    this.$scope.$watch('$ctrl.validationClasses.$valid', (valid) => {
      if(valid === true) {
        this.$element.addClass('has-success');
        this.$element.removeClass('has-error');
      }else{
        this.$element.addClass('has-error');
        this.$element.removeClass('has-success');
      }
    });
  }

}

export default angular
  .module(directiveName, [

  ])
  .directive(directiveName, () => ({
    restrict: 'A',
    controller: ValidationClasses,
    controllerAs: '$ctrl',
    bindToController: true,
    scope: {
      validationClasses: '='
    }
  }));
