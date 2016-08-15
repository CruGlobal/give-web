export default {
  "self": {
    "type": "elasticpath.carts.cart",
    "uri": "/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=?zoom=order:paymentmethodinfo:bankaccountform,order:paymentmethodinfo:creditcardform",
    "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=?zoom=order:paymentmethodinfo:bankaccountform,order:paymentmethodinfo:creditcardform"
  },
  "links": [
    {
      "rel": "lineitems",
      "rev": "cart",
      "type": "elasticpath.collections.links",
      "uri": "/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=/lineitems",
      "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=/lineitems"
    },
    {
      "rel": "discount",
      "type": "elasticpath.discounts.discount",
      "uri": "/discounts/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=",
      "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/discounts/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga="
    },
    {
      "rel": "order",
      "rev": "cart",
      "type": "elasticpath.orders.order",
      "uri": "/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=",
      "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq="
    },
    {
      "rel": "appliedpromotions",
      "type": "elasticpath.collections.links",
      "uri": "/promotions/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=/applied",
      "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/promotions/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=/applied"
    },
    {
      "rel": "ratetotals",
      "type": "elasticpath.ratetotals.rate-total",
      "uri": "/ratetotals/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=",
      "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/ratetotals/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga="
    },
    {
      "rel": "total",
      "rev": "cart",
      "type": "elasticpath.totals.total",
      "uri": "/totals/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga=",
      "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/totals/carts/crugive/gzsggnjxmuzdoljrmrrdkljuhfrtmljymm3tillemi4gmnjwge4denjqga="
    }
  ],
  "_order": [
    {
      "_paymentmethodinfo": [
        {
          "_bankaccountform": [
            {
              "self": {
                "type": "training.bankaccounts.bank-account",
                "uri": "/bankaccounts/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=/form",
                "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/bankaccounts/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=/form"
              },
              "links": [
                {
                  "rel": "createbankaccountfororderaction",
                  "uri": "/bankaccounts/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=",
                  "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/bankaccounts/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq="
                }
              ],
              "account-type": "",
              "bank-name": "",
              "display-account-number": "",
              "encrypted-account-number": "",
              "routing-number": ""
            }
          ],
          "_creditcardform": [
            {
              "self": {
                "type": "cru.creditcards.named-credit-card",
                "uri": "/creditcards/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=/form",
                "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/creditcards/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=/form"
              },
              "links": [
                {
                  "rel": "createcreditcardfororderaction",
                  "uri": "/creditcards/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=",
                  "href": "http://give-ep-cortex-uat.aws.cru.org/cortex/creditcards/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq="
                }
              ],
              "card-number": "",
              "card-type": "",
              "cardholder-name": "",
              "expiry-month": "",
              "expiry-year": "",
              "issue-number": 0,
              "start-month": "",
              "start-year": ""
            }
          ]
        }
      ]
    }
  ],
  "total-quantity": 0
};

