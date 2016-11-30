import angular from 'angular';
import 'angular-mocks';
import module from './registerAccountModal.component';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import {Roles} from 'common/services/session/session.service';

describe( 'registerAccountModal', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, bindings, locals;

  beforeEach( inject( function ( _$componentController_ ) {
    bindings = {
      modalTitle: '',
      onCancel:   jasmine.createSpy( 'onCancel' ),
      onSuccess:  jasmine.createSpy( 'onSuccess' ),
      setLoading: jasmine.createSpy( 'setLoading' )
    };
    locals = {
      orderService:        jasmine.createSpyObj( 'orderService', ['getDonorDetails'] ),
      verificationService: jasmine.createSpyObj( 'verificationService', ['postDonorMatches'] ),
      sessionService:      jasmine.createSpyObj( 'sessionService', ['getRole'] )
    };
    $ctrl = _$componentController_( module.name, locals, bindings );

  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
    expect( $ctrl.orderService ).toEqual( locals.orderService );
    expect( $ctrl.verificationService ).toEqual( locals.verificationService );
    expect( $ctrl.sessionService ).toEqual( locals.sessionService );
  } );

  describe( '$onInit()', () => {
    beforeEach( () => {
      spyOn( $ctrl, 'getDonorDetails' );
      spyOn( $ctrl, 'stateChanged' );
    } );

    describe( 'with \'REGISTERED\' cortex-session', () => {
      beforeEach( () => {
        $ctrl.sessionService.getRole.and.returnValue( Roles.registered );
        $ctrl.$onInit();
      } );

      it( 'proceeds to donor details', () => {
        expect( $ctrl.getDonorDetails ).toHaveBeenCalled();
        expect( $ctrl.stateChanged ).not.toHaveBeenCalled();
      } );
    } );
    describe( 'with \'PUBLIC\' cortex-session', () => {
      beforeEach( () => {
        $ctrl.sessionService.getRole.and.returnValue( Roles.public );
        $ctrl.$onInit();
      } );

      it( 'proceeds to sign-in', () => {
        expect( $ctrl.getDonorDetails ).not.toHaveBeenCalled();
        expect( $ctrl.stateChanged ).toHaveBeenCalledWith( 'sign-in' );
      } );
    } );
  } );

  describe( 'onIdentitySuccess()', () => {
    it( 'calls getDonorDetails', () => {
      spyOn( $ctrl, 'getDonorDetails' );
      spyOn( $ctrl, 'stateChanged' );
      $ctrl.onIdentitySuccess();
      expect( $ctrl.getDonorDetails ).toHaveBeenCalled();
      expect( $ctrl.modalTitle ).toEqual('Checking your donor account');
      expect( $ctrl.stateChanged ).toHaveBeenCalledWith('loading');

    } );
  } );

  describe( 'onContactInfoSuccess()', () => {
    it( 'calls postDonorMatches', () => {
      spyOn( $ctrl, 'postDonorMatches' );
      $ctrl.onContactInfoSuccess();
      expect( $ctrl.postDonorMatches ).toHaveBeenCalled();
    } );
  } );

  describe( 'onUserMatchSuccess()', () => {
    it( 'calls onSuccess', () => {
      $ctrl.onUserMatchSuccess();
      expect( $ctrl.onSuccess ).toHaveBeenCalled();
    } );
  } );

  describe( 'getDonorDetails()', () => {
    beforeEach( () => {
      spyOn( $ctrl, 'stateChanged' );
    } );

    describe( 'orderService.getDonorDetails success', () => {
      describe( '\'registration-state\' COMPLETED', () => {
        it( 'changes state to \'contact-info\'', () => {
          $ctrl.orderService.getDonorDetails.and.callFake( () => Observable.of( {'registration-state': 'COMPLETED'} ) );
          $ctrl.getDonorDetails();
          expect( $ctrl.orderService.getDonorDetails ).toHaveBeenCalled();
          expect( $ctrl.stateChanged ).not.toHaveBeenCalled();
          expect( $ctrl.onSuccess ).toHaveBeenCalled();
        } );
      } );

      describe( '\'registration-state\' NEW', () => {
        it( 'changes state to \'contact-info\'', () => {
          $ctrl.orderService.getDonorDetails.and.callFake( () => Observable.of( {'registration-state': 'NEW'} ) );
          $ctrl.getDonorDetails();
          expect( $ctrl.orderService.getDonorDetails ).toHaveBeenCalled();
          expect( $ctrl.stateChanged ).toHaveBeenCalledWith( 'contact-info' );
        } );
      } );
    } );

    describe( 'orderService.getDonorDetails failure', () => {
      it( 'changes state to \'contact-info\'', () => {
        $ctrl.orderService.getDonorDetails.and.callFake( () => Observable.throw( {} ) );
        $ctrl.getDonorDetails();
        expect( $ctrl.orderService.getDonorDetails ).toHaveBeenCalled();
        expect( $ctrl.stateChanged ).toHaveBeenCalledWith( 'contact-info' );
      } );
    } );
  } );

  describe( 'postDonorMatches()', () => {
    beforeEach( () => {
      spyOn( $ctrl, 'stateChanged' );
    } );

    describe( 'verificationService.postDonorMatches success', () => {
      it( 'changes state to \'user-match\'', () => {
        $ctrl.verificationService.postDonorMatches.and.callFake( () => Observable.of( {} ) );
        $ctrl.postDonorMatches();
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
        expect( $ctrl.verificationService.postDonorMatches ).toHaveBeenCalled();
        expect( $ctrl.stateChanged ).toHaveBeenCalledWith( 'user-match' );
      } );
    } );

    describe( 'verificationService.postDonorMatches failure', () => {
      it( 'calls onCancel', () => {
        $ctrl.verificationService.postDonorMatches.and.callFake( () => Observable.throw( {} ) );
        $ctrl.postDonorMatches();
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
        expect( $ctrl.verificationService.postDonorMatches ).toHaveBeenCalled();
        expect( $ctrl.stateChanged ).not.toHaveBeenCalled();
        expect( $ctrl.onCancel ).toHaveBeenCalled();
      } );
    } );
  } );

  describe( 'stateChanged( state )', () => {
    beforeEach( () => {
      $ctrl.state = 'unknown';
      spyOn( $ctrl, 'setModalSize' );
    } );

    it( 'changes to \'sign-in\' state', () => {
      $ctrl.stateChanged( 'sign-in' );
      expect( $ctrl.setModalSize ).toHaveBeenCalledWith( 'sm' );
      expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: false} );
      expect( $ctrl.state ).toEqual( 'sign-in' );
    } );

    it( 'changes to \'contact-info\' state', () => {
      $ctrl.stateChanged( 'contact-info' );
      expect( $ctrl.setModalSize ).toHaveBeenCalledWith();
      expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: false} );
      expect( $ctrl.state ).toEqual( 'contact-info' );
    } );
  } );

  describe( 'setModalSize( size )', () => {
    let modal;
    beforeEach( () => {
      modal = jasmine.createSpyObj( 'modal', ['addClass', 'removeClass'] );
      spyOn( angular, 'element' ).and.returnValue( modal );
    } );

    it( 'sets size to \'sm\'', () => {
      $ctrl.setModalSize( 'sm' );
      expect( modal.removeClass ).toHaveBeenCalledWith( 'modal-sm modal-md modal-lg' );
      expect( modal.addClass ).toHaveBeenCalledWith( 'modal-sm' );
    } );

    it( 'sets size missing param', () => {
      $ctrl.setModalSize();
      expect( modal.removeClass ).toHaveBeenCalledWith( 'modal-sm modal-md modal-lg' );
      expect( modal.addClass ).not.toHaveBeenCalled();
    } );
  } );
} );
