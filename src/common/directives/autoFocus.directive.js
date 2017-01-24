import angular from 'angular';

let directiveName = 'autoFocus';

/* @ngInject */
function desigSrc() {
  return {
    restrict: 'A',
    link:     function ( scope, element ) {
      element[0].focus();
    }
  };
}

export default angular
  .module( directiveName, [
  ] )
  .directive( directiveName, desigSrc );
