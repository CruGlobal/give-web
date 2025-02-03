import angular from 'angular'
import 'angular-mocks'
import module from './userMatchModal.component'

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'

describe('userMatchModal', function () {
  beforeEach(angular.mock.module(module.name))
  let $ctrl, bindings

  beforeEach(inject(function (_$componentController_) {
    bindings = {
      modalTitle: '',
      onStateChange: jest.fn(),
      onSuccess: jest.fn(),
      setLoading: jest.fn()
    }
    $ctrl = _$componentController_(module.name, { $window: { location: '/profile.html' } }, bindings)
  }))

  it('to be defined', function () {
    expect($ctrl).toBeDefined()
  })

  describe('$onInit()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl.verificationService, 'getContacts').mockImplementation(() => Observable.of([]))
      jest.spyOn($ctrl, 'changeMatchState').mockImplementation(() => {})
    })

    describe('donorDetails registration-state=\'COMPLETED\'', () => {
      it('does not load contacts', () => {
        jest.spyOn($ctrl.profileService, 'getDonorDetails').mockReturnValue(Observable.of({ 'registration-state': 'COMPLETED' }))
        $ctrl.$onInit()

        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
        expect($ctrl.modalTitle).toEqual('Activate Your Account')
        expect($ctrl.profileService.getDonorDetails).toHaveBeenCalled()
        expect($ctrl.verificationService.getContacts).not.toHaveBeenCalled()
        expect($ctrl.changeMatchState).toHaveBeenCalledWith('success')
        expect($ctrl.loadingDonorDetailsError).toEqual(false)
      })
    })

    it('should log an error on failure', () => {
      jest.spyOn($ctrl.profileService, 'getDonorDetails').mockReturnValue(Observable.throw('some error'))
      $ctrl.$onInit()

      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
      expect($ctrl.modalTitle).toEqual('Activate Your Account')
      expect($ctrl.profileService.getDonorDetails).toHaveBeenCalled()
      expect($ctrl.changeMatchState).not.toHaveBeenCalled()
      expect($ctrl.loadingDonorDetailsError).toEqual(true)
      expect($ctrl.$log.error.logs[0]).toEqual(['Error loading donorDetails.', 'some error'])
      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false })
    })

    describe('donorDetails registration-state=\'NEW\'', () => {
      beforeEach(() => {
        jest.spyOn($ctrl.profileService, 'getDonorDetails').mockReturnValue(Observable.of({ 'registration-state': 'NEW' }))
        jest.spyOn($ctrl, 'postDonorMatch').mockImplementation(() => {})
      })

      it('proceeds to postDonorMatch()', () => {
        $ctrl.$onInit()

        expect($ctrl.postDonorMatch).toHaveBeenCalled()
      })
    })

    describe('donorDetails registration-state=\'MATCHED\'', () => {
      beforeEach(() => {
        jest.spyOn($ctrl.profileService, 'getDonorDetails').mockReturnValue(Observable.of({ 'registration-state': 'MATCHED' }))
      })

      describe('getContacts has selected contact', () => {
        it('initializes the component and proceeds to \'identity\'', () => {
          $ctrl.$onInit()

          expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
          expect($ctrl.modalTitle).toEqual('Activate Your Account')
          expect($ctrl.profileService.getDonorDetails).toHaveBeenCalled()
          expect($ctrl.changeMatchState).toHaveBeenCalledWith('identity')
          expect($ctrl.loadingDonorDetailsError).toEqual(false)
        })
      })
    })
  })

  describe('getContacts()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'changeMatchState')
      jest.spyOn($ctrl.verificationService, 'getContacts')
    })

    it('initializes the component and proceeds to \'identity\'', () => {
      const contacts = [{ name: 'Charles Xavier', selected: false }, { name: 'Bruce Bannr', selected: false }]
      $ctrl.verificationService.getContacts.mockImplementation(() => Observable.of(contacts))
      $ctrl.getContacts()

      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
      expect($ctrl.verificationService.getContacts).toHaveBeenCalled()
      expect($ctrl.contacts).toEqual(contacts)
      expect($ctrl.changeMatchState).toHaveBeenCalledWith('identity')
      expect($ctrl.loadingDonorDetailsError).not.toEqual(true)
    })

    it('initializes the component and proceeds to \'activate\'', () => {
      const contacts = [{ name: 'Charles Xavier', selected: true }]
      jest.spyOn($ctrl.verificationService, 'getQuestions').mockReturnValue(Observable.of([{ key: 'a' }, { key: 'b' }, { key: 'c' }]))
      $ctrl.verificationService.getContacts.mockImplementation(() => Observable.of(contacts))
      $ctrl.contacts = null
      $ctrl.getContacts()
      expect($ctrl.verificationService.getContacts).toHaveBeenCalled()
      expect($ctrl.changeMatchState).toHaveBeenCalledWith('activate')
    })

    it('logs an error on failure', () => {
      $ctrl.verificationService.getContacts.mockReturnValue(Observable.throw('another error'))
      $ctrl.getContacts()

      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
      expect($ctrl.verificationService.getContacts).toHaveBeenCalled()
      expect($ctrl.loadingDonorDetailsError).toEqual(true)
      expect($ctrl.$log.error.logs[0]).toEqual(['Error loading verification contacts.', 'another error'])
      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false })
    })

    it('does not reload the contacts if they have already been loaded', () => {
      $ctrl.contacts = [{ name: 'Charles Xavier', selected: false }, { name: 'Bruce Bannr', selected: false }]
      $ctrl.getContacts()

      expect($ctrl.changeMatchState).toHaveBeenCalledWith('identity')
      expect($ctrl.verificationService.getContacts).not.toHaveBeenCalled()
    })
  })

  describe('postDonorMatch()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'changeMatchState').mockImplementation(() => {})
    })

    it('loads contacts on donor match success', () => {
      jest.spyOn($ctrl.verificationService, 'postDonorMatches').mockReturnValue(Observable.of({}))
      jest.spyOn($ctrl, 'getContacts').mockReturnValue(Observable.of({}))
      $ctrl.postDonorMatch()

      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
      expect($ctrl.getContacts).toHaveBeenCalled()
    })

    it('proceeds to success on donor match failure', () => {
      jest.spyOn($ctrl.verificationService, 'postDonorMatches').mockReturnValue(Observable.throw('error'))
      $ctrl.postDonorMatch()

      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
      expect($ctrl.skippedQuestions).toEqual(true)
      expect($ctrl.changeMatchState).toHaveBeenCalledWith('success')
    })
  })

  describe('changeMatchState(state)', () => {
    beforeEach(() => {
      $ctrl.matchState = ''
    })

    it('sets state and title on \'identity\'', () => {
      $ctrl.changeMatchState('identity')

      expect($ctrl.modalTitle).toEqual('Activate Your Account')
      expect($ctrl.matchState).toEqual('identity')
      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false })
    })

    it('sets state and title on \'success\'', () => {
      $ctrl.changeMatchState('success')

      expect($ctrl.modalTitle).toEqual('Success!')
      expect($ctrl.matchState).toEqual('success')
      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false })
    })

    it('sets state and title on \'activate\'', () => {
      $ctrl.changeMatchState('activate')

      expect($ctrl.modalTitle).toEqual('Activate Your Account')
      expect($ctrl.matchState).toEqual('activate')
      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false })
    })

    it('sets state and title on \'unknown-state\'', () => {
      $ctrl.changeMatchState('unknown-state')

      expect($ctrl.modalTitle).toEqual('Activate Your Account')
      expect($ctrl.matchState).toEqual('unknown-state')
      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false })
    })
  })

  describe('onSelectContact( contact )', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'changeMatchState').mockImplementation(() => {})
    })

    describe('valid contact', () => {
      it('selects the contact', () => {
        jest.spyOn($ctrl.verificationService, 'selectContact').mockReturnValue(Observable.of({}))
        $ctrl.onSelectContact(true, { name: 'Batman' })

        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
        expect($ctrl.verificationService.selectContact).toHaveBeenCalledWith({ name: 'Batman' })
        expect($ctrl.changeMatchState).toHaveBeenCalledWith('activate')
        expect($ctrl.selectContactError).toEqual(false)
        expect($ctrl.firstName).toEqual('Batman')
      })

      it('should log an error on failure', () => {
        jest.spyOn($ctrl.verificationService, 'selectContact').mockReturnValue(Observable.throw('some error'))
        $ctrl.onSelectContact(true, { name: 'Batman' })

        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
        expect($ctrl.verificationService.selectContact).toHaveBeenCalledWith({ name: 'Batman' })
        expect($ctrl.changeMatchState).not.toHaveBeenCalled()
        expect($ctrl.selectContactError).toEqual(true)
        expect($ctrl.$log.error.logs[0]).toEqual(['Error selecting verification contact.', 'some error'])
        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false })
      })

      it('should only return the first name', () => {
        jest.spyOn($ctrl.verificationService, 'selectContact').mockReturnValue(Observable.of({}))
        $ctrl.onSelectContact(true, { name: 'firstName lastName' })
        expect($ctrl.firstName).toEqual('firstName')
      })

      it('should return the first two first names', () => {
        jest.spyOn($ctrl.verificationService, 'selectContact').mockReturnValue(Observable.of({}))
        $ctrl.onSelectContact(true, { name: 'firstName secondFirstName lastName' })
        expect($ctrl.firstName).toEqual('firstName secondFirstName')
      })
    })

    describe('undefined', () => {
      it('selects \'that-is-not-me\'', () => {
        jest.spyOn($ctrl.verificationService, 'thatIsNotMe').mockReturnValue(Observable.of({}))
        $ctrl.onSelectContact(true)

        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
        expect($ctrl.verificationService.thatIsNotMe).toHaveBeenCalled()
        expect($ctrl.changeMatchState).toHaveBeenCalledWith('success')
      })

      it('should log an error on failure', () => {
        jest.spyOn($ctrl.verificationService, 'thatIsNotMe').mockReturnValue(Observable.throw('some error'))
        $ctrl.onSelectContact(true)

        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
        expect($ctrl.verificationService.thatIsNotMe).toHaveBeenCalled()
        expect($ctrl.changeMatchState).not.toHaveBeenCalled()
        expect($ctrl.selectContactError).toEqual(true)
        expect($ctrl.$log.error.logs[0]).toEqual(['Error selecting \'that-is-not-me\' verification contact', 'some error'])
        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false })
      })
    })

    describe('error', () => {
      it('aborts', () => {
        $ctrl.onSelectContact(false)

        expect($ctrl.identitySubmitted).toBe(false)
        expect($ctrl.setLoading).not.toHaveBeenCalled()
      })
    })
  })

  describe('loadQuestions()', () => {
    it('load questions and changes state', () => {
      jest.spyOn($ctrl.verificationService, 'getQuestions').mockReturnValue(Observable.of([{ key: 'a' }, { key: 'b' }, { key: 'c' }]))
      jest.spyOn($ctrl, 'changeMatchState').mockImplementation(() => {})

      $ctrl.loadQuestions()

      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
      expect($ctrl.questions).toEqual([{ key: 'a' }, { key: 'b' }, { key: 'c' }])
      expect($ctrl.questionIndex).toEqual(1)
      expect($ctrl.questionCount).toEqual(3)
      expect($ctrl.changeMatchState).toHaveBeenCalledWith('question')
      expect($ctrl.loadingQuestionsError).toEqual(false)
    })

    it('should log an error on failure', () => {
      jest.spyOn($ctrl.verificationService, 'getQuestions').mockReturnValue(Observable.throw('some error'))
      jest.spyOn($ctrl, 'changeMatchState').mockImplementation(() => {})

      $ctrl.loadQuestions()

      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
      expect($ctrl.changeMatchState).not.toHaveBeenCalled()
      expect($ctrl.loadingQuestionsError).toEqual(true)
      expect($ctrl.$log.error.logs[0]).toEqual(['Error loading verification questions.', 'some error'])
      expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false })
    })
  })

  describe('onQuestionAnswer()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'changeMatchState').mockImplementation(() => {})
      $ctrl.questionIndex = 2
      $ctrl.questions = [{ key: 'a', answer: 'a' }, { key: 'key', answer: '' }, { key: 'b', answer: '' }]
    })

    describe('more questions', () => {
      it('asks next question', () => {
        $ctrl.onQuestionAnswer(true, $ctrl.questions[1], 'answer')

        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
        expect($ctrl.questions).toEqual([{ key: 'a', answer: 'a' }, { key: 'key', answer: 'answer' }, { key: 'b', answer: '' }])
        expect($ctrl.questionIndex).toEqual(3)
        expect($ctrl.changeMatchState).toHaveBeenCalledWith('question')
      })
    })

    describe('no more questions', () => {
      beforeEach(() => {
        $ctrl.questions = $ctrl.questions.slice(0, 2)
      })

      it('proceeds to success on submitAnswers success', () => {
        jest.spyOn($ctrl.verificationService, 'submitAnswers').mockReturnValue(Observable.of({}))

        $ctrl.onQuestionAnswer(true, $ctrl.questions[1], 'answer')

        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
        expect($ctrl.questions).toEqual([{ key: 'a', answer: 'a' }, { key: 'key', answer: 'answer' }])
        expect($ctrl.questionIndex).toEqual(2)
        expect($ctrl.verificationService.submitAnswers).toHaveBeenCalledWith([{ key: 'a', answer: 'a' }, {
          key: 'key',
          answer: 'answer'
        }])

        expect($ctrl.changeMatchState).toHaveBeenCalledWith('success')
      })

      it('proceeds to failure on submitAnswers failure', () => {
        jest.spyOn($ctrl.verificationService, 'submitAnswers').mockReturnValue(Observable.throw({}))

        $ctrl.onQuestionAnswer(true, $ctrl.questions[1], 'answer')

        expect($ctrl.verificationService.submitAnswers).toHaveBeenCalledWith([{ key: 'a', answer: 'a' }, {
          key: 'key',
          answer: 'answer'
        }])

        expect($ctrl.changeMatchState).toHaveBeenCalledWith('failure')
      })
    })

    describe('error', () => {
      it('aborts', () => {
        $ctrl.onQuestionAnswer(false)

        expect($ctrl.answerSubmitted).toBe(false)
        expect($ctrl.setLoading).not.toHaveBeenCalled()
      })
    })
  })

  describe('onFailure()', () => {
    it('returns the user to the home page', () => {
      $ctrl.$onInit()
      $ctrl.onFailure()
      expect($ctrl.$window.location).toEqual('/')
    })
  })

  describe('getCurrentStep()', () => {
    it('returns the next question step', () => {
      $ctrl.matchState = 'question'
      $ctrl.questionIndex = 2
      expect($ctrl.getCurrentStep()).toEqual(1)
    })
    it('returns success step', () => {
      $ctrl.matchState = 'success'
      expect($ctrl.getCurrentStep()).toEqual(5)
    })
    it('returns default step', () => {
      $ctrl.matchState = 'default'
      expect($ctrl.getCurrentStep()).toEqual(0)
    })
  })

  describe('back()', () => {
    beforeEach(() => {
      jest.spyOn($ctrl, 'changeMatchState')
    })
    it('sends the user back a step to \'identity\'', () => {
      $ctrl.questionIndex = 1
      $ctrl.back()
      expect($ctrl.changeMatchState).toHaveBeenCalledWith('identity')
    })

    it('should proceed to the previous question', () => {
      $ctrl.questionIndex = 2
      $ctrl.back()
      expect($ctrl.changeMatchState).not.toHaveBeenCalled()
      expect($ctrl.questionIndex).toEqual(1)
    })
  })

  describe('continueCheckout()', () => {
    it('sends the user to the checkout', () => {
      $ctrl.$window.location = '/cart.html'
      $ctrl.continueCheckout()
      expect($ctrl.$window.location).toEqual('/checkout.html')
    })
  })

  describe('goToOpportunities()', () => {
    it('sends the user to the homepage', () => {
      $ctrl.$window.location = '/cart.html'
      $ctrl.goToOpportunities()
      expect($ctrl.$window.location).toEqual('/')
    })
  })

  describe('goToGivingDashboard()', () => {
    it('sends the user to the dashboard', () => {
      $ctrl.$window.location = '/cart.html'
      $ctrl.goToGivingDashboard()
      expect($ctrl.$window.location).toEqual('/your-giving.html')
    })
  })
})
