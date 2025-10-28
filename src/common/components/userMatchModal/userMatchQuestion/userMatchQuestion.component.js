import angular from 'angular';
import template from './userMatchQuestion.tpl.html';

const componentName = 'userMatchQuestion';

class UserMatchQuestionController {
  /* @ngInject */
  constructor() {
    this.hasError = false;
  }

  $onChanges(changes) {
    if (changes.question) {
      this.answer = this.question.answer;
    }
    if (changes.submitted && changes.submitted.currentValue === true) {
      this.selectAnswer();
    }
  }

  selectAnswer() {
    this.hasError = false;
    if (!this.questionForm.$valid) {
      this.hasError = true;
      this.onQuestionAnswer({
        success: false,
      });
    } else {
      this.onQuestionAnswer({
        success: true,
        question: this.question,
        answer: this.answer,
      });
    }
  }
}

export default angular.module(componentName, []).component(componentName, {
  controller: UserMatchQuestionController,
  templateUrl: template,
  bindings: {
    question: '<',
    questionIndex: '<',
    questionCount: '<',
    // Set to true from the parent to cause the form to submit and call onSubmit if it is valid
    submitted: '<',
    // Called with a `success` boolean to indicate whether the selection was valid
    // If the selection is valid, it is also called with `question` set to the current question
    // and `answer` set to the selected answer
    onQuestionAnswer: '&',
  },
});
