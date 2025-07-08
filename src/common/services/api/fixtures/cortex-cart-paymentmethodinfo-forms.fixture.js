export default {
  self: {
    type: 'elasticpath.carts.cart',
    uri: '/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=?zoom=order:paymentmethodinfo:element,order:paymentmethodinfo:element:paymentinstrumentform',
    href: 'http://give-ep-cortex-uat.aws.cru.org/cortex/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=?zoom=order:paymentmethodinfo:element,order:paymentmethodinfo:element:paymentinstrumentform',
  },
  links: [
    {
      rel: 'lineitems',
      rev: 'cart',
      type: 'elasticpath.collections.links',
      uri: '/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=/lineitems',
      href: 'http://give-ep-cortex-uat.aws.cru.org/cortex/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=/lineitems',
    },
    {
      rel: 'discount',
      type: 'elasticpath.discounts.discount',
      uri: '/discounts/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=',
      href: 'http://give-ep-cortex-uat.aws.cru.org/cortex/discounts/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=',
    },
    {
      rel: 'order',
      rev: 'cart',
      type: 'elasticpath.orders.order',
      uri: '/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=',
      href: 'http://give-ep-cortex-uat.aws.cru.org/cortex/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=',
    },
    {
      rel: 'appliedpromotions',
      type: 'elasticpath.collections.links',
      uri: '/promotions/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=/applied',
      href: 'http://give-ep-cortex-uat.aws.cru.org/cortex/promotions/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=/applied',
    },
    {
      rel: 'ratetotals',
      type: 'elasticpath.ratetotals.rate-total',
      uri: '/ratetotals/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=',
      href: 'http://give-ep-cortex-uat.aws.cru.org/cortex/ratetotals/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=',
    },
    {
      rel: 'total',
      rev: 'cart',
      type: 'elasticpath.totals.total',
      uri: '/totals/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=',
      href: 'http://give-ep-cortex-uat.aws.cru.org/cortex/totals/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=',
    },
  ],
  _order: [
    {
      _paymentmethodinfo: [
        {
          _element: [
            {
              self: {
                type: 'paymentmethods.order-payment-method',
                uri: '/paymentmethods/orders/crugive/gy2dmnrzgq4dcljvgq2doljuga2dkllcmu2deljumeygkmrxmrrwczrsmm=/gftgenrymm4dgllega2geljug44dillcga3dollbhe2wcnbugazdgobqgy=',
                href: 'http://give-ep-cortex-uat.aws.cru.org/cortex/paymentmethods/orders/crugive/gy2dmnrzgq4dcljvgq2doljuga2dkllcmu2deljumeygkmrxmrrwczrsmm=/gftgenrymm4dgllega2geljug44dillcga3dollbhe2wcnbugazdgobqgy=',
              },
              messages: [],
              links: [],
              _paymentinstrumentform: [
                {
                  self: {
                    type: 'paymentinstruments.order-payment-instrument-form',
                    uri: '/paymentinstruments/paymentmethods/orders/crugive/mjswgobwmy2gkljtgazwcljumfsweljzmu2teljzmmytazrsge3wkodfmu=/gftgenrymm4dgllega2geljug44dillcga3dollbhe2wcnbugazdgobqgy=/paymentinstrument/form',
                    href: 'http://give-ep-cortex-uat.aws.cru.org/cortex/paymentinstruments/paymentmethods/orders/crugive/mjswgobwmy2gkljtgazwcljumfsweljzmu2teljzmmytazrsge3wkodfmu=/gftgenrymm4dgllega2geljug44dillcga3dollbhe2wcnbugazdgobqgy=/paymentinstrument/form',
                  },
                  messages: [],
                  links: [
                    {
                      rel: 'createpaymentinstrumentaction',
                      type: 'paymentinstruments.order-payment-instrument-form',
                      href: 'http://give-ep-cortex-uat.aws.cru.org/cortex/paymentinstruments/paymentmethods/orders/crugive/mjswgobwmy2gkljtgazwcljumfsweljzmu2teljzmmytazrsge3wkodfmu=/gftgenrymm4dgllega2geljug44dillcga3dollbhe2wcnbugazdgobqgy=/paymentinstrument/form',
                    },
                  ],
                  'default-on-profile': false,
                  'limit-amount': 0,
                  'payment-instrument-identification-form': {
                    'account-type': '',
                    'bank-name': '',
                    'display-name': '',
                    'encrypted-account-number': '',
                    'routing-number': '',
                  },
                  'save-on-profile': false,
                },
              ],
              'display-name': 'BANKACCOUNT',
              name: 'BANKACCOUNT',
            },
            {
              self: {
                type: 'paymentmethods.order-payment-method',
                uri: '/paymentmethods/orders/crugive/gy2dmnrzgq4dcljvgq2doljuga2dkllcmu2deljumeygkmrxmrrwczrsmm=/g4ygeodbg42tilldha4wiljrgfswellbgvsdmllfgu4wenjxmu2ton3bgm=',
                href: 'http://give-ep-cortex-uat.aws.cru.org/cortex/paymentmethods/orders/crugive/gy2dmnrzgq4dcljvgq2doljuga2dkllcmu2deljumeygkmrxmrrwczrsmm=/g4ygeodbg42tilldha4wiljrgfswellbgvsdmllfgu4wenjxmu2ton3bgm=',
              },
              messages: [],
              links: [],
              _paymentinstrumentform: [
                {
                  self: {
                    type: 'paymentinstruments.order-payment-instrument-form',
                    uri: '/paymentinstruments/paymentmethods/orders/crugive/mnrwmntdmjrgkljvgi4gmljugrstcllbmjqtsllegq2winbvgbrdamrzgm=/g4ygeodbg42tilldha4wiljrgfswellbgvsdmllfgu4wenjxmu2ton3bgm=/paymentinstrument/form',
                    href: 'http://give-ep-cortex-uat.aws.cru.org/cortex/paymentinstruments/paymentmethods/orders/crugive/mnrwmntdmjrgkljvgi4gmljugrstcllbmjqtsllegq2winbvgbrdamrzgm=/g4ygeodbg42tilldha4wiljrgfswellbgvsdmllfgu4wenjxmu2ton3bgm=/paymentinstrument/form',
                  },
                  messages: [],
                  links: [
                    {
                      rel: 'createpaymentinstrumentaction',
                      type: 'paymentinstruments.order-payment-instrument-form',
                      href: 'http://give-ep-cortex-uat.aws.cru.org/cortex/paymentinstruments/paymentmethods/orders/crugive/mnrwmntdmjrgkljvgi4gmljugrstcllbmjqtsllegq2winbvgbrdamrzgm=/g4ygeodbg42tilldha4wiljrgfswellbgvsdmllfgu4wenjxmu2ton3bgm=/paymentinstrument/form',
                    },
                  ],
                  'billing-address': {
                    address: {
                      'country-name': '',
                      'extended-address': '',
                      locality: '',
                      'postal-code': '',
                      region: '',
                      'street-address': '',
                    },
                    name: {
                      'family-name': '',
                      'given-name': '',
                    },
                    organization: '',
                    'phone-number': '',
                  },
                  'default-on-profile': false,
                  'limit-amount': 0,
                  'payment-instrument-identification-form': {
                    'card-number': '',
                    'card-type': '',
                    'cardholder-name': '',
                    'display-name': '',
                    'expiry-month': '',
                    'expiry-year': '',
                    'last-four-digits': '',
                  },
                  'save-on-profile': false,
                },
              ],
              'display-name': 'CREDITCARD',
              name: 'CREDITCARD',
            },
          ],
        },
      ],
    },
  ],
  'total-quantity': 0,
};
