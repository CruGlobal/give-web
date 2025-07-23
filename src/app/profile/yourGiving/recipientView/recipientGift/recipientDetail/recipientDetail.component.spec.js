import angular from 'angular';
import 'angular-mocks';
import module from './recipientDetail.component';

describe('your giving', function () {
  describe('recipient view', () => {
    describe('recipient gift', () => {
      describe('recipient detail', () => {
        beforeEach(angular.mock.module(module.name));
        let $compile, $rootScope;

        beforeEach(inject((_$compile_, _$rootScope_) => {
          $compile = _$compile_;
          $rootScope = _$rootScope_;
        }));

        it('inserts the giftDetail template', () => {
          const scope = $rootScope.$new();
          scope.gift = { a: 'a' };
          const element = $compile('<tr recipient-detail="gift"></tr>')(scope);
          $rootScope.$digest();

          expect(element.children().length).toEqual(4);
        });
      });
    });
  });
});
