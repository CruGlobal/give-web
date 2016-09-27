export default {
  "self": {
    "type": "elasticpath.profiles.profile",
    "uri": "/profiles/crugive/gnrdkojsge4dsljxhazwmljugmztillcgu3gkljqgm3tkytdmm3dmzrxme=?zoom=paymentmethods:element,paymentmethods:element:bankaccount,paymentmethods:element:creditcard",
    "href": "https://cortex-gateway-stage.cru.org/cortex/profiles/crugive/gnrdkojsge4dsljxhazwmljugmztillcgu3gkljqgm3tkytdmm3dmzrxme=?zoom=paymentmethods:element,paymentmethods:element:bankaccount,paymentmethods:element:creditcard"
  },
  "links": [{
    "rel": "addresses",
    "rev": "profile",
    "type": "elasticpath.collections.links",
    "uri": "/addresses/crugive",
    "href": "https://cortex-gateway-stage.cru.org/cortex/addresses/crugive"
  }, {
    "rel": "addspousedetails",
    "rev": "profile",
    "type": "elasticpath.collections.links",
    "uri": "/donordetails/profiles/crugive/gnrdkojsge4dsljxhazwmljugmztillcgu3gkljqgm3tkytdmm3dmzrxme=/spousedetails",
    "href": "https://cortex-gateway-stage.cru.org/cortex/donordetails/profiles/crugive/gnrdkojsge4dsljxhazwmljugmztillcgu3gkljqgm3tkytdmm3dmzrxme=/spousedetails"
  }, {
    "rel": "emails",
    "rev": "profile",
    "type": "elasticpath.collections.links",
    "uri": "/emails/crugive",
    "href": "https://cortex-gateway-stage.cru.org/cortex/emails/crugive"
  }, {
    "rel": "givingdashboard",
    "rev": "profile",
    "type": "elasticpath.collections.links",
    "uri": "/giving/crugive",
    "href": "https://cortex-gateway-stage.cru.org/cortex/giving/crugive"
  }, {
    "rel": "paymentmethods",
    "rev": "profile",
    "type": "elasticpath.collections.links",
    "uri": "/paymentmethods/crugive",
    "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive"
  }, {
    "rel": "phonenumbers",
    "rev": "profile",
    "type": "elasticpath.collections.links",
    "uri": "/phonenumbers/crugive",
    "href": "https://cortex-gateway-stage.cru.org/cortex/phonenumbers/crugive"
  }, {
    "rel": "purchases",
    "type": "elasticpath.collections.links",
    "uri": "/purchases/crugive",
    "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive"
  }, {
    "rel": "wishlists",
    "rev": "profile",
    "type": "elasticpath.collections.links",
    "uri": "/wishlists/crugive",
    "href": "https://cortex-gateway-stage.cru.org/cortex/wishlists/crugive"
  }],
  "_paymentmethods": [{
    "_element": [{
      "self": {
        "type": "cru.creditcards.named-credit-card",
        "uri": "/paymentmethods/crugive/giydgmrrhe=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive/giydgmrrhe="
      },
      "links": [{
        "rel": "list",
        "type": "elasticpath.collections.links",
        "uri": "/paymentmethods/crugive",
        "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive"
      }, {
        "rel": "creditcard",
        "type": "cru.creditcards.named-credit-card",
        "uri": "/creditcards/paymentmethods/crugive/giydgmrrhe=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/creditcards/paymentmethods/crugive/giydgmrrhe="
      }],
      "_creditcard": [{
        "self": {
          "type": "cru.creditcards.named-credit-card",
          "uri": "/creditcards/paymentmethods/crugive/giydgmrrhe=",
          "href": "https://cortex-gateway-stage.cru.org/cortex/creditcards/paymentmethods/crugive/giydgmrrhe="
        },
        "links": [{
          "rel": "paymentmethod",
          "uri": "/paymentmethods/crugive/giydgmrrhe=",
          "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive/giydgmrrhe="
        }, {
          "rel": "creditcard",
          "type": "cru.creditcards.named-credit-card",
          "uri": "/creditcards/paymentmethods/crugive/giydgmrrhe=",
          "href": "https://cortex-gateway-stage.cru.org/cortex/creditcards/paymentmethods/crugive/giydgmrrhe="
        }],
        "address": {
          "country-name": "US",
          "extended-address": "",
          "locality": "Sacramento",
          "postal-code": "12345",
          "region": "CA",
          "street-address": "123 Some Street"
        },
        "card-number": "1118",
        "card-type": "MasterCard",
        "cardholder-name": "Test Person",
        "description": "Mastercard Test Card",
        "expiry-month": "08",
        "expiry-year": "2020",
        "status": "Active"
      }],
      "card-number": "1118",
      "card-type": "MasterCard",
      "cardholder-name": "Test Person",
      "expiry-month": "08",
      "expiry-year": "2020"
    }, {
      "self": {
        "type": "elasticpath.bankaccounts.bank-account",
        "uri": "/paymentmethods/crugive/giydcnzyga=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive/giydcnzyga="
      },
      "links": [{
        "rel": "list",
        "type": "elasticpath.collections.links",
        "uri": "/paymentmethods/crugive",
        "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive"
      }, {
        "rel": "bankaccount",
        "type": "elasticpath.bankaccounts.bank-account",
        "uri": "/bankaccounts/paymentmethods/crugive/giydcnzyga=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/bankaccounts/paymentmethods/crugive/giydcnzyga="
      }],
      "_bankaccount": [{
        "self": {
          "type": "elasticpath.bankaccounts.bank-account",
          "uri": "/bankaccounts/paymentmethods/crugive/giydcnzyga=",
          "href": "https://cortex-gateway-stage.cru.org/cortex/bankaccounts/paymentmethods/crugive/giydcnzyga="
        },
        "links": [{
          "rel": "paymentmethod",
          "uri": "/paymentmethods/crugive/giydcnzyga=",
          "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive/giydcnzyga="
        }, {
          "rel": "bankaccount",
          "type": "elasticpath.bankaccounts.bank-account",
          "uri": "/bankaccounts/paymentmethods/crugive/giydcnzyga=",
          "href": "https://cortex-gateway-stage.cru.org/cortex/bankaccounts/paymentmethods/crugive/giydcnzyga="
        }],
        "account-type": "Savings",
        "bank-name": "2nd Bank",
        "display-account-number": "3456",
        "encrypted-account-number": "",
        "routing-number": "021000021"
      }],
      "account-type": "Savings",
      "bank-name": "2nd Bank",
      "display-account-number": "3456",
      "encrypted-account-number": "",
      "routing-number": "021000021"
    }]
  }],
  "family-name": "Lname",
  "given-name": "Fname"
};

