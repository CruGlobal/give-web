import angular from 'angular';
import 'angular-mocks';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import module from './display-address.component';

describe('display-address', function () {
  beforeEach(angular.mock.module(module.name));
  const self = {};

  beforeEach(inject(function ($componentController) {
    self.controller = $componentController(module.name);
  }));

  describe('$onChanges', () => {
    beforeEach(() => {
      jest
        .spyOn(self.controller, 'loadCountryNames')
        .mockImplementation(() => {});
    });

    it('should call loadCountryNames when the country is non US', () => {
      self.controller.$onChanges({
        address: { currentValue: { country: 'CA' } },
      });

      expect(self.controller.loadCountryNames).toHaveBeenCalled();
    });

    it('should not call loadCountryNames when the country is US', () => {
      self.controller.$onChanges({
        address: { currentValue: { country: 'US' } },
      });

      expect(self.controller.loadCountryNames).not.toHaveBeenCalled();
    });

    it('should not call loadCountryNames when address is not defined', () => {
      self.controller.$onChanges();

      expect(self.controller.loadCountryNames).not.toHaveBeenCalled();
    });

    it('should not call loadCountryNames if countries is already defined', () => {
      self.controller.countries = {
        CA: { name: 'CA', 'display-name': 'Canada' },
      };
      self.controller.$onChanges({
        address: { currentValue: { country: 'CA' } },
      });

      expect(self.controller.loadCountryNames).not.toHaveBeenCalled();
    });
  });

  describe('loadCountryNames', () => {
    it('should load country names and key them by abbreviation', () => {
      jest
        .spyOn(self.controller.geographiesService, 'getCountries')
        .mockReturnValue(
          Observable.of([{ name: 'CA', 'display-name': 'Canada' }]),
        );
      self.controller.loadCountryNames();

      expect(self.controller.countries).toEqual({
        CA: { name: 'CA', 'display-name': 'Canada' },
      });
    });

    it('should handle an error loading countries', () => {
      jest
        .spyOn(self.controller.geographiesService, 'getCountries')
        .mockReturnValue(Observable.throw('some error'));
      self.controller.loadCountryNames();

      expect(self.controller.countries).toBeUndefined();
      expect(self.controller.$log.warn.logs[0]).toEqual([
        'Error loading countries for display address',
        'some error',
      ]);
    });
  });
});
