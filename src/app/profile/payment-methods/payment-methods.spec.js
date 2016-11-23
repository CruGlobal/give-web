import angular from 'angular';
import 'angular-mocks';
import module from './payment-methods.component';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import {SignOutEvent} from 'common/services/session/session.service';

describe( 'PaymentMethodsComponent', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  var fakeModal = function() {
    return {
      result: {
        then: function(confirmCallback) {
          this.paymentMethods = [];
          confirmCallback({});
        }
      }
    };
  };
  
  let uibModal = jasmine.createSpyObj('$uibModal', ['open','close']);

  uibModal.open.and.callFake(fakeModal);

  beforeEach( inject( ( _$componentController_ ) => {
    $ctrl = _$componentController_( module.name, {
      $window: {location: '/payment-methods.html'},
      $uibModal: uibModal
    } );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
    expect( $ctrl.$window ).toBeDefined();
    expect( $ctrl.$location ).toBeDefined();
    expect( $ctrl.$rootScope ).toBeDefined();
    expect( $ctrl.sessionEnforcerService ).toBeDefined();
    expect( $ctrl.profileService ).toBeDefined();
  } );

  describe( '$onInit()', () => {
    beforeEach( () => {
      spyOn( $ctrl, 'loadPaymentMethods' );
      spyOn( $ctrl, 'loadDonorDetails' );
      spyOn( $ctrl, 'sessionEnforcerService' );
      spyOn( $ctrl.$rootScope, '$on' );
      spyOn( $ctrl, 'signedOut' );
    } );

    it( 'adds listener for sign-out event', () => {
      $ctrl.$onInit();
      expect( $ctrl.$rootScope.$on ).toHaveBeenCalledWith( SignOutEvent, jasmine.any( Function ) );
      $ctrl.$rootScope.$on.calls.argsFor( 0 )[1]();
      expect( $ctrl.signedOut ).toHaveBeenCalled();
    } );

    describe( 'sessionEnforcerService success', () => {
      it( 'executes success callback', () => {
        $ctrl.$onInit();
        $ctrl.sessionEnforcerService.calls.argsFor( 0 )[1]['sign-in']();
        expect( $ctrl.loadPaymentMethods ).toHaveBeenCalled();
        expect( $ctrl.loadDonorDetails ).toHaveBeenCalled();
      } );
    } );

    describe( 'sessionEnforcerService failure', () => {
      it( 'executes failure callback', () => {
        $ctrl.$onInit();
        $ctrl.sessionEnforcerService.calls.argsFor( 0 )[1]['cancel']();
        expect( $ctrl.$window.location ).toEqual( '/' );
      } );
    } );

  } );

  describe('loadPaymentMethods()', () => {
    it('should load payment methods on $onInit()', () => {
      spyOn($ctrl.profileService, 'getPaymentMethodsWithDonations').and.returnValue(Observable.of([{},{}]));
      $ctrl.loadPaymentMethods();
      expect($ctrl.paymentMethods).toEqual([{},{}]);
      expect($ctrl.profileService.getPaymentMethodsWithDonations).toHaveBeenCalled();
    });

    it('should handle and error of loading payment methods on $onInit()', () => {
      spyOn($ctrl.profileService, 'getPaymentMethodsWithDonations').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.loadPaymentMethods();
      expect($ctrl.submissionError.error).toBe('Failed retrieving payment methods.');
      expect($ctrl.profileService.getPaymentMethodsWithDonations).toHaveBeenCalled();
    });
  });

  describe('loadDonorDetails()', () => {
    it('should get donor details', () => {
      spyOn($ctrl.profileService, 'getDonorDetails').and.returnValue(Observable.of({mailingAddress: 'address'}));
      $ctrl.loadDonorDetails();
      expect($ctrl.mailingAddress).toBe('address');
      expect($ctrl.profileService.getDonorDetails).toHaveBeenCalled();
    });
  });

  describe('addPaymentMethod()', () => {
    it('should open add Payment Method Modal', () => {
      $ctrl.paymentMethods = [{},{}];
      $ctrl.addPaymentMethod();
      expect($ctrl.$uibModal.open).toHaveBeenCalled();
      $ctrl.onSubmit = () => {return 'here';};
      expect($ctrl.$uibModal.open.calls.first().args[0].resolve.onSubmit()()).toBe('here');
    });

    it('should add payment method', () => {
      let e = {
        success: true,
        data: 'some data'
      };
      let data = {
        address: {
          streetAddress: '123 First St',
          extendedAddress: 'Apt 123',
          locality: 'Sacramento',
          postalCode: '12345',
          region: 'CA'
        }
      };
      spyOn($ctrl.profileService, 'addPaymentMethod').and.returnValue(Observable.of(data));
      $ctrl.paymentMethodFormModal = jasmine.createSpyObj('paymentMethodFormModal',['close']);

      $ctrl.parentComponent = $ctrl;
      $ctrl.onSubmit(e);
      expect($ctrl.paymentMethodFormModal.close).toHaveBeenCalled();
    });

    it('should update payment methods list on modal close', () => {
      $ctrl.paymentMethods = [{},{}];
      $ctrl.addPaymentMethod();
      let callback = () => {};
      $ctrl.paymentMethodFormModal.result.then(callback);
      expect($ctrl.paymentMethods.length).toBe(3);
      $ctrl.$timeout.flush();
      expect($ctrl.successMessage.show).toBe(false);
    });

    it('should fail adding payment method and show error message', () => {
      let e = {
        success: true,
        data: 'some data'
      };
      spyOn($ctrl.profileService, 'addPaymentMethod').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.onSubmit(e);
      expect($ctrl.submissionError.error).toBe('some error');
    });
  });

  describe('$onDestroy()', () => {
    it('should close modal and cancel the sessionEnforcer', ()=>{
      spyOn( $ctrl.sessionEnforcerService, 'cancel' );
      $ctrl.enforcerId = '1234567890';
      $ctrl.paymentMethodFormModal = jasmine.createSpyObj('$ctrl.paymentMethodFormModal', ['close']);
      $ctrl.$onDestroy();
      expect( $ctrl.sessionEnforcerService.cancel ).toHaveBeenCalledWith( '1234567890' );
      expect($ctrl.paymentMethodFormModal.close).toHaveBeenCalled();
    });
    it('should cancel the sessionEnforcer', ()=>{
      spyOn( $ctrl.sessionEnforcerService, 'cancel' );
      $ctrl.enforcerId = '1234567890';
      $ctrl.$onDestroy();
      expect( $ctrl.sessionEnforcerService.cancel ).toHaveBeenCalledWith( '1234567890' );
    });
  });

  describe('isCard()', () => {
    it('should return true if payment method is a card', () => {
      expect($ctrl.isCard({'card-number': '2222'})).toBe(true);
      expect($ctrl.isCard({'bank': '2222'})).toBe(false);
    });
  });

  describe('onDelete()', () => {
    it('should do stuff onDelete()', () => {
      $ctrl.onDelete();
      expect($ctrl.successMessage.show).toBe(true);
      expect($ctrl.successMessage.type).toBe('paymentMethodDeleted');
      $ctrl.$timeout.flush();
      expect($ctrl.successMessage.show).toBe(false);
    });
  });

  describe('onSubmit()', () => {
    it('should not try to add a payment method if success if false', ()=> {
      let e = {
        success: false
      };
      spyOn($ctrl.profileService, 'addPaymentMethod');
      $ctrl.onSubmit(e);
      expect($ctrl.profileService.addPaymentMethod).not.toHaveBeenCalled();
    });
  });

  describe( 'signedOut( event )', () => {
    describe( 'default prevented', () => {
      it( 'does nothing', () => {
        $ctrl.signedOut( {defaultPrevented: true} );
        expect( $ctrl.$window.location ).toEqual( '/payment-methods.html' );
      } );
    } );

    describe( 'default not prevented', () => {
      it( 'navigates to \'\/\'', () => {
        let spy = jasmine.createSpy( 'preventDefault' );
        $ctrl.signedOut( {defaultPrevented: false, preventDefault: spy} );
        expect( spy ).toHaveBeenCalled();
        expect( $ctrl.$window.location ).toEqual( '/' );
      } );
    } );
  } );
});
