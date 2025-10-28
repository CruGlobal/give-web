import angular from 'angular';
import capitalize from 'lodash/capitalize';

const filterName = 'capitalize';

function Capitalize() {
  return (string) => capitalize(string);
}

export default angular.module(filterName, []).filter(filterName, Capitalize);
