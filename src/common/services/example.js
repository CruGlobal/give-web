import angular from 'angular';

class ExampleService{

  /*@ngInject*/
  constructor($q){
    this.$q = $q;
  }

  getUser(){
    var deferred = this.$q.defer();

    deferred.resolve({
      name: 'Panda'
    });

    return deferred.promise;
  }
}

export default angular
  .module('exampleService', [])
  .factory('ExampleService', ExampleService);
