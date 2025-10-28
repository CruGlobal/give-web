import angular from 'angular';
import 'angular-mocks';
import module from './configureGifts.component';

describe('your giving', () => {
  describe('stopStartRecurringGiftsModal', () => {
    describe('restartGift', () => {
      describe('step2', () => {
        describe('configureGifts', () => {
          beforeEach(angular.mock.module(module.name));
          let $ctrl;

          beforeEach(inject(($componentController) => {
            $ctrl = $componentController(
              module.name,
              {},
              { next: jest.fn(), previous: jest.fn() },
            );
          }));

          it('is defined', () => {
            expect($ctrl).toBeDefined();
          });
        });
      });
    });
  });
});
