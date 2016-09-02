import angular from 'angular';
let serviceName = 'modalStateService';

/*@ngInject*/
function ModalStateService() {
  let registeredModals = {};

  this.registerModal = registerModal;

  function registerModal( name, injectableFn ) {
    registeredModals[name] = injectableFn;
  }

  /*@ngInject*/
  this.$get = function ( $injector, $location, $rootScope ) {
    let modalParams = $location.search();

    // eslint-disable-next-line angular/on-watch
    $rootScope.$watch( () => modalParams, syncModalParams, true );

    return {
      params:      modalParams,
      setParams:   setModalParams,
      setName:     setModalName,
      invokeModal: invokeModal
    };

    function invokeModal( name ) {
      if ( registeredModals.hasOwnProperty( name ) ) {
        return $injector.invoke( registeredModals[name] );
      }
    }

    function setModalName( name ) {
      $location.hash( angular.isDefined( name ) ? name : '' );
    }

    function setModalParams( params ) {
      params = angular.isDefined( params ) ? params : {};
      angular.copy( params, modalParams );
    }

    // Syncs modalParams with $location query params
    function syncModalParams( params ) {
      if ( angular.isUndefined( params ) ) {
        return;
      }

      $location.search( '' );
      angular.forEach( params, ( value, key ) => {
        $location.search( key, value );
      } );
    }
  };
}

/*@ngInject*/
function modalStateServiceRunner( $location, modalStateService ) {
  let name = $location.hash();
  if ( angular.isDefined( name ) && name !== "" ) {
    modalStateService.invokeModal( name );
  }
}

export default angular
  .module( serviceName, [] )
  .provider( serviceName, ModalStateService )
  .run( modalStateServiceRunner );
