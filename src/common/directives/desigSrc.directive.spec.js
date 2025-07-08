import angular from 'angular';
import 'angular-mocks';
import module from './desigSrc.directive';

describe('desigSrc', function () {
  beforeEach(angular.mock.module(module.name));
  let img;
  let scope;
  const desigNum = '0561484';
  const campaignPage = '9876';

  describe('without campaignPage', () => {
    beforeEach(inject(function (_$compile_, _$rootScope_) {
      const tpl =
        '<img desig-src="' + desigNum + '" class="giftsum-profile pull-left">';
      scope = _$rootScope_.$new();
      img = _$compile_(tpl)(scope);
      scope.$digest();
    }));

    it('sets src with designationNumber', () => {
      expect(img.attr('src')).toContain('designationNumber=' + desigNum);
      expect(img.attr('src')).not.toContain('campaign=' + campaignPage);
    });
  });

  describe('with campaignPage', () => {
    beforeEach(inject(function (_$compile_, _$rootScope_) {
      const tpl =
        '<img desig-src="' +
        desigNum +
        '" campaign-page="' +
        campaignPage +
        '" class="giftsum-profile pull-left">';
      scope = _$rootScope_.$new();
      img = _$compile_(tpl)(scope);
      scope.$digest();
    }));

    it('sets src with designationNumber', () => {
      expect(img.attr('src')).toContain('designationNumber=' + desigNum);
      expect(img.attr('src')).toContain('campaign=' + campaignPage);
    });
  });
});
