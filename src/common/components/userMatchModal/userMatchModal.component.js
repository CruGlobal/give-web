import angular from 'angular';
import 'angular-gettext';
import loadingOverlay from 'common/components/loadingOverlay/loadingOverlay.component';
import verificationService from 'common/services/api/verification.service';
import userMatchIdentity from './userMatchIdentity/userMatchIdentity.component';
import userMatchQuestion from './userMatchQuestion/userMatchQuestion.component';
import template from './userMatchModal.tpl';

let componentName = 'userMatchModal';

class UserMatchModalController {

  /* @ngInject */
  constructor( gettext, verificationService ) {
    this.gettext = gettext;
    this.verificationService = verificationService;
  }

  $onInit() {
    this.setLoading( {loading: true} );
    this.modalTitle = this.gettext( 'Activate your Account' );
    this.verificationService.getContacts().subscribe( ( data ) => {
      this.contacts = data.contacts;
      this.changeMatchState( 'identity' );
    } );
  }

  changeMatchState( state ) {
    switch ( state ) {
      case 'identity':
        this.modalTitle = this.gettext( 'It looks like someone in your household has given to Cru previously' );
        break;
      case 'success':
        this.modalTitle = this.gettext( 'Success!' );
        break;
      case 'activate':
      default:
        this.modalTitle = this.gettext( 'Activate Your Account' );
    }
    this.matchState = state;
    this.setLoading( {loading: false} );
  }

  onSelectContact( contact ) {
    this.setLoading( {loading: true} );
    if ( angular.isDefined( contact ) ) {
      this.verificationService.selectContact( contact ).subscribe( () => {
        this.changeMatchState( 'activate' );
      } );
    }
    else {
      this.verificationService.thatIsNotMe().subscribe( () => {
        // TODO: this-is-not-me=true
        this.changeMatchState( 'success' );
      } );
    }
  }

  onActivate() {
    this.setLoading( {loading: true} );
    this.verificationService.getQuestions().subscribe( ( questions ) => {
      this.answers = [];
      this.questions = questions;
      this.questionIndex = 1;
      this.questionCount = this.questions.length;
      this.question = this.questions.shift();
      this.changeMatchState( 'question' );
    } );
  }

  onQuestionAnswer( key, answer ) {
    this.setLoading( {loading: true} );
    this.answers.push( {key: key, answer: answer} );
    this.question = this.questions.shift();
    if ( angular.isDefined( this.question ) ) {
      this.questionIndex++;
      this.changeMatchState( 'question' );
    }
    else {
      this.verificationService.submitAnswers( this.answers ).subscribe( () => {
        this.changeMatchState( 'success' );
      } );
    }
  }
}

export default angular
  .module( componentName, [
    'gettext',
    verificationService.name,
    loadingOverlay.name,
    template.name,
    userMatchIdentity.name,
    userMatchQuestion.name
  ] )
  .component( componentName, {
    controller:  UserMatchModalController,
    templateUrl: template.name,
    bindings:    {
      modalTitle:    '=',
      setLoading:    '&',
      onStateChange: '&',
      onSuccess:     '&'
    }
  } );
