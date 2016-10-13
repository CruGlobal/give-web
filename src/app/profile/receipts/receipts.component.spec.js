import angular from 'angular';
import 'angular-mocks';
import module from './receipts.component';
import {Roles} from 'common/services/session/session.service';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';


describe('profile', function() {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function($rootScope, $componentController) {
    var $scope = $rootScope.$new();

    self.controller = $componentController(module.name, {
      $scope: $scope,
      $window: {},
      $location: {},
      donationsService: {
        getReceipts: angular.noop
      }
    });
  }));

  it('to be defined', function() {
    expect(self.controller).toBeDefined();
  });

  describe( '$onInit()', () => {
    beforeEach( () => {
      spyOn( self.controller, 'sessionEnforcerService' );
      spyOn( self.controller, 'getReceipts' );
      self.controller.$onInit();
    } );
    it( 'initializes the component', () => {
      expect( self.controller.sessionEnforcerService ).toHaveBeenCalledWith(
        [Roles.registered], jasmine.objectContaining( {
          'sign-in': jasmine.any( Function ),
          cancel:    jasmine.any( Function )
        } )
      );
      expect( self.controller.getReceipts ).toHaveBeenCalled();
    } );

    describe( 'sessionEnforcerService success', () => {
      it( 'executes success callback', () => {
        self.controller.sessionEnforcerService.calls.argsFor( 0 )[1]['sign-in']();
        expect( self.controller.$window.location ).toEqual( '/receipts.html' );
      } );
    } );

    describe( 'sessionEnforcerService failure', () => {
      it( 'executes failure callback', () => {
        self.controller.sessionEnforcerService.calls.argsFor( 0 )[1]['cancel']();
        expect( self.controller.$window.location ).toEqual( 'cart.html' );
      } );
    } );
  } );

  describe( 'getReceipts()', () => {
    it( 'should get a list of receipts', () => {
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
      spyOn(self.controller.donationsService, 'getReceipts').and.returnValue(Observable.of(receipts));
      self.controller.getReceipts();
      expect(self.controller.donationsService.getReceipts).toHaveBeenCalled();
      expect(self.controller.years).toEqual([2015,2014]);
      expect(self.controller.showYear).toBe(2015);
    } );

    it( 'should fail retrieving receipts', () => {
      spyOn(self.controller.donationsService, 'getReceipts').and.returnValue(Observable.throw({
        data: 'some error'
      }));
      self.controller.getReceipts();
      expect(self.controller.donationsService.getReceipts).toHaveBeenCalled();
      expect(self.controller.retrievingError).toBe('Failed retrieving receipts.');
    }) ;
  } );

  describe( 'setYear()', () => {
    it( 'sets year to display and resets the max shown items value', () => {
      self.controller.setYear('2014');
      expect(self.controller.showYear).toBe('2014');
      expect(self.controller.maxShow).toBe(25);
    } );
  } );

  describe( '$onDestroy()', () => {
    it( 'cleans up the component', () => {
      spyOn( self.controller.sessionEnforcerService, 'cancel' );
      self.controller.enforcerId = '1234567890';
      self.controller.$onDestroy();
      expect( self.controller.sessionEnforcerService.cancel ).toHaveBeenCalledWith( '1234567890' );
    } );
  } );

});
