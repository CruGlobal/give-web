import angular from 'angular';
import 'angular-mocks';
import module from './newsletter.modal';

describe('NewsletterModalController', function () {
  beforeEach(angular.mock.module(module.name));
  let $ctrl, $rootScope;

  beforeEach(inject(function (_$rootScope_, $controller) {
    $rootScope = _$rootScope_;

    $ctrl = $controller(module.name, {
      designationNumber: '0123456',
      displayName: 'Rev. Mortimer and Gertrude Tuttle',
      $scope: $rootScope.$new(),
    });
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
    expect($ctrl.designationEditorService).toBeDefined();
    expect($ctrl.designationNumber).toEqual('0123456');
    expect($ctrl.displayName).toEqual('Rev. Mortimer and Gertrude Tuttle');
    expect($ctrl.step).toEqual(1);
    expect($ctrl.attributes).toEqual({
      send_newsletter: 'Email',
    });
    expect($ctrl.address).toEqual({
      country: 'US',
    });
  });

  describe('get includeEmailField', () => {
    it('should be true if send_newsletter includes Email option', () => {
      $ctrl.attributes.send_newsletter = 'Email';
      expect($ctrl.includeEmailField).toEqual(true);
      $ctrl.attributes.send_newsletter = 'Both';
      expect($ctrl.includeEmailField).toEqual(true);
    });

    it('should be false if send_newsletter excludes Email option', () => {
      $ctrl.attributes.send_newsletter = 'Physical';
      expect($ctrl.includeEmailField).toEqual(false);
    });
  });

  describe('get includeAddressFields', () => {
    it('should be true if send_newsletter includes Physical option', () => {
      $ctrl.attributes.send_newsletter = 'Physical';
      expect($ctrl.includeAddressFields).toEqual(true);
      $ctrl.attributes.send_newsletter = 'Both';
      expect($ctrl.includeAddressFields).toEqual(true);
    });

    it('should be false if send_newsletter excludes Physical option', () => {
      $ctrl.attributes.send_newsletter = 'Email';
      expect($ctrl.includeAddressFields).toEqual(false);
    });
  });

  describe('prev()', () => {
    it('should go to previous step', () => {
      $ctrl.step = 3;
      $ctrl.error = {};
      $ctrl.prev();
      expect($ctrl.step).toEqual(2);
      expect($ctrl.error).toBe(false);
    });
  });

  describe('next()', () => {
    it('proceeds to next step if step < 2', () => {
      $ctrl.step = 1;
      $ctrl.next();
      expect($ctrl.step).toEqual(2);
    });

    describe('step == 2', () => {
      let newsletterPromise;
      beforeEach(inject((_$q_) => {
        newsletterPromise = _$q_.defer();
        $ctrl.address = {
          country: 'country',
          streetAddress: 'street',
          extendedAddress: 'street2',
          intAddressLine3: 'street3',
          locality: 'city',
          postalCode: 'zip',
        };
      }));

      it('subscribes to newsletter', () => {
        jest
          .spyOn($ctrl.designationEditorService, 'subscribeToNewsletter')
          .mockReturnValue(newsletterPromise.promise);
        $ctrl.step = 2;
        $ctrl.next();
        expect($ctrl.progress).toEqual(true);
        expect(
          $ctrl.designationEditorService.subscribeToNewsletter,
        ).toHaveBeenCalledWith($ctrl.designationNumber, {
          send_newsletter: 'Email',
          country: 'country',
          street: `street\nstreet2\nstreet3`,
          city: 'city',
          postal_code: 'zip',
        });

        newsletterPromise.resolve({});
        $rootScope.$digest();

        expect($ctrl.success).toBe(true);
        expect($ctrl.progress).toBe(false);
        expect($ctrl.step).toEqual(3);
      });

      it('sets an error on failure', () => {
        jest
          .spyOn($ctrl.designationEditorService, 'subscribeToNewsletter')
          .mockReturnValue(newsletterPromise.promise);
        $ctrl.step = 2;
        $ctrl.next();
        expect($ctrl.progress).toEqual(true);
        expect(
          $ctrl.designationEditorService.subscribeToNewsletter,
        ).toHaveBeenCalledWith(
          $ctrl.designationNumber,
          expect.objectContaining({
            send_newsletter: 'Email',
          }),
        );

        newsletterPromise.reject(new Error('error'));
        $rootScope.$digest();

        expect($ctrl.success).toBeFalsy();
        expect($ctrl.progress).toBe(false);
        expect($ctrl.step).toEqual(3);
        expect($ctrl.error).toBeInstanceOf(Error);
        expect($ctrl.attributes).toEqual({ send_newsletter: 'Email' });
      });
    });
  });
});
