import angular from 'angular';
let serviceName = 'modalStateService';

/*@ngInject*/
function ModalStateService() {
  const MODAL_PARAM = 'modal';
  let registeredModals = {};

  this.registerModal = registerModal;

  function registerModal( name, injectableFn ) {
    registeredModals[name] = injectableFn;
  }

  /*@ngInject*/
  this.$get = function ( $injector, $location, $document, $httpParamSerializer ) {
    return {
      name:        name,
      invokeModal: invokeModal,
      urlFor:      urlFor
    };

    function invokeModal( name ) {
      if ( registeredModals.hasOwnProperty( name ) ) {
        return $injector.invoke( registeredModals[name] );
      }
    }

    /**
     * Modal name getter/setter
     * @param name
     * @returns {*} current modal name or undefined
     */
    function name( name ) {
      if ( angular.isDefined( name ) ) {
        $location.search( MODAL_PARAM, name );
      }
      return $location.search()[MODAL_PARAM];
    }

    function urlFor( name, params, url ) {
      let a = $document[0].createElement( 'a' );
      params = angular.isDefined( params ) ? params : $location.search();
      a.href = angular.isDefined( url ) ? url : $location.absUrl();
      params[MODAL_PARAM] = name;
      a.search = $httpParamSerializer( params );
      return a.href;
    }
  };
}

/*@ngInject*/
function modalStateServiceRunner( modalStateService ) {
  let name = modalStateService.name();
  if ( angular.isDefined( name ) && name !== "" ) {
    modalStateService.invokeModal( name );
  }
}

export default angular
  .module( serviceName, [] )
  .provider( serviceName, ModalStateService )
  .run( modalStateServiceRunner );
