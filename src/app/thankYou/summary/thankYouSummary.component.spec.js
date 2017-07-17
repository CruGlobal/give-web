import angular from 'angular';
import 'angular-mocks';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import module from './thankYouSummary.component.js';

import {SignOutEvent} from 'common/services/session/session.service';

describe('thank you summary', () => {
  beforeEach(angular.mock.module(module.name));
  const self = {};

  beforeEach(inject(($componentController) => {
    self.mockPurchase = {
      donorDetails: {
        'mailingAddress': {
          'street-address': '123 Mailing St'
        },
        'registration-state': 'MATCHED'
      },
      paymentMeans: {
        self: {
          type: "elasticpath.purchases.purchase.paymentmeans"
        },
        address: {
          'street-address': '123 Billing St'
        }
      },
      rateTotals: [{
        cost: {
          display: '$20.00',
          amount: 20
        },
        recurrence: {
          display: 'Monthly'
        }
      }],
      rawData: {
        'monetary-total': [
          {
            display: '$50.00',
            amount: 50
          }
        ]

      }
    };

    self.controller = $componentController(module.name, {
        orderService: {
          retrieveLastPurchaseLink: () => '/purchases/crugive/iiydanbt='
        },
        profileService: {
          getPurchase: () => Observable.of(self.mockPurchase),
          getEmails: () => Observable.of([{email:'someperson@someaddress.com'}])
        },
        $window: {location: '/thank-you.html'}
      },
      {
        onPurchaseLoaded: jasmine.createSpy('onPurchaseLoaded')
      });
  }));

  describe('$onInit', () => {
    beforeEach(() => {
      spyOn( self.controller.$rootScope, '$on' );
      spyOn( self.controller, 'signedOut' );
      spyOn(self.controller, 'loadLastPurchase');
    });
    it('should call all methods needed to load data for the component', () => {
      self.controller.$onInit();
      expect( self.controller.$rootScope.$on ).toHaveBeenCalledWith( SignOutEvent, jasmine.any( Function ) );
      self.controller.$rootScope.$on.calls.argsFor( 0 )[1]();
      expect( self.controller.signedOut ).toHaveBeenCalled();
      expect(self.controller.loadLastPurchase).toHaveBeenCalled();
    });
  });

  describe( 'signedOut( event )', () => {
    describe( 'default prevented', () => {
      it( 'does nothing', () => {
        self.controller.signedOut( {defaultPrevented: true} );
        expect( self.controller.$window.location ).toEqual( '/thank-you.html' );
      } );
    } );

    describe( 'default not prevented', () => {
      it( 'navigates to \'\/\'', () => {
        let spy = jasmine.createSpy( 'preventDefault' );
        self.controller.signedOut( {defaultPrevented: false, preventDefault: spy} );
        expect( spy ).toHaveBeenCalled();
        expect( self.controller.$window.location ).toEqual( '/' );
      } );
    } );
  } );

  describe('loadLastPurchase', () => {
    it('should load all data from the last completed purchase', () => {
      spyOn(self.controller.profileService, 'getPurchase').and.callThrough();
      self.controller.loadLastPurchase();
      expect(self.controller.profileService.getPurchase).toHaveBeenCalledWith('/purchases/crugive/iiydanbt=');
      expect(self.controller.purchase).toEqual(self.mockPurchase);
      expect(self.controller.rateTotals).toEqual([
        {
          frequency: 'Single',
          total: '$50.00',
          amount: 50
        },
        {
          frequency: 'Monthly',
          total: '$20.00',
          amount: 20
        }
      ]);
      expect(self.controller.loading).toEqual(false);
      expect(self.controller.loadingError).toBeUndefined();
      expect(self.controller.onPurchaseLoaded).toHaveBeenCalledWith({
        $event: { purchase: self.mockPurchase }
      });
    });
    it('should not request purchase data if lastPurchaseLink is not defined', () => {
      spyOn(self.controller.orderService, 'retrieveLastPurchaseLink').and.callFake(() => undefined);
      spyOn(self.controller.profileService, 'getPurchase');
      self.controller.loadLastPurchase();
      expect(self.controller.profileService.getPurchase).not.toHaveBeenCalled();
      expect(self.controller.purchase).not.toBeDefined();
      expect(self.controller.loading).toEqual(false);
      expect(self.controller.loadingError).toEqual('lastPurchaseLink missing');
    });
    it('should handle an api error', () => {
      spyOn(self.controller.profileService, 'getPurchase').and.returnValue(Observable.throw('some error'));
      self.controller.loadLastPurchase();
      expect(self.controller.purchase).not.toBeDefined();
      expect(self.controller.loading).toEqual(false);
      expect(self.controller.loadingError).toEqual('api error');
    });
  });
  describe('loadEmail', () => {
    it('should load the user\'s email', () => {
      self.controller.loadEmail();
      expect(self.controller.email).toEqual('someperson@someaddress.com');
    });
  });
});
