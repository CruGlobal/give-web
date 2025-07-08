import angular from 'angular';

const serviceName = 'modalStateService';

const ModalStateService = /* @ngInject */ function () {
  const MODAL_PARAM = 'modal';
  const registeredModals = {};

  this.registerModal = registerModal;

  function registerModal(name, injectableFn) {
    registeredModals[name] = injectableFn;
  }

  this.$get = /* @ngInject */ (
    $injector,
    $location,
    $document,
    $httpParamSerializer,
  ) => {
    return {
      name: name,
      invokeModal: invokeModal,
      urlFor: urlFor,
    };

    function invokeModal(name) {
      if (Object.prototype.hasOwnProperty.call(registeredModals, name)) {
        return $injector.invoke(registeredModals[name]);
      }
    }

    /**
     * Modal name getter/setter
     * @param name
     * @returns {*} current modal name or undefined
     */
    function name(name) {
      if (angular.isDefined(name)) {
        $location.search(MODAL_PARAM, name);
      }
      return $location.search()[MODAL_PARAM];
    }

    function urlFor(name, params, url) {
      const a = $document[0].createElement('a');
      params = angular.isDefined(params) ? params : $location.search();
      a.href = angular.isDefined(url) ? url : $location.absUrl();
      params[MODAL_PARAM] = name;
      a.search = $httpParamSerializer(params);
      return a.href;
    }
  };
};

const modalStateServiceRunner = /* @ngInject */ function (modalStateService) {
  const name = modalStateService.name();
  if (angular.isDefined(name) && name !== '') {
    modalStateService.invokeModal(name);
  }
};

export function scrollModalToTop() {
  const element = window.document.querySelector('.modal');
  element && (element.scrollTop = 0);
}

export default angular
  .module(serviceName, [])
  .provider(serviceName, ModalStateService)
  .run(modalStateServiceRunner);
