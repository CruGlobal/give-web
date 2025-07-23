export default {
  self: {
    type: 'elasticpath.receipts.receipt-summaries',
    uri: '/receipts/items/a5ue6ml5yobdlqvdykxflqvgghbkg6dpykuvmqbqjm4cgwocvnlxyqocxvwta4gcwjjfopktnvje3qvoku6xist2fzt4fi2whyqq=',
    href: 'https://give-stage2.cru.org/cortex/receipts/items/a5ue6ml5yobdlqvdykxflqvgghbkg6dpykuvmqbqjm4cgwocvnlxyqocxvwta4gcwjjfopktnvje3qvoku6xist2fzt4fi2whyqq=',
  },
  links: [
    {
      rel: 'receiptsummarylookupform',
      type: 'elasticpath.receipts.date-range',
      uri: '/receipts/form',
      href: 'https://give-stage2.cru.org/cortex/receipts/form',
    },
    {
      rel: 'element',
      rev: 'list',
      type: 'orderId',
      uri: '/receipt/1-1106420519',
      href: 'https://give-stage2.cru.org/cortex/receipt/1-1106420519',
    },
    {
      rel: 'element',
      rev: 'list',
      type: 'orderId',
      uri: '/receipt/1-1056130965',
      href: 'https://give-stage2.cru.org/cortex/receipt/1-1056130965',
    },
  ],
  'receipt-summaries': [
    {
      'designation-names': ['David and Margo Neibling (0105987)'],
      'total-amount': 25,
      'transaction-date': {
        'display-value': '2016-11-16',
        value: 1447632000000,
      },
      'transaction-number': '1-1106420519',
    },
    {
      'designation-names': ['David and Margo Neibling (0105987)'],
      'total-amount': 25,
      'transaction-date': {
        'display-value': '2015-10-15',
        value: 1444867200000,
      },
      'transaction-number': '1-1056130965',
    },
  ],
};
