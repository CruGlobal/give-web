import angular from 'angular'
import template from './userMatchQuestion.tpl.html'

const componentName = 'userMatchQuestion'

class UserMatchQuestionController {
  /* @ngInject */
  constructor () {
    this.hasError = false
  }

  $onChanges (changes) {
    if (changes.question) {
      this.answer = this.question.answer
    }
  }

  selectAnswer () {
    this.hasError = false
    if (!this.questionForm.$valid) {
      this.hasError = true
    } else {
      this.onQuestionAnswer({
        question: this.question,
        answer: this.answer
      })
    }
  }
}

export default angular
  .module(componentName, [])
  .component(componentName, {
    controller: UserMatchQuestionController,
    templateUrl: template,
    bindings: {
      question: '<',
      questionIndex: '<',
      questionCount: '<',
      onBack: '&',
      onQuestionAnswer: '&'
    }
  })
