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
  this.$get = function ( $injector, $location ) {
    return {
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
