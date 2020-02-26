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
  }

  $onInit () {
    this.setLoading({ loading: true })
    this.loadingDonorDetailsError = false
    this.skippedQuestions = false
    this.modalTitle = this.gettext('Activate your Account')
    this.profileService.getDonorDetails().subscribe((donorDetails) => {
      if (angular.isDefined(donorDetails['registration-state'])) {
        if (donorDetails['registration-state'] === 'COMPLETED') {
          this.skippedQuestions = true
          this.changeMatchState('success')
        } else if (donorDetails['registration-state'] === 'NEW') {
          // Do donor matching if
          this.postDonorMatch()
        } else {
          this.getContacts()
        }
      }
    },
    error => {
      this.setLoading({ loading: false })
      this.loadingDonorDetailsError = true
      this.$log.error('Error loading donorDetails.', error)
    })
  }

  postDonorMatch () {
    this.setLoading({ loading: true })
    this.verificationService.postDonorMatches().subscribe(() => {
      // Donor match success, get contacts
      this.getContacts()
    }, () => {
      // Donor Match failed, user match not required
      this.skippedQuestions = true
      this.changeMatchState('success')
    })
  }

  getContacts () {
    this.setLoading({ loading: true })
    this.verificationService.getContacts().subscribe((contacts) => {
      if (find(contacts, { selected: true })) {
        this.changeMatchState('activate')
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
      case 'identity':
        this.modalTitle = this.gettext('It looks like someone in your household has given to Cru previously')
        break
      case 'success':
        this.modalTitle = this.gettext('Success!')
        break
      case 'activate':
      default:
        this.modalTitle = this.gettext('Activate Your Account')
    }
    this.matchState = state
    this.setLoading({ loading: false })
  }

  onSelectContact (contact) {
    this.setLoading({ loading: true })
    this.selectContactError = false
    if (angular.isDefined(contact)) {
      this.verificationService.selectContact(contact).subscribe(() => {
        this.changeMatchState('activate')
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

  onActivate () {
    this.setLoading({ loading: true })
    this.loadingQuestionsError = false
    this.verificationService.getQuestions().subscribe((questions) => {
      this.answers = []
      this.questions = questions
      this.questionIndex = 1
      this.questionCount = this.questions.length
      this.question = this.questions.shift()
      this.changeMatchState('question')
    },
    error => {
      this.setLoading({ loading: false })
      this.loadingQuestionsError = true
      this.$log.error('Error loading verification questions.', error)
    })
  }

  onQuestionAnswer (key, answer) {
    this.setLoading({ loading: true })
    this.answers.push({ key: key, answer: answer })
    this.question = this.questions.shift()
    if (angular.isDefined(this.question)) {
      this.questionIndex++
      this.changeMatchState('question')
    } else {
      this.verificationService.submitAnswers(this.answers).subscribe(() => {
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
      modalTitle: '=',
      setLoading: '&',
      onStateChange: '&',
      onSuccess: '&'
    }
  })
