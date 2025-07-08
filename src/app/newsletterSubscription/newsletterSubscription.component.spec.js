import angular from 'angular';
import 'angular-mocks';
import module from './newsletterSubscription.component';

describe('newsletterSubscription', function () {
  beforeEach(angular.mock.module(module.name));
  let $ctrl, $rootScope;

  beforeEach(inject(function (_$rootScope_, _$componentController_) {
    $rootScope = _$rootScope_;
    $ctrl = _$componentController_(
      module.name,
      {},
      {
        designationNumber: '0123456',
        displayName: 'Rev. Mortimer and Gertrude Tuttle',
      },
    );
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
    expect($ctrl.designationNumber).toEqual('0123456');
    expect($ctrl.displayName).toEqual('Rev. Mortimer and Gertrude Tuttle');
  });

  describe('openNewsletterModal', () => {
    let modalPromise;
    beforeEach(inject((_$q_) => {
      modalPromise = _$q_.defer();
      jest
        .spyOn($ctrl.$uibModal, 'open')
        .mockReturnValue({ result: modalPromise.promise });
    }));

    it('should open modal', () => {
      $ctrl.openNewsletterModal();

      expect($ctrl.$uibModal.open).toHaveBeenCalled();
      expect(
        $ctrl.$uibModal.open.mock.calls[0][0].resolve.designationNumber(),
      ).toEqual('0123456');
      expect(
        $ctrl.$uibModal.open.mock.calls[0][0].resolve.displayName(),
      ).toEqual('Rev. Mortimer and Gertrude Tuttle');

      modalPromise.resolve();
      $rootScope.$digest();
    });
  });
});
