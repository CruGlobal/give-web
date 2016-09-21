import angular from 'angular';
import 'angular-mocks';
import module from './userMatchQuestion.component';

describe( 'userMatchQuestion', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, bindings;

  beforeEach( inject( function ( _$componentController_ ) {
    bindings = {
      onQuestionAnswer: jasmine.createSpy( 'onQuestionAnswer' ),
      questionForm:     {$valid: false},
      question:         {key: 'key'},
      answer:           {answer: 'answer'}
    };
    $ctrl = _$componentController_( module.name, {}, bindings );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
    expect( $ctrl.hasError ).toEqual( false );
  } );

  describe( 'selectAnswer()', () => {
    describe( 'invalid form', () => {
      it( 'sets hasError', () => {
        $ctrl.selectAnswer();
        expect( $ctrl.hasError ).toEqual( true );
      } );
    } );

    describe( 'valid form', () => {
      it( 'submits the answer', () => {
        $ctrl.questionForm.$valid = true;
        $ctrl.selectAnswer();
        expect( $ctrl.onQuestionAnswer ).toHaveBeenCalledWith( {key: 'key', answer: 'answer'} );
      } );
    } );
  } );
} );
