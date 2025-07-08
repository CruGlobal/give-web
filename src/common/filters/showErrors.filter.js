import angular from 'angular';

const filterName = 'showErrors';

function ShowErrors() {
  return (ngModelController) =>
    ngModelController !== undefined &&
    (ngModelController.$touched || ngModelController.$$parentForm.$submitted) &&
    ngModelController.$invalid;
}

export default angular.module(filterName, []).filter(filterName, ShowErrors);
