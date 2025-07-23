import angular from 'angular';
import 'angular-mocks';
import module from './productModal.service';

describe('productModalService', function () {
  beforeEach(angular.mock.module(module.name));
  let productModalService, $uibModal;

  beforeEach(inject(function (_productModalService_, _$uibModal_) {
    productModalService = _productModalService_;
    $uibModal = _$uibModal_;
    // Spy On $uibModal.open and return mock object
    jest
      .spyOn($uibModal, 'open')
      .mockReturnValue({ result: { finally: jest.fn() } });
  }));

  it('should be defined', () => {
    expect(productModalService).toBeDefined();
  });

  describe('configureProduct', () => {
    it('should be defined', () => {
      expect(productModalService.configureProduct).toBeDefined();
    });

    it('should open productConfig modal', () => {
      productModalService.configureProduct('0123456', { amount: 50 }, false);

      expect($uibModal.open).toHaveBeenCalledTimes(1);
    });

    it('should not open multiple modals at once', () => {
      productModalService.configureProduct('0123456', { amount: 50 }, false);
      productModalService.configureProduct('0987654', { amount: 100 }, true);

      expect($uibModal.open).toHaveBeenCalledTimes(1);
    });

    it('should pass through itemConfig and isEditing', () => {
      productModalService.configureProduct(
        '0987654',
        { amount: 100 },
        true,
        'uri',
      );

      expect($uibModal.open).toHaveBeenCalledTimes(1);
      expect($uibModal.open.mock.calls[0][0].resolve.code()).toEqual('0987654');
      expect($uibModal.open.mock.calls[0][0].resolve.itemConfig()).toEqual({
        amount: 100,
      });
      expect($uibModal.open.mock.calls[0][0].resolve.isEdit()).toEqual(true);
      expect($uibModal.open.mock.calls[0][0].resolve.uri()).toBe('uri');
    });

    it('should make modalOpen false when modal closes', () => {
      const modalInstance = productModalService.configureProduct(
        '0123456',
        { amount: 50 },
        false,
      );

      expect(productModalService.modalOpen).toEqual(true);
      modalInstance.result.finally.mock.calls[0][0]();

      expect(productModalService.modalOpen).toEqual(false);
    });
  });
});
