import angular from 'angular';

let filterName = 'showErrors';

function ShowErrors(){
  // eslint-disable-next-line angular/no-private-call
  return (ngModelController) => (ngModelController.$touched || ngModelController.$$parentForm.$submitted) && ngModelController.$invalid;
}

export default angular
  .module(filterName, [

  ])
  .filter(filterName, ShowErrors);
