import angular from 'angular';
import template from './userMatchQuestion.tpl';

let componentName = 'userMatchQuestion';

class UserMatchQuestionController {

  /* @ngInject */
  constructor() {
    this.hasError = false;
  }

  selectAnswer() {
    this.hasError = false;
    if ( !this.questionForm.$valid ) {
      this.hasError = true;
    }
    else {
      this.onQuestionAnswer( {
        key:    this.question.key,
        answer: this.answer.answer
      } );
    }
  }
}

export default angular
  .module( componentName, [
    template.name
  ] )
  .component( componentName, {
    controller:  UserMatchQuestionController,
    templateUrl: template.name,
    bindings:    {
      question:         '<',
      questionIndex:    '<',
      questionCount:    '<',
      onQuestionAnswer: '&'
    }
  } );
