import angular from 'angular';
import 'angular-mocks';
import module from './verification.service';

import contactsResponse from './fixtures/cortex-verificationcontacts.fixture';
import questionsResponse from './fixtures/cortex-verifyregistrations-form';

describe( 'verification service', () => {
  beforeEach( angular.mock.module( module.name ) );
  let verificationService, $httpBackend;

  beforeEach( inject( ( _verificationService_, _$httpBackend_ ) => {
    verificationService = _verificationService_;
    $httpBackend = _$httpBackend_;
  } ) );

  afterEach( () => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  } );

  describe( 'getContacts()', () => {
    it( 'should load the matched contacts', () => {
      $httpBackend
        .expectGET( 'https://cortex-gateway-stage.cru.org/cortex/verificationcontacts/crugive?zoom=element' )
        .respond( 200, contactsResponse );
      verificationService.getContacts().subscribe( ( contacts ) => {
        expect( contacts ).toEqual( jasmine.arrayContaining( [
          jasmine.objectContaining( {name: 'BillRegister RegisterTest'} ),
          jasmine.objectContaining( {name: 'LadyRegister RegisterTest'} )
        ] ) );
      } );
      $httpBackend.flush();
    } );
  } );

  describe( 'selectContact(contact)', () => {
    it( 'should select specified contact', () => {
      $httpBackend
        .expectPOST( 'https://cortex-gateway-stage.cru.org/cortex/verificationcontacts/crugive/a5umfmtuhnfelqvlkjfdgltkohbkuwsjlu6ve7ksykxsrqvtlnac6s2qij44hatbhzjuojdqohblcwocuxbl23kqobg4fl27yktdsxkahlbkeskphfyxwti=', contactsResponse._element[0] )
        .respond( 201, {} );
      verificationService.selectContact( contactsResponse._element[0] );
      $httpBackend.flush();
    } );
  } );

  describe( 'getQuestions()', () => {
    it( 'should get questions and answers', () => {
      $httpBackend
        .expectGET( 'https://cortex-gateway-stage.cru.org/cortex/verifyregistrations/crugive/form' )
        .respond( 200, questionsResponse );
      verificationService.getQuestions().subscribe( ( questions ) => {
        expect( questions ).toEqual( jasmine.any( Array ) );
        expect( questions.length ).toEqual( 5 );
      } );
      $httpBackend.flush();
    } );
  } );

  describe( 'submitAnswers(answers)', () => {
    let answers = [{key: 'a', answer: '1'}, {key: 'b', answer: '2'}];
    it( 'submits donor verification answers', () => {
      $httpBackend
        .expectPOST( 'https://cortex-gateway-stage.cru.org/cortex/verifyregistrations/crugive?followLocation=true', {
          'verification-questions': answers,
          'that-is-not-me':         'false'
        } )
        .respond( 201, {} );
      verificationService.submitAnswers( answers );
      $httpBackend.flush();
    } );
  } );

  describe( 'thatIsNotMe()', () => {
    it( 'submits \'that-is-not-me\' donor verification', () => {
      $httpBackend
        .expectPOST( 'https://cortex-gateway-stage.cru.org/cortex/verifyregistrations/crugive?followLocation=true', {
          'that-is-not-me': 'true'
        } )
        .respond( 201, {} );
      verificationService.thatIsNotMe();
      $httpBackend.flush();
    } );
  } );

  describe( 'postDonorMatches()', () => {
    it( 'posts donor matches form', () => {
      $httpBackend
        .expectPOST( 'https://cortex-gateway-stage.cru.org/cortex/donormatches/crugive', {} )
        .respond( 200, {} );
      verificationService.postDonorMatches();
      $httpBackend.flush();
    } );
  } );
} );
