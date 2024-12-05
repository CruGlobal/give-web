import angular from 'angular'
import 'angular-mocks'
import module from './userMatchQuestion.component'

describe('userMatchQuestion', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, bindings

  beforeEach(inject(function (_$componentController_) {
    bindings = {
      onQuestionAnswer: jest.fn(),
      questionForm: { $valid: false },
      question: { key: 'key' },
      answer: { answer: 'answer' }
    }
    $ctrl = _$componentController_(module.name, {}, bindings)
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
    expect($ctrl.hasError).toEqual(false)
  })

  describe('$onChanges', () => {
    it('should set the new answer value', () => {
      expect($ctrl.answer).toEqual({'answer': 'answer'})
      $ctrl.question.answer = 'new answer'
      $ctrl.$onChanges({
        question: {
          answer: 'new answer'
        }
      })
      expect($ctrl.answer).toEqual('new answer')
    })
  })

  describe('selectAnswer()', () => {
    describe('invalid form', () => {
      it('sets hasError to true', () => {
        $ctrl.selectAnswer()

        expect($ctrl.hasError).toEqual(true)
        expect($ctrl.onQuestionAnswer).not.toHaveBeenCalled()
        expect($ctrl.answer).toEqual({ answer: 'answer' })
      })
    })

    describe('valid form', () => {
      it('submits the answer', () => {
        $ctrl.questionForm.$valid = true

        expect($ctrl.answer).toEqual({ answer: 'answer' })
        $ctrl.selectAnswer()

        expect($ctrl.onQuestionAnswer).toHaveBeenCalledWith({question: { key: 'key' },  answer: { answer: 'answer' } })
        expect($ctrl.answer).toEqual({ answer: 'answer' })
      })
    })
  })
})
