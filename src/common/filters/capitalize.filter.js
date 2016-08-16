import angular from 'angular';
import capitalize from 'lodash/capitalize';

let filterName = 'capitalize';

function Capitalize(){
  return (string) => capitalize(string);
}

export default angular
  .module(filterName, [

  ])
  .filter(filterName, Capitalize);
