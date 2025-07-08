import angular from 'angular';
import 'angular-mocks';

import module from './step-1.component';

describe('checkout', function () {
  describe('step 1', function () {
    beforeEach(angular.mock.module(module.name));
    var self = {};

    beforeEach(inject(function ($componentController) {
      self.controller = $componentController(
        module.name,
        {},
        {
          changeStep: jest.fn(),
        },
      );
    }));

    describe('onSubmit', () => {
      it('should change step if submitted successfully', () => {
        jest
          .spyOn(self.controller.$window, 'scrollTo')
          .mockImplementation(() => {});
        self.controller.onSubmit(true);

        expect(self.controller.changeStep).toHaveBeenCalledWith({
          newStep: 'payment',
        });
        expect(self.controller.$window.scrollTo).not.toHaveBeenCalled();
      });

      it('should scroll to top if submitted with error', () => {
        self.controller.submitted = true;
        jest
          .spyOn(self.controller.$window, 'scrollTo')
          .mockImplementation(() => {});
        self.controller.onSubmit(false);

        expect(self.controller.changeStep).not.toHaveBeenCalled();
        expect(self.controller.$window.scrollTo).toHaveBeenCalledWith(0, 0);
        expect(self.controller.submitted).toEqual(false);
      });
    });

    describe('buildCartUrl', () => {
      it('should get the url from the cart service', () => {
        jest.spyOn(self.controller.cartService, 'buildCartUrl');
        self.controller.buildCartUrl();
        expect(self.controller.cartService.buildCartUrl).toHaveBeenCalled();
      });
    });
  });
});
