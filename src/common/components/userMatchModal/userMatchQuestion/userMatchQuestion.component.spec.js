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
    it('sets the new answer value', () => {
      expect($ctrl.answer).toEqual({'answer': 'answer'})
      $ctrl.question.answer = 'new answer'
      $ctrl.$onChanges({
        question: {
          answer: 'new answer'
        }
      })
      expect($ctrl.answer).toEqual('new answer')
    })

    it('submits the form when submitted changes to true', () => {
      $ctrl.$onChanges({
        submitted: { currentValue: true }
      })

      expect($ctrl.onQuestionAnswer).toHaveBeenCalled()
    })

    it('does nothing when the when submitted changes to false', () => {
      $ctrl.$onChanges({
        submitted: { currentValue: false }
      })

      expect($ctrl.onQuestionAnswer).not.toHaveBeenCalled()
    })
  })

  describe('selectAnswer()', () => {
    describe('invalid form', () => {
      it('sets hasError to true', () => {
        $ctrl.selectAnswer()

        expect($ctrl.hasError).toEqual(true)
        expect($ctrl.onQuestionAnswer).toHaveBeenCalledWith({ success: false })
        expect($ctrl.answer).toEqual({ answer: 'answer' })
      })
    })

    describe('valid form', () => {
      it('submits the answer', () => {
        $ctrl.questionForm.$valid = true

        expect($ctrl.answer).toEqual({ answer: 'answer' })
        $ctrl.selectAnswer()

        expect($ctrl.onQuestionAnswer).toHaveBeenCalledWith({ success: true, question: { key: 'key' }, answer: { answer: 'answer' } })
        expect($ctrl.answer).toEqual({ answer: 'answer' })
      })
    })
  })
})
