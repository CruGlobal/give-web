import angular from 'angular'
import template from './userMatchQuestion.tpl.html'

const componentName = 'userMatchQuestion'

class UserMatchQuestionController {
  /* @ngInject */
  constructor () {
    this.hasError = false
  }

  selectAnswer () {
    this.hasError = false
    if (!this.questionForm.$valid) {
      this.hasError = true
    } else {
      this.onQuestionAnswer({
        key: this.question.key,
        answer: this.answer.answer
      })
      delete this.answer
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
