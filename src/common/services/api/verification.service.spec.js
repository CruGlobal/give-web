import angular from 'angular';
import 'angular-mocks';
import module from './verification.service';

import contactsResponse from './fixtures/cortex-verificationcontacts.fixture';
import questionsResponse from './fixtures/cortex-verifyregistrations-form.fixture';

describe('verification service', () => {
  beforeEach(angular.mock.module(module.name));
  let verificationService, $httpBackend;

  beforeEach(inject((_verificationService_, _$httpBackend_) => {
    verificationService = _verificationService_;
    $httpBackend = _$httpBackend_;
  }));

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('getContacts()', () => {
    it('should load the matched contacts', () => {
      $httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/verificationcontacts/crugive',
        )
        .respond(200, contactsResponse);
      verificationService.getContacts().subscribe((contacts) => {
        expect(contacts).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: 'BillRegister RegisterTest' }),
            expect.objectContaining({ name: 'LadyRegister RegisterTest' }),
          ]),
        );
      });
      $httpBackend.flush();
    });
  });

  describe('selectContact(contact)', () => {
    it('should select specified contact', () => {
      $httpBackend
        .expectPOST(
          'https://give-stage2.cru.org/cortex/verificationcontacts/crugive/form',
          contactsResponse['verification-contacts'][0],
        )
        .respond(201, {});
      verificationService.selectContact(
        contactsResponse['verification-contacts'][0],
      );
      $httpBackend.flush();
    });
  });

  describe('getQuestions()', () => {
    it('should get questions and answers', () => {
      $httpBackend
        .expectGET(
          'https://give-stage2.cru.org/cortex/verifyregistrations/crugive/form',
        )
        .respond(200, questionsResponse);
      verificationService.getQuestions().subscribe((questions) => {
        expect(questions).toEqual(expect.any(Array));
        expect(questions.length).toEqual(5);
      });
      $httpBackend.flush();
    });
  });

  describe('submitAnswers(answers)', () => {
    const answers = [
      { key: 'a', answer: '1' },
      { key: 'b', answer: '2' },
    ];
    it('submits donor verification answers', () => {
      $httpBackend
        .expectPOST(
          'https://give-stage2.cru.org/cortex/verifyregistrations/crugive/form?FollowLocation=true',
          {
            'verification-questions': answers,
            'that-is-not-me': 'false',
          },
        )
        .respond(201, {});
      verificationService.submitAnswers(answers);
      $httpBackend.flush();
    });
  });

  describe('thatIsNotMe()', () => {
    it("submits 'that-is-not-me' donor verification", () => {
      $httpBackend
        .expectPOST(
          'https://give-stage2.cru.org/cortex/verifyregistrations/crugive/form?FollowLocation=true',
          {
            'that-is-not-me': 'true',
          },
        )
        .respond(201, {});
      verificationService.thatIsNotMe();
      $httpBackend.flush();
    });
  });

  describe('postDonorMatches()', () => {
    it('posts donor matches form', () => {
      $httpBackend
        .expectPOST(
          'https://give-stage2.cru.org/cortex/donormatches/crugive/form',
          {},
        )
        .respond(200, {});
      verificationService.postDonorMatches();
      $httpBackend.flush();
    });
  });
});
