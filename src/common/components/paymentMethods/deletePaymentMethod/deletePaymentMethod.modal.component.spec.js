import angular from 'angular';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import module from './deletePaymentMethod.modal.component';

describe( 'delete payment method modal', function () {
  beforeEach( angular.mock.module( module.name ) );
  var self = {};
  var _profileService = angular.noop;

  var _resolve = {};
  _resolve.paymentMethod = {
    self: {
      uri: 'uri'
    }
  };
  _resolve.paymentMethod['_recurringgifts'] = [{
    'donations': [
      {
        'donation-lines': [{},{}]
      },
      {
        'donation-lines': [{},{}]
      }]
  }];
  _resolve.paymentMethodsList = [];

  beforeEach( inject( function ( $componentController ) {
    self.controller = $componentController( module.name, {
      profileService: _profileService,
      $log: angular.noop
    } );
    self.controller.resolve = _resolve;
    self.controller.profileService.updateRecurringGifts = angular.noop;
    self.controller.profileService.addPaymentMethod = angular.noop;
    self.controller.profileService.deletePaymentMethod = angular.noop;
    self.controller.$log.error = angular.noop;
    self.controller.close = angular.noop;

  } ) );

  it( 'to be defined', function () {
    expect( self.controller ).toBeDefined();
    expect( self.controller.loading).toEqual( false );
    expect( self.controller.submitted).toEqual( false );
    expect( self.controller.submissionError.error).toEqual( '' );
  } );

  describe( '$onInit()', () => {

    it( 'initializes the component', () => {
      spyOn( self.controller, 'setView' );
      spyOn( self.controller, 'getPaymentMethods' );
      self.controller.$onInit();
      expect( self.controller.setView ).toHaveBeenCalled();
      expect( self.controller.getPaymentMethods ).toHaveBeenCalled();
    } );

    describe( 'changeView()', () => {
      it( 'should reset the view', () => {
        spyOn( self.controller, 'setView' );
        self.controller.changeView(true);
        expect( self.controller.setView ).toHaveBeenCalled();
      } );
      it( 'changes \'view\' and \'confirm text\' properties', () => {
        self.controller.deleteOption = '1';
        self.controller.changeView();
        expect( self.controller.view ).toBe('confirm');
        expect( self.controller.confirmText ).toBe('withTransfer');

        self.controller.deleteOption = '2';
        self.controller.changeView();
        expect( self.controller.view ).toBe('addPaymentMethod');

        self.controller.deleteOption = '3';
        self.controller.changeView();
        expect( self.controller.view ).toBe('confirm');
        expect( self.controller.confirmText ).toBe('withOutTransfer');
      } );
    } );

    describe( 'setView()', () => {
      it( 'should set initial view depending on existing of recurring gifts', () => {
        self.controller.setView();
        expect( self.controller.view ).toEqual( 'manageDonations' );
        self.controller.resolve.paymentMethod._recurringgifts[0].donations = [];
        self.controller.setView();
        expect( self.controller.view ).toEqual( 'confirm' );
      } );
    } );
  } );

  describe( 'getPaymentMethodName()', () => {
    it( 'returns bank name', () => {
      self.controller.resolve.paymentMethod['bank-name'] = 'Foo bank';
      expect( self.controller.getPaymentMethodName()).toBe('Foo bank');
    } );

    it( 'returns credit card type', () => {
      self.controller.resolve.paymentMethod['card-type'] = 'Foo CC';
      expect( self.controller.getPaymentMethodName()).toBe('Foo CC');
    } );

    it( 'excepts payment method parameter and returns it\'s name' , () => {
      let paymentMethod = _resolve.paymentMethod;
      self.controller.selectedPaymentMethod = 'uri';
      paymentMethod.self = {
        uri: 'uri'
      };
      self.controller.filteredPaymentMethods = [self.controller.resolve.paymentMethod];
      expect( self.controller.getPaymentMethodName(paymentMethod)).toBe('Foo CC');
    } );
  } );

  describe( 'getPaymentMethodLastFourDigits()', () => {
    it( 'returns 4 digits of account number depending on which payment method is being deleted (bank account/credit card)', () => {
      self.controller.resolve.paymentMethod['display-account-number'] = '1234';
      expect( self.controller.getPaymentMethodLastFourDigits()).toBe('1234');

      self.controller.resolve.paymentMethod['display-account-number'] = undefined;
      self.controller.resolve.paymentMethod['card-number'] = '3456';
      expect( self.controller.getPaymentMethodLastFourDigits()).toBe('3456');

      let paymentMethod = self.controller.resolve.paymentMethod;
      paymentMethod['card-number'] = '9876';
      paymentMethod.self = {
        uri: 'uri'
      };
      self.controller.selectedPaymentMethod = 'uri';
      self.controller.filteredPaymentMethods = [self.controller.resolve.paymentMethod];
      expect( self.controller.getPaymentMethodLastFourDigits(paymentMethod)).toBe('9876');
    } );
  } );

  describe( 'getPaymentMethodOptionLabel()', () => {
    it( 'returns bank name', () => {
      self.controller.resolve.paymentMethod['display-account-number'] = '4444';
      self.controller.resolve.paymentMethod['bank-name'] = 'Moral Bank';
      expect( self.controller.getPaymentMethodOptionLabel(self.controller.resolve.paymentMethod)).toBe('Moral Bank ending in ****4444');
    } );

  } );

  describe( 'getIcon()', () => {
    it( 'returns umage url path part', () => {
      self.controller.resolve.paymentMethod['card-type'] = undefined;
      self.controller.resolve.paymentMethod['bank-name'] = 'Moral Bank';
      expect( self.controller.getIcon()).toBe('bank');

      self.controller.resolve.paymentMethod['bank-name'] = undefined;
      self.controller.resolve.paymentMethod['card-type'] = 'Visa';

      expect( self.controller.getIcon()).toBe('cc-visa');
    } );

  } );

  describe( 'getRecurrenceDate()', () => {
    it( 'returns recurrence text', () => {
      let gift = {
        'next-draw-date': {
          'display-value': '2016-07-14'
        },
        'recurring-day-of-month': '15'
      };
      let date = new Date(gift['next-draw-date']['display-value']);
      expect(self.controller.getRecurrenceDate(gift)).toEqual(date);
    } );
  } );

  describe( 'getQuarterMonths', () => {
    it( 'should 4 months of the year that payment go through', () => {
      let gift = {
        'next-draw-date': {
          'display-value': '2016-07-14'
        },
        'recurring-day-of-month': '15'
      };
      expect(self.controller.getQuarterMonths(gift)).toEqual([
        'January',
        'April',
        'July',
        'October'
      ]);
      self.controller.quarterMonths = 'foo';
      expect(self.controller.getQuarterMonths(gift)).toEqual('foo');
    } );
  } );

  describe( 'buildGifts()' , () => {
    it('should return an array of gifts', () => {
      self.controller.resolve.paymentMethod['_recurringgifts'] = [{
        'donations': [
          {
            'donation-lines': [{},{}]
          },
          {
            'donation-lines': [{},{}]
          }]
      }];
      self.controller.resolve.paymentMethod['self'] = {
        'uri': 'bar'
      };
      expect(self.controller.buildGifts(self.controller.resolve.paymentMethod._recurringgifts[0].donations ).length).toBe(4);
    });
  });

  describe( 'getPaymentMethods()', () => {
    it('should create an array of filtered payment mehtods', () => {
      let anotherPaymentMethod = {
        'self': {
          'uri': 'uri'
        },
        '_recurringgifts': [{
          'donations': []
        }]
      };
      self.controller.resolve.paymentMethodsList = [self.controller.resolve.paymentMethod, anotherPaymentMethod];
      self.controller.getPaymentMethods();
      expect(self.controller.filteredPaymentMethods.length).toBe(1);
    } );
  } );

  describe( 'moveDonations()', () => {
    beforeEach(()=>{
      self.controller.filteredPaymentMethods = [{
        'self': {
          'uri': 'uri'
        }
      }];
    });
    it('move donations around in the local list after a successfull deletion', () => {
      self.controller.selectedPaymentMethod = 'uri';
      self.controller.resolve.paymentMethodsList.push(self.controller.resolve.paymentMethod);

      expect(self.controller.resolve.paymentMethodsList[1]['_recurringgifts'][0]['donations'].length).toBe(0);
      self.controller.moveDonations();
      expect(self.controller.resolve.paymentMethodsList.length).toBe(1);
      expect(self.controller.resolve.paymentMethodsList[0]['_recurringgifts'][0].donations.length).toBe(2);
    } );

    it('add newly created payment method to a list', () => {
      self.controller.selectedPaymentMethod = 'uri';
      expect(self.controller.resolve.paymentMethodsList.length).toBe(1);
      self.controller.moveDonations();
      expect(self.controller.resolve.paymentMethodsList.length).toBe(2);
    });
  } );

  describe( 'removePaymentMethodFromList()', () => {
    it('remove payment method that was deleted from local list ', () => {
      self.controller.resolve.paymentMethodsList.push(self.controller.resolve.paymentMethod);
      expect(self.controller.resolve.paymentMethodsList.length).toBe(3);
      self.controller.removePaymentMethodFromList();
      expect(self.controller.resolve.paymentMethodsList.length).toBe(2);
    } );
  } );

  describe( 'getNewPaymentMethodId()', () => {
    it('return id from self.uri', () => {
      self.controller.selectedPaymentMethod = '/blah/blah/123';
      expect(self.controller.getNewPaymentMethodId()).toBe('123');
    } );
  } );

  describe( 'moveDonationsToNewPaymentMethod()', () => {
    it('update each donation\'s updated-payment-method-id field and make an API call to update', () => {
      self.controller.selectedPaymentMethod = '/blah/blah/123';
      spyOn(self.controller,'updateRecurringGifts');
      self.controller.moveDonationsToNewPaymentMethod();
      expect(self.controller.updateRecurringGifts).toHaveBeenCalled();
      expect(self.controller.resolve.paymentMethod._recurringgifts[0].donations[0]['donation-lines'][0]['updated-payment-method-id']).toBe('123');
    } );
  } );

  describe( 'stopRecurringGifts()', () => {
    it('update each donation\'s updated-donation-line-status field and make an API call to update', () => {
      spyOn(self.controller,'updateRecurringGifts');
      self.controller.stopRecurringGifts();
      expect(self.controller.updateRecurringGifts).toHaveBeenCalled();
      expect(self.controller.resolve.paymentMethod._recurringgifts[0].donations[0]['donation-lines'][0]['updated-donation-line-status']).toBe('Cancelled');
    } );
  } );

  describe( 'updateRecurringGifts()', () => {
    it('make an sucessfull API call to update recurrng gifts and delete payment method', () => {
      spyOn(self.controller, 'deletePaymentMethod');
      spyOn(self.controller.profileService, 'updateRecurringGifts').and.returnValue(Observable.of('data'));
      self.controller.updateRecurringGifts();
      expect(self.controller.deletePaymentMethod).toHaveBeenCalled();
    } );

    it('should throw an error', () => {
      spyOn(self.controller.profileService, 'updateRecurringGifts').and.returnValue(Observable.throw({
        data: 'some error'
      }));

      self.controller.updateRecurringGifts();
      expect(self.controller.submissionError.error).toBe('some error');
    });
  } );

  describe( 'savePaymentMethod()', () => {
    it('should save new payment method', () => {
      let data = {
        self: {
          uri: ''
        }
      };
      spyOn(self.controller.profileService, 'addPaymentMethod').and.returnValue(Observable.of(data));
      self.controller.savePaymentMethod(true, true);
      expect(self.controller.profileService.addPaymentMethod).toHaveBeenCalled();
    });

    it('should not make a call', () => {
      spyOn(self.controller.profileService, 'addPaymentMethod').and.returnValue(Observable.of({}));
      self.controller.savePaymentMethod(false);
      expect(self.controller.profileService.addPaymentMethod).not.toHaveBeenCalled();
    });

    it('should fail and throw error', () => {
      spyOn(self.controller.profileService, 'addPaymentMethod').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      self.controller.savePaymentMethod(true, true);
      expect(self.controller.submissionError.error).toBe('some error');
    });
  } );

  describe( 'deletePaymentMethod()', () => {
    it('should delete payment method and move local donations to a different payment method', () => {

      spyOn(self.controller.profileService, 'deletePaymentMethod').and.returnValue(Observable.of('data'));
      spyOn(self.controller, 'moveDonations');
      self.controller.deleteOption = '2';
      self.controller.deletePaymentMethod();
      expect(self.controller.profileService.deletePaymentMethod).toHaveBeenCalled();
      expect(self.controller.moveDonations).toHaveBeenCalled();
    });

    it('should delete payment method and remove it from local list', () => {

      spyOn(self.controller.profileService, 'deletePaymentMethod').and.returnValue(Observable.of('data'));
      spyOn(self.controller, 'removePaymentMethodFromList');
      self.controller.deleteOption = '3';
      self.controller.deletePaymentMethod();
      expect(self.controller.profileService.deletePaymentMethod).toHaveBeenCalled();
      expect(self.controller.removePaymentMethodFromList).toHaveBeenCalled();
    });

    it('should fail and throw error', () => {
      spyOn(self.controller.profileService, 'deletePaymentMethod').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      self.controller.deletePaymentMethod();
      expect(self.controller.submissionError.error).toBe('some error');
    });

  } );

  describe('onSubmit()', () => {
    it('should call different functions depending on delete option', function () {
      spyOn(self.controller, 'moveDonationsToNewPaymentMethod');
      spyOn(self.controller, 'stopRecurringGifts');
      self.controller.deleteOption = '3';
      self.controller.onSubmit();
      expect(self.controller.stopRecurringGifts).toHaveBeenCalled();

      self.controller.deleteOption = '1';
      self.controller.onSubmit();
      expect(self.controller.moveDonationsToNewPaymentMethod).toHaveBeenCalled();
    });

  } );
} );
