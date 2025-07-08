export default {
  self: {
    type: 'elasticpath.carts.cart',
    uri: '/carts/crugive/mi3deztfgvqtsllgmq3teljuhbsdkllbhfqwcljugvrwembume2dqndcgu=?zoom=order:paymentinstrumentselector:chosen:description',
    href: 'https://give-stage2.cru.org/cortex/carts/crugive/mi3deztfgvqtsllgmq3teljuhbsdkllbhfqwcljugvrwembume2dqndcgu=?zoom=order:paymentinstrumentselector:chosen:description',
  },
  links: [
    {
      rel: 'lineitems',
      rev: 'cart',
      type: 'elasticpath.collections.links',
      uri: '/carts/crugive/mi3deztfgvqtsllgmq3teljuhbsdkllbhfqwcljugvrwembume2dqndcgu=/lineitems',
      href: 'https://give-stage2.cru.org/cortex/carts/crugive/mi3deztfgvqtsllgmq3teljuhbsdkllbhfqwcljugvrwembume2dqndcgu=/lineitems',
    },
    {
      rel: 'discount',
      type: 'elasticpath.discounts.discount',
      uri: '/discounts/carts/crugive/mi3deztfgvqtsllgmq3teljuhbsdkllbhfqwcljugvrwembume2dqndcgu=',
      href: 'https://give-stage2.cru.org/cortex/discounts/carts/crugive/mi3deztfgvqtsllgmq3teljuhbsdkllbhfqwcljugvrwembume2dqndcgu=',
    },
    {
      rel: 'order',
      rev: 'cart',
      type: 'elasticpath.orders.order',
      uri: '/orders/crugive/myywcnbqmmztgllegeydiljumfstillbmuzdqllggvrtgmlbmm3deyrsgi=',
      href: 'https://give-stage2.cru.org/cortex/orders/crugive/myywcnbqmmztgllegeydiljumfstillbmuzdqllggvrtgmlbmm3deyrsgi=',
    },
    {
      rel: 'appliedpromotions',
      type: 'elasticpath.collections.links',
      uri: '/promotions/carts/crugive/mi3deztfgvqtsllgmq3teljuhbsdkllbhfqwcljugvrwembume2dqndcgu=/applied',
      href: 'https://give-stage2.cru.org/cortex/promotions/carts/crugive/mi3deztfgvqtsllgmq3teljuhbsdkllbhfqwcljugvrwembume2dqndcgu=/applied',
    },
    {
      rel: 'ratetotals',
      type: 'elasticpath.ratetotals.rate-total',
      uri: '/ratetotals/carts/crugive/mi3deztfgvqtsllgmq3teljuhbsdkllbhfqwcljugvrwembume2dqndcgu=',
      href: 'https://give-stage2.cru.org/cortex/ratetotals/carts/crugive/mi3deztfgvqtsllgmq3teljuhbsdkllbhfqwcljugvrwembume2dqndcgu=',
    },
    {
      rel: 'total',
      rev: 'cart',
      type: 'elasticpath.totals.total',
      uri: '/totals/carts/crugive/mi3deztfgvqtsllgmq3teljuhbsdkllbhfqwcljugvrwembume2dqndcgu=',
      href: 'https://give-stage2.cru.org/cortex/totals/carts/crugive/mi3deztfgvqtsllgmq3teljuhbsdkllbhfqwcljugvrwembume2dqndcgu=',
    },
  ],
  _order: [
    {
      _paymentinstrumentselector: [
        {
          _chosen: [
            {
              _description: [
                {
                  self: {
                    type: 'paymentinstruments.payment-instrument',
                    uri: '/paymentinstruments/orders/crugive/mnrwmntdmjrgkljvgi4gmljugrstcllbmjqtsllegq2winbvgbrdamrzgm=/orderpaymentinstrument/gnstmzrymiytoljugbrdmljuheygellcmy2gmllcgm4dsnjygu2gmnryme=',
                    href: 'https://give-stage2.cru.org/cortex/paymentinstruments/orders/crugive/mnrwmntdmjrgkljvgi4gmljugrstcllbmjqtsllegq2winbvgbrdamrzgm=/orderpaymentinstrument/gnstmzrymiytoljugbrdmljuheygellcmy2gmllcgm4dsnjygu2gmnryme=',
                  },
                  messages: [],
                  links: [],
                  'default-on-profile': false,
                  'limit-amount': {
                    amount: 0,
                    currency: 'USD',
                    display: '$0.00',
                  },
                  name: 'Cru Payment Instrument',
                  'payment-instrument-identification-attributes': {
                    'account-type': 'checking',
                    'bank-name': 'My Bank Name',
                    'display-account-number': '3456',
                    'encrypted-account-number':
                      '4e981aa5-993a-4771-85fa-bbcd322ce189:SHv8dEQBg8XSO5P0SFXwQg',
                    'routing-number': '000000000',
                  },
                  'saved-on-profile': true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  'total-quantity': 1,
};
