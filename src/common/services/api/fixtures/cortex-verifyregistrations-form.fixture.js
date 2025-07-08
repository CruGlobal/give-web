export default {
  self: {
    type: 'elasticpath.verifyregistrations.verify-account',
    uri: '/verifyregistrations/crugive/form',
    href: 'https://give-stage2.cru.org/cortex/verifyregistrations/crugive/form',
  },
  links: [
    {
      rel: 'finalizeaction',
      type: 'elasticpath.verifyregistrations.verify-account',
      uri: '/verifyregistrations/crugive',
      href: 'https://give-stage2.cru.org/cortex/verifyregistrations/crugive',
    },
    {
      rel: 'verificationquestions',
      type: 'elasticpath.verificationquestions.verification-question',
      uri: '/verifyregistrations/crugive/verificationquestions',
      href: 'https://give-stage2.cru.org/cortex/verifyregistrations/crugive/verificationquestions',
    },
  ],
  'that-is-not-me': '',
  'verification-questions': [
    {
      answer: '',
      answers: [
        { answer: '12345 Register St' },
        { answer: '2102 Horncastle Dr' },
        { answer: '701Shamrock Rd' },
        { answer: '1306 E Wells Street' },
        { answer: 'None of these' },
      ],
      key: 'previous-address',
      'question-text':
        'Our records indicate that you may have lived at one of these previous addresses:',
    },
    {
      answer: '',
      answers: [
        { answer: 'Peoples Credit Union' },
        { answer: 'Wells Fargo Bank, N.A' },
        { answer: 'Oregon Community Bank' },
        { answer: 'Register Bank' },
        { answer: 'None of these' },
      ],
      key: 'previous-bank',
      'question-text':
        'Our records indicate that you may have given a gift to Cru from one of these banks:',
    },
    {
      answer: '',
      answers: [
        { answer: '2265' },
        { answer: '8918' },
        { answer: '6657' },
        { answer: '4306' },
        { answer: 'None of these' },
      ],
      key: 'previous-cc',
      'question-text':
        'Our records indicate that you may have given a gift to Cru using a credit card with these last four digits:',
    },
    {
      answer: '',
      answers: [
        { answer: 'Lewis and Barbara Winkler' },
        { answer: 'Augustin Detres' },
        { answer: 'Marc and Evangeline Vergo' },
        { answer: 'Danielle DeMorett' },
        { answer: 'None of these' },
      ],
      key: 'staff-member-gift',
      'question-text':
        'Our records indicate that you may have given a gift to one of these Cru staff members or students:',
    },
    {
      answer: '',
      answers: [
        { answer: 'AIA Baseball-Florida' },
        { answer: 'AIA Volleyball Camp Scholarships' },
        { answer: 'EE-MOL-Mpta-Genl Moldova Mptas' },
        { answer: 'Summer Intern-Benjamin Leppard' },
        { answer: 'None of these' },
      ],
      key: 'ministry-gift',
      'question-text':
        'Our records indicate that you may have given a gift to one of these Cru ministries:',
    },
  ],
};
