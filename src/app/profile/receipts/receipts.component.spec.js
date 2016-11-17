import angular from 'angular';
import 'angular-mocks';
import module from './receipts.component';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import {SignOutEvent} from 'common/services/session/session.service';

describe( 'ReceiptsComponent', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( ( _$componentController_ ) => {
    $ctrl = _$componentController_( module.name, {
      $window: {location: '/receipts.html'}
    } );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
    expect( $ctrl.$window ).toBeDefined();
    expect( $ctrl.$location ).toBeDefined();
    expect( $ctrl.sessionEnforcerService ).toBeDefined();
    expect( $ctrl.$rootScope ).toBeDefined();
  } );

  describe( '$onInit()', () => {
    beforeEach( () => {
      spyOn( $ctrl, 'getReceipts' );
      spyOn( $ctrl, 'sessionEnforcerService' );
      spyOn( $ctrl.$rootScope, '$on' );
      spyOn( $ctrl, 'signedOut' );
    } );

    it( 'registers signed-out callback', () => {
      $ctrl.$onInit();
      expect( $ctrl.$rootScope.$on ).toHaveBeenCalledWith( SignOutEvent, jasmine.any( Function ) );
      $ctrl.$rootScope.$on.calls.argsFor( 0 )[1]();
      expect( $ctrl.signedOut ).toHaveBeenCalled();
    });

    describe( 'sessionEnforcerService success', () => {
      it( 'executes success callback', () => {
        expect( $ctrl.getReceipts ).not.toHaveBeenCalled();

        $ctrl.$onInit();
        $ctrl.sessionEnforcerService.calls.argsFor( 0 )[1]['sign-in']();
        expect( $ctrl.getReceipts ).toHaveBeenCalled();
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

  describe( 'getReceipts()', () => {
    it( 'should get a list of receipts for current year', () => {
      let receipts = [{
        'designation-names': ['Tom',' John'],
        'total-amount': 25,
        'transaction-date': {
          'display-value': '2015-10-10',
          'value': 123
        },
        'transaction-number': '321'
      },{
        'designation-names': ['Tom',' John'],
        'total-amount': 25,
        'transaction-date': {
          'display-value': '2014-10-10',
          'value': 123
        },
        'transaction-number': '322'
      }];
      spyOn($ctrl.donationsService, 'getReceipts').and.returnValue(Observable.of(receipts));
      $ctrl.$onInit();
      $ctrl.getReceipts();
      expect($ctrl.donationsService.getReceipts).toHaveBeenCalled();
    } );

    it( 'should get a list of receipts for last year', () => {
      let receipts = [];
      spyOn($ctrl.donationsService, 'getReceipts').and.returnValue(Observable.of(receipts));
      $ctrl.$onInit();
      $ctrl.getReceipts('2015',true);
      expect($ctrl.donationsService.getReceipts).toHaveBeenCalledTimes(2);
    } );

    it( 'should fail retrieving receipts', () => {
      spyOn($ctrl.donationsService, 'getReceipts').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      $ctrl.$onInit();
      $ctrl.getReceipts();
      expect($ctrl.donationsService.getReceipts).toHaveBeenCalled();
      expect($ctrl.retrievingError).toBe('Failed retrieving receipts.');
    }) ;
  } );

  describe( 'setYear()', () => {
    it( 'sets year to display and resets the max shown items value', () => {
      spyOn( $ctrl, 'getReceipts' );
      $ctrl.setYear('2014');
      expect($ctrl.maxShow).toBe(25);
      expect($ctrl.getReceipts).toHaveBeenCalled();
    } );
  } );

  describe( 'getListYears()', () => {
    it( 'sets year to display and resets the max shown items value', () => {
      $ctrl.$onInit();
      expect($ctrl.getListYears().length).toBe(10);
    } );
  } );

  describe( '$onDestroy()', () => {
    it( 'cleans up the component', () => {
      spyOn( $ctrl.sessionEnforcerService, 'cancel' );
      $ctrl.enforcerId = '1234567890';
      $ctrl.$onDestroy();
      expect( $ctrl.sessionEnforcerService.cancel ).toHaveBeenCalledWith( '1234567890' );
    } );
  } );

  describe( 'signedOut( event )', () => {
    describe( 'default prevented', () => {
      it( 'does nothing', () => {
        $ctrl.signedOut( {defaultPrevented: true} );
        expect( $ctrl.$window.location ).toEqual( '/receipts.html' );
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
} );
