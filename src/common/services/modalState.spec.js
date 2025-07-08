import angular from 'angular';
import 'angular-mocks';
import module, { scrollModalToTop } from './modalState.service';

describe('modalStateServiceProvider', () => {
  beforeEach(angular.mock.module(module.name));
  let modalStateServiceProvider;

  beforeEach(() => {
    angular.mock.module(function (_modalStateServiceProvider_) {
      modalStateServiceProvider = _modalStateServiceProvider_;
      modalStateServiceProvider.registerModal('test-modal', angular.noop);
    });
  });

  it('to be defined', inject(function () {
    expect(modalStateServiceProvider).toBeDefined();
    expect(modalStateServiceProvider.registerModal).toBeDefined();
  }));

  describe('modalStateService.invokeModal()', () => {
    let modalStateService, $injector;

    beforeEach(inject(function (_modalStateService_, _$injector_) {
      $injector = _$injector_;
      modalStateService = _modalStateService_;
      jest.spyOn($injector, 'invoke').mockImplementation(() => {});
    }));

    it('invokes registered modal', () => {
      modalStateService.invokeModal('test-modal');

      expect($injector.invoke).toHaveBeenCalledWith(expect.any(Function));
    });

    it('does not invoke unknown modal', () => {
      modalStateService.invokeModal('unknown');

      expect($injector.invoke).not.toHaveBeenCalled();
    });
  });
});

describe('modalStateService', () => {
  beforeEach(angular.mock.module(module.name));
  let modalStateService, $rootScope, $location;

  beforeEach(inject(function (_modalStateService_, _$rootScope_, _$location_) {
    modalStateService = _modalStateService_;
    $rootScope = _$rootScope_;
    $location = _$location_;
  }));

  it('to be defined', () => {
    expect(modalStateService).toBeDefined();
  });

  describe('name', () => {
    beforeEach(() => {
      $location.search('modal', 'sample');
      $rootScope.$digest();
      jest.spyOn($location, 'search');
    });

    it('returns current modal name', () => {
      expect(modalStateService.name()).toEqual('sample');
      expect($location.search).toHaveBeenCalled();
    });

    it('sets modal name', () => {
      expect(modalStateService.name('test-modal')).toEqual('test-modal');
      expect($location.search).toHaveBeenCalledWith('modal', 'test-modal');
    });

    it('removes modal name', () => {
      expect(modalStateService.name(null)).not.toBeDefined();
      expect($location.search).toHaveBeenCalledWith('modal', null);
    });
  });

  describe('urlFor', () => {
    it('correctly generates urls', () => {
      expect(modalStateService.urlFor('test-modal')).toEqual(
        'http://server/?modal=test-modal',
      );
      expect(
        modalStateService.urlFor(
          'test-modal',
          { key: 'value' },
          'http://localhost/cart.html',
        ),
      ).toEqual('http://localhost/cart.html?key=value&modal=test-modal');
    });
  });

  describe('scrollModalToTop', () => {
    it('scrolls .modal to top', () => {
      /* eslint-disable angular/document-service */
      const element = { scrollTop: 5 };
      jest.spyOn(window.document, 'querySelector').mockReturnValue(element);
      scrollModalToTop();

      expect(window.document.querySelector).toHaveBeenCalledWith('.modal');
      expect(element).toEqual({ scrollTop: 0 });
      /* eslint-enable angular/document-service */
    });

    it("completes gracefully even when a modal isn't found in the DOM", () => {
      /* eslint-disable angular/document-service */
      const element = null;
      jest.spyOn(window.document, 'querySelector').mockReturnValue(element);
      scrollModalToTop();

      expect(window.document.querySelector).toHaveBeenCalledWith('.modal');
      expect(element).toEqual(null);
      /* eslint-enable angular/document-service */
    });
  });
});
