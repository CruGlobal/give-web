import angular from 'angular';
import 'angular-mocks';
import module from './userMatchModal.component';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

describe( 'userMatchModal', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, bindings;

  beforeEach( inject( function ( _$componentController_ ) {
    bindings = {
      modalTitle:    '',
      onStateChange: jasmine.createSpy( 'onStateChange' ),
      onSuccess:     jasmine.createSpy( 'onSuccess' ),
      setLoading:    jasmine.createSpy( 'setLoading' )
    };
    $ctrl = _$componentController_( module.name, {}, bindings );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
  } );

  describe( '$onInit', () => {
    beforeEach( () => {
      spyOn( $ctrl.verificationService, 'getContacts' ).and.returnValue( Observable.of( [] ) );
      spyOn( $ctrl, 'changeMatchState' );
    } );

    describe( 'donorDetails registration-state=\'COMPLETED\'', () => {
      it( 'does not load contacts', () => {
        spyOn( $ctrl.profileService, 'getDonorDetails' ).and.returnValue( Observable.of( {'registration-state': 'COMPLETED'} ) );
        $ctrl.$onInit();
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
        expect( $ctrl.modalTitle ).toEqual( 'Activate your Account' );
        expect( $ctrl.profileService.getDonorDetails ).toHaveBeenCalled();
        expect( $ctrl.verificationService.getContacts ).not.toHaveBeenCalled();
        expect( $ctrl.changeMatchState ).toHaveBeenCalledWith( 'success' );
      } );
    } );

    describe( 'donorDetails registration-state=\'MATCHED\'', () => {
      it( 'initializes the component', () => {
        spyOn( $ctrl.profileService, 'getDonorDetails' ).and.returnValue( Observable.of( {'registration-state': 'MATCHED'} ) );
        $ctrl.$onInit();
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
        expect( $ctrl.modalTitle ).toEqual( 'Activate your Account' );
        expect( $ctrl.profileService.getDonorDetails ).toHaveBeenCalled();
        expect( $ctrl.verificationService.getContacts ).toHaveBeenCalled();
        expect( $ctrl.contacts ).toEqual( jasmine.any( Array ) );
        expect( $ctrl.changeMatchState ).toHaveBeenCalledWith( 'identity' );
      } );
    } );
  } );

  describe( 'changeMatchState(state)', () => {
    beforeEach( () => {
      $ctrl.matchState = '';
    } );

    it( 'sets state and title on \'identity\'', () => {
      $ctrl.changeMatchState( 'identity' );
      expect( $ctrl.modalTitle ).toEqual( 'It looks like someone in your household has given to Cru previously' );
      expect( $ctrl.matchState ).toEqual( 'identity' );
      expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: false} );
    } );

    it( 'sets state and title on \'success\'', () => {
      $ctrl.changeMatchState( 'success' );
      expect( $ctrl.modalTitle ).toEqual( 'Success!' );
      expect( $ctrl.matchState ).toEqual( 'success' );
      expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: false} );
    } );

    it( 'sets state and title on \'activate\'', () => {
      $ctrl.changeMatchState( 'activate' );
      expect( $ctrl.modalTitle ).toEqual( 'Activate Your Account' );
      expect( $ctrl.matchState ).toEqual( 'activate' );
      expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: false} );
    } );

    it( 'sets state and title on \'unknown-state\'', () => {
      $ctrl.changeMatchState( 'unknown-state' );
      expect( $ctrl.modalTitle ).toEqual( 'Activate Your Account' );
      expect( $ctrl.matchState ).toEqual( 'unknown-state' );
      expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: false} );
    } );
  } );

  describe( 'onSelectContact( contact )', () => {
    beforeEach( () => {
      spyOn( $ctrl, 'changeMatchState' );
    } );

    describe( 'valid contact', () => {
      it( 'selects the contact', () => {
        spyOn( $ctrl.verificationService, 'selectContact' ).and.returnValue( Observable.of( {} ) );
        $ctrl.onSelectContact( {name: 'Batman'} );
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
        expect( $ctrl.verificationService.selectContact ).toHaveBeenCalledWith( {name: 'Batman'} );
        expect( $ctrl.changeMatchState ).toHaveBeenCalledWith( 'activate' );
      } );
    } );

    describe( 'undefined', () => {
      it( 'selects \'that-is-not-me\'', () => {
        spyOn( $ctrl.verificationService, 'thatIsNotMe' ).and.returnValue( Observable.of( {} ) );
        $ctrl.onSelectContact();
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
        expect( $ctrl.verificationService.thatIsNotMe ).toHaveBeenCalled();
        expect( $ctrl.changeMatchState ).toHaveBeenCalledWith( 'success' );
      } );
    } );
  } );

  describe( 'onActivate', () => {
    it( 'load questions and changes state', () => {
      spyOn( $ctrl.verificationService, 'getQuestions' ).and.returnValue( Observable.of( ['a', 'b', 'c'] ) );
      spyOn( $ctrl, 'changeMatchState' );

      $ctrl.onActivate();
      expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
      expect( $ctrl.answers ).toEqual( [] );
      expect( $ctrl.questions ).toEqual( ['b', 'c'] );
      expect( $ctrl.questionIndex ).toEqual( 1 );
      expect( $ctrl.questionCount ).toEqual( 3 );
      expect( $ctrl.question ).toEqual( 'a' );
      expect( $ctrl.changeMatchState ).toHaveBeenCalledWith( 'question' );
    } );
  } );

  describe( 'onQuestionAnswer', () => {
    beforeEach( () => {
      spyOn( $ctrl, 'changeMatchState' );
      $ctrl.questionIndex = 2;
      $ctrl.answers = [{key: 'a', answer: 'a'}];
    } );

    describe( 'more questions', () => {
      it( 'asks next question', () => {
        $ctrl.questions = ['b', 'c'];

        $ctrl.onQuestionAnswer( 'key', 'answer' );
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
        expect( $ctrl.answers ).toEqual( [{key: 'a', answer: 'a'}, {key: 'key', answer: 'answer'}] );
        expect( $ctrl.question ).toEqual( 'b' );
        expect( $ctrl.questionIndex ).toEqual( 3 );
        expect( $ctrl.changeMatchState ).toHaveBeenCalledWith( 'question' );
      } );
    } );

    describe( 'no more questions', () => {
      it( 'proceeds to success on submitAnswers success', () => {
        spyOn( $ctrl.verificationService, 'submitAnswers' ).and.returnValue( Observable.of( {} ) );
        $ctrl.questions = [];

        $ctrl.onQuestionAnswer( 'key', 'answer' );
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
        expect( $ctrl.answers ).toEqual( [{key: 'a', answer: 'a'}, {key: 'key', answer: 'answer'}] );
        expect( $ctrl.question ).not.toBeDefined();
        expect( $ctrl.questionIndex ).toEqual( 2 );
        expect( $ctrl.verificationService.submitAnswers ).toHaveBeenCalledWith( [{key: 'a', answer: 'a'}, {
          key:    'key',
          answer: 'answer'
        }] );
        expect( $ctrl.changeMatchState ).toHaveBeenCalledWith( 'success' );
      } );

      it( 'proceeds to success-failure on submitAnswers failure', () => {
        spyOn( $ctrl.verificationService, 'submitAnswers' ).and.returnValue( Observable.throw( {} ) );
        $ctrl.questions = [];

        $ctrl.onQuestionAnswer( 'key', 'answer' );
        expect( $ctrl.verificationService.submitAnswers ).toHaveBeenCalledWith( [{key: 'a', answer: 'a'}, {
          key:    'key',
          answer: 'answer'
        }] );
        expect( $ctrl.changeMatchState ).toHaveBeenCalledWith( 'success-failure' );
      } );
    } );
  } );
} );
