export default {
  "self": {
    "type": "elasticpath.purchases.purchase",
    "uri": "/purchases/crugive/giydanbt=?zoom=donordetails,lineitems:element,paymentmeans:element",
    "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt=?zoom=donordetails,lineitems:element,paymentmeans:element"
  },
  "links": [{
    "rel": "list",
    "type": "elasticpath.collections.links",
    "uri": "/purchases/crugive",
    "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive"
  }, {
    "rel": "coupons",
    "type": "elasticpath.collections.links",
    "uri": "/coupons/purchases/crugive/giydanbt=",
    "href": "https://cortex-gateway-stage.cru.org/cortex/coupons/purchases/crugive/giydanbt="
  }, {
    "rel": "discount",
    "type": "elasticpath.discounts.discount",
    "uri": "/discounts/purchases/crugive/giydanbt=",
    "href": "https://cortex-gateway-stage.cru.org/cortex/discounts/purchases/crugive/giydanbt="
  }, {
    "rel": "donordetails",
    "type": "elasticpath.donordetails.donor",
    "uri": "/donordetails/purchases/crugive/giydanbt=",
    "href": "https://cortex-gateway-stage.cru.org/cortex/donordetails/purchases/crugive/giydanbt="
  }, {
    "rel": "appliedpromotions",
    "type": "elasticpath.collections.links",
    "uri": "/promotions/purchases/crugive/giydanbt=/applied",
    "href": "https://cortex-gateway-stage.cru.org/cortex/promotions/purchases/crugive/giydanbt=/applied"
  }, {
    "rel": "lineitems",
    "rev": "purchase",
    "type": "elasticpath.collections.links",
    "uri": "/purchases/crugive/giydanbt=/lineitems",
    "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt=/lineitems"
  }, {
    "rel": "billingaddress",
    "rev": "purchase",
    "type": "elasticpath.addresses.address",
    "uri": "/purchases/crugive/giydanbt=/billingaddress",
    "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt=/billingaddress"
  }, {
    "rel": "paymentmeans",
    "rev": "purchase",
    "type": "elasticpath.collections.links",
    "uri": "/purchases/crugive/giydanbt=/paymentmeans",
    "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt=/paymentmeans"
  }, {
    "rel": "ratetotals",
    "type": "elasticpath.ratetotals.rate-total",
    "uri": "/ratetotals/purchases/crugive/giydanbt=",
    "href": "https://cortex-gateway-stage.cru.org/cortex/ratetotals/purchases/crugive/giydanbt="
  }, {
    "rel": "shipments",
    "rev": "purchase",
    "type": "elasticpath.collections.links",
    "uri": "/shipments/purchases/crugive/giydanbt=",
    "href": "https://cortex-gateway-stage.cru.org/cortex/shipments/purchases/crugive/giydanbt="
  }],
  "_donordetails": [{
    "self": {
      "type": "elasticpath.donordetails.donor",
      "uri": "/donordetails/purchases/crugive/giydanbt=",
      "href": "https://cortex-gateway-stage.cru.org/cortex/donordetails/purchases/crugive/giydanbt="
    },
    "links": [{
      "rel": "purchase",
      "rev": "donordetails",
      "type": "elasticpath.purchases.purchase",
      "uri": "/purchases/crugive/giydanbt=",
      "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt="
    }, {
      "rel": "donormatchesform",
      "uri": "/donormatches/form",
      "href": "https://cortex-gateway-stage.cru.org/cortex/donormatches/form"
    }],
    "donor-type": "Household",
    "mailing-address": {
      "country-name": "US",
      "locality": "asdf",
      "postal-code": "12345",
      "region": "AL",
      "street-address": "sdaf"
    },
    "name": {"family-name": "Lname", "given-name": "Fname", "middle-initial": "m", "suffix": "Jr.", "title": "Mr."},
    "organization-name": "myorg",
    "phone-number": "1234567890",
    "registration-state": "MATCHED",
    "spouse-name": {"family-name": "rewq", "given-name": "qwer", "middle-initial": "a", "suffix": "IV", "title": "Mrs."}
  }],
  "_lineitems": [{
    "_element": [{
      "self": {
        "type": "elasticpath.purchases.line-item",
        "uri": "/purchases/crugive/giydanbt=/lineitems/meztiyzqgy2willemrrgcljugbtdeljyg44deljqgu4gmmdcgi3ginjqmu=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt=/lineitems/meztiyzqgy2willemrrgcljugbtdeljyg44deljqgu4gmmdcgi3ginjqmu="
      },
      "links": [{
        "rel": "purchase",
        "type": "elasticpath.purchases.purchase",
        "uri": "/purchases/crugive/giydanbt=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt="
      }, {
        "rel": "list",
        "type": "elasticpath.collections.links",
        "uri": "/purchases/crugive/giydanbt=/lineitems",
        "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt=/lineitems"
      }, {
        "rel": "code",
        "type": "elasticpath.extlookups.product-code",
        "uri": "/productcodes/purchases/crugive/giydanbt=/lineitems/meztiyzqgy2willemrrgcljugbtdeljyg44deljqgu4gmmdcgi3ginjqmu=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/productcodes/purchases/crugive/giydanbt=/lineitems/meztiyzqgy2willemrrgcljugbtdeljyg44deljqgu4gmmdcgi3ginjqmu="
      }, {
        "rel": "options",
        "rev": "lineitem",
        "type": "elasticpath.collections.links",
        "uri": "/purchases/crugive/giydanbt=/lineitems/meztiyzqgy2willemrrgcljugbtdeljyg44deljqgu4gmmdcgi3ginjqmu=/options",
        "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt=/lineitems/meztiyzqgy2willemrrgcljugbtdeljyg44deljqgu4gmmdcgi3ginjqmu=/options"
      }, {
        "rel": "rate",
        "rev": "lineitem",
        "type": "elasticpath.rates.rate",
        "uri": "/rates/purchases/crugive/giydanbt=/lineitems/meztiyzqgy2willemrrgcljugbtdeljyg44deljqgu4gmmdcgi3ginjqmu=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/rates/purchases/crugive/giydanbt=/lineitems/meztiyzqgy2willemrrgcljugbtdeljyg44deljqgu4gmmdcgi3ginjqmu="
      }],
      "line-extension-amount": [{"amount": 50.00, "currency": "USD", "display": "$50.00"}],
      "line-extension-tax": [{"amount": 0.00, "currency": "USD", "display": "$0.00"}],
      "line-extension-total": [{"amount": 50.00, "currency": "USD", "display": "$50.00"}],
      "name": "J&J Wyatt Scholarship",
      "quantity": 1
    }, {
      "self": {
        "type": "elasticpath.purchases.line-item",
        "uri": "/purchases/crugive/giydanbt=/lineitems/my4dqzlfhfsdgllggmztcljuhbrtgllbmy4tcllege3gcm3dge4gczjxgi=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt=/lineitems/my4dqzlfhfsdgllggmztcljuhbrtgllbmy4tcllege3gcm3dge4gczjxgi="
      },
      "links": [{
        "rel": "purchase",
        "type": "elasticpath.purchases.purchase",
        "uri": "/purchases/crugive/giydanbt=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt="
      }, {
        "rel": "list",
        "type": "elasticpath.collections.links",
        "uri": "/purchases/crugive/giydanbt=/lineitems",
        "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt=/lineitems"
      }, {
        "rel": "code",
        "type": "elasticpath.extlookups.product-code",
        "uri": "/productcodes/purchases/crugive/giydanbt=/lineitems/my4dqzlfhfsdgllggmztcljuhbrtgllbmy4tcllege3gcm3dge4gczjxgi=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/productcodes/purchases/crugive/giydanbt=/lineitems/my4dqzlfhfsdgllggmztcljuhbrtgllbmy4tcllege3gcm3dge4gczjxgi="
      }, {
        "rel": "options",
        "rev": "lineitem",
        "type": "elasticpath.collections.links",
        "uri": "/purchases/crugive/giydanbt=/lineitems/my4dqzlfhfsdgllggmztcljuhbrtgllbmy4tcllege3gcm3dge4gczjxgi=/options",
        "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt=/lineitems/my4dqzlfhfsdgllggmztcljuhbrtgllbmy4tcllege3gcm3dge4gczjxgi=/options"
      }, {
        "rel": "rate",
        "rev": "lineitem",
        "type": "elasticpath.rates.rate",
        "uri": "/rates/purchases/crugive/giydanbt=/lineitems/my4dqzlfhfsdgllggmztcljuhbrtgllbmy4tcllege3gcm3dge4gczjxgi=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/rates/purchases/crugive/giydanbt=/lineitems/my4dqzlfhfsdgllggmztcljuhbrtgllbmy4tcllege3gcm3dge4gczjxgi="
      }],
      "line-extension-amount": [{"amount": 0.00, "currency": "USD", "display": "$0.00"}],
      "line-extension-tax": [{"amount": 0.00, "currency": "USD", "display": "$0.00"}],
      "line-extension-total": [{"amount": 0.00, "currency": "USD", "display": "$0.00"}],
      "name": "Timothy J. Harriger",
      "quantity": 1
    }, {
      "self": {
        "type": "elasticpath.purchases.line-item",
        "uri": "/purchases/crugive/giydanbt=/lineitems/miygknzxg43dqljrgbrdoljumyywillbgbqtmllegaygiyzzg4ztcmjyhe=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt=/lineitems/miygknzxg43dqljrgbrdoljumyywillbgbqtmllegaygiyzzg4ztcmjyhe="
      },
      "links": [{
        "rel": "purchase",
        "type": "elasticpath.purchases.purchase",
        "uri": "/purchases/crugive/giydanbt=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt="
      }, {
        "rel": "list",
        "type": "elasticpath.collections.links",
        "uri": "/purchases/crugive/giydanbt=/lineitems",
        "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt=/lineitems"
      }, {
        "rel": "code",
        "type": "elasticpath.extlookups.product-code",
        "uri": "/productcodes/purchases/crugive/giydanbt=/lineitems/miygknzxg43dqljrgbrdoljumyywillbgbqtmllegaygiyzzg4ztcmjyhe=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/productcodes/purchases/crugive/giydanbt=/lineitems/miygknzxg43dqljrgbrdoljumyywillbgbqtmllegaygiyzzg4ztcmjyhe="
      }, {
        "rel": "options",
        "rev": "lineitem",
        "type": "elasticpath.collections.links",
        "uri": "/purchases/crugive/giydanbt=/lineitems/miygknzxg43dqljrgbrdoljumyywillbgbqtmllegaygiyzzg4ztcmjyhe=/options",
        "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt=/lineitems/miygknzxg43dqljrgbrdoljumyywillbgbqtmllegaygiyzzg4ztcmjyhe=/options"
      }, {
        "rel": "rate",
        "rev": "lineitem",
        "type": "elasticpath.rates.rate",
        "uri": "/rates/purchases/crugive/giydanbt=/lineitems/miygknzxg43dqljrgbrdoljumyywillbgbqtmllegaygiyzzg4ztcmjyhe=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/rates/purchases/crugive/giydanbt=/lineitems/miygknzxg43dqljrgbrdoljumyywillbgbqtmllegaygiyzzg4ztcmjyhe="
      }],
      "line-extension-amount": [{"amount": 50.00, "currency": "USD", "display": "$50.00"}],
      "line-extension-tax": [{"amount": 0.00, "currency": "USD", "display": "$0.00"}],
      "line-extension-total": [{"amount": 50.00, "currency": "USD", "display": "$50.00"}],
      "name": "Gabriel J Aguilera",
      "quantity": 1
    }]
  }],
  "_paymentmeans": [{
    "_element": [{
      "self": {
        "type": "elasticpath.bankaccountpurchases.payment-means-bank-account",
        "uri": "/purchases/crugive/giydanbt=/paymentmeans/giydamzwgi=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt=/paymentmeans/giydamzwgi="
      },
      "links": [{
        "rel": "list",
        "type": "elasticpath.collections.links",
        "uri": "/purchases/crugive/giydanbt=/paymentmeans",
        "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt=/paymentmeans"
      }, {
        "rel": "purchase",
        "type": "elasticpath.purchases.purchase",
        "uri": "/purchases/crugive/giydanbt=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/purchases/crugive/giydanbt="
      }],
      "account-type": "checking",
      "bank-name": "First Bank",
      "display-account-number": "3456",
      "routing-number": "021000021"
    }]
  }],
  "monetary-total": [{"amount": 100.00, "currency": "USD", "display": "$100.00"}],
  "purchase-date": {"display-value": "September 1, 2016 9:42:49 PM", "value": 1472766169000},
  "purchase-number": "20043",
  "status": "COMPLETED",
  "tax-total": {"amount": 0.00, "currency": "USD", "display": "$0.00"}
};
