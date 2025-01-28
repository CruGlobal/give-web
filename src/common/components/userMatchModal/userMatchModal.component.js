import angular from 'angular'
import 'angular-gettext'
import profileService from 'common/services/api/profile.service'
import verificationService from 'common/services/api/verification.service'
import userMatchIdentity from './userMatchIdentity/userMatchIdentity.component'
import userMatchQuestion from './userMatchQuestion/userMatchQuestion.component'
import analyticsFactory from 'app/analytics/analytics.factory'
import template from './userMatchModal.tpl.html'
import find from 'lodash/find'
import failedVerificationModal from 'common/components/failedVerificationModal/failedVerificationModal.component'

const componentName = 'userMatchModal'

class UserMatchModalController {
  /* @ngInject */
  constructor ($log, $window, gettext, profileService, verificationService, analyticsFactory) {
    this.$log = $log
    this.$window = $window
    this.gettext = gettext
    this.profileService = profileService
    this.verificationService = verificationService
    this.analyticsFactory = analyticsFactory
    this.stepCount = 8 // intro, name, 5 questions, and success
    this.identitySubmitted = false
    this.answerSubmitted = false
  }

  $onInit () {
    this.setLoading({ loading: true })
    this.loadingDonorDetailsError = false
    this.skippedQuestions = false
    this.modalTitle = this.gettext('Activate Your Account')
    this.profileService.getDonorDetails().subscribe((donorDetails) => {
      if (angular.isDefined(donorDetails['registration-state'])) {
        if (donorDetails['registration-state'] === 'COMPLETED') {
          this.skippedQuestions = true
          this.changeMatchState('success')
        } else if (donorDetails['registration-state'] === 'NEW') {
          // Do donor matching if
          this.postDonorMatch()
        } else {
          this.changeMatchState('intro')
        }
      }
    },
    error => {
      this.setLoading({ loading: false })
      this.loadingDonorDetailsError = true
      this.$log.error('Error loading donorDetails.', error)
    })
  }

  getCurrentStep () {
    if (this.matchState === 'intro') {
      return 0.1
    } else if (this.matchState === 'identity') {
      return 1
    } else if (this.matchState === 'question') {
      return this.questionIndex + 1 // questionIndex is 1-indexed, otherwise this would be + 2
    } else if (this.matchState === 'success') {
      return 7
    } else {
      return 0
    }
  }

  getQuestion () {
    return this.questions[this.questionIndex - 1]
  }

  postDonorMatch () {
    this.setLoading({ loading: true })
    this.verificationService.postDonorMatches().subscribe({
      next: () => { this.changeMatchState('intro') }, // Donor match success, get contacts
      error: () => {
        // Donor Match failed, user match not required
        this.skippedQuestions = true
        this.changeMatchState('success')
      }
    })
  }

  getContacts () {
    if (this.contacts) {
      // The user picked a contact then went back, so don't load the contacts again because there
      // probably won't even be any
      this.changeMatchState('identity')
      return
    }

    this.setLoading({ loading: true })
    this.verificationService.getContacts().subscribe((contacts) => {
      if (find(contacts, { selected: true })) {
        this.onActivate()
      } else {
        this.contacts = contacts
        this.changeMatchState('identity')
      }
    },
    error => {
      this.setLoading({ loading: false })
      this.loadingDonorDetailsError = true
      this.$log.error('Error loading verification contacts.', error)
    })
  }

  changeMatchState (state) {
    switch (state) {
      case 'success':
        this.modalTitle = this.gettext('Success!')
        this.onSuccess()
        break
      default:
        this.modalTitle = this.gettext('Activate Your Account')
        break
    }
    this.matchState = state
    this.setLoading({ loading: false })
  }

  onSelectContact (success, contact) {
    // If the user-match-identity selection was invalid, success will be false, but we still need to
    // reset identitySubmitted so that we can set it to true later when the user tries to submit again
    this.identitySubmitted = false
    if (!success) {
      return
    }

    this.setLoading({ loading: true })
    this.selectContactError = false
    if (angular.isDefined(contact)) {
      this.verificationService.selectContact(contact).subscribe(() => {
        this.onActivate()
        this.firstName = contact.name.includes(' ')
          ? contact.name.substring(0, contact.name.lastIndexOf(' '))
          : contact.name
      },
      error => {
        this.setLoading({ loading: false })
        this.selectContactError = true
        this.$log.error('Error selecting verification contact.', error)
      })
    } else {
      this.verificationService.thatIsNotMe().subscribe(() => {
        this.skippedQuestions = true
        this.changeMatchState('success')
      },
      error => {
        this.setLoading({ loading: false })
        this.selectContactError = true
        this.$log.error('Error selecting \'that-is-not-me\' verification contact', error)
      })
    }
  }

  // Request that the user-match-identity component submit the form because the user clicked next
  requestIdentitySubmit () {
    // Changing this will trigger $onChanges in user-match-identity, which will ultimately call
    // onSelectContact in this controller
    this.identitySubmitted = true
  }

  // Request that the user-match-question component submit the form because the user clicked next
  requestAnswerSubmit () {
    // Changing this will trigger $onChanges in user-match-question, which will ultimately call
    // onQuestionAnswer in this controller
    this.answerSubmitted = true
  }

  onActivate () {
    this.setLoading({ loading: true })
    this.loadingQuestionsError = false
    this.verificationService.getQuestions().subscribe((questions) => {
      this.questions = questions
      this.questionIndex = 1
      this.questionCount = this.questions.length
      this.changeMatchState('question')
    },
    error => {
      this.setLoading({ loading: false })
      this.loadingQuestionsError = true
      this.$log.error('Error loading verification questions.', error)
    })
  }

  onQuestionAnswer (success, question, answer) {
    // If the user-match-question selection was invalid, success will be false, but we still need to
    // reset answerSubmitted so that we can set it to true later when the user tries to submit again
    this.answerSubmitted = false
    if (!success) {
      return
    }

    this.setLoading({ loading: true })
    question.answer = answer
    if (this.questionIndex < this.questions.length) {
      this.questionIndex++
      this.changeMatchState('question')
    } else {
      const answers = this.questions.map(({ key, answer }) => ({ key, answer }))
      this.verificationService.submitAnswers(answers).subscribe(() => {
        this.changeMatchState('success')
      },
      error => {
        this.setLoading({ loading: false })
        this.$log.debug('Failed verification questions', error)
        this.changeMatchState('failure')
      })
    }
  }

  onFailure () {
    this.$window.location = '/'
  }

  back () {
    if (this.questionIndex === 1) {
      this.changeMatchState('identity')
    } else {
      this.questionIndex--
    }
  }

  continueCheckout () {
    this.$window.location = '/checkout.html'
  }

  goToOpportunities () {
    this.$window.location = '/'
  }

  goToGivingDashboard () {
    this.$window.location = '/your-giving.html'
  }
}

export default angular
  .module(componentName, [
    'gettext',
    verificationService.name,
    profileService.name,
    userMatchIdentity.name,
    userMatchQuestion.name,
    analyticsFactory.name,
    failedVerificationModal.name
  ])
  .component(componentName, {
    controller: UserMatchModalController,
    templateUrl: template,
    bindings: {
      cartCount: '<',
      firstName: '=',
      modalTitle: '=',
      setLoading: '&',
      onStateChange: '&',
      onSuccess: '&'
    }
  })
