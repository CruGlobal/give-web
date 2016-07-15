export default class LoginController{

  /* @ngInject */
  constructor($scope, $document){
    $scope.loggedin = false;

    $scope.$watch('theme', function(newVal){
      if(!newVal) return;
      System.import('assets/' + newVal + '.css!').then(() => {
          angular.element($document.body).addClass(newVal);
      });
    });
  }

}
