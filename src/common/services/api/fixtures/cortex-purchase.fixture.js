export default {
  "self": {
    "type": "elasticpath.purchases.purchase",
    "uri": "/purchases/crugive/giydanju=?zoom=donordetails,lineitems:element,lineitems:element:code,lineitems:element:rate,paymentmeans:element,ratetotals:element",
    "href": "https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=?zoom=donordetails,lineitems:element,lineitems:element:code,lineitems:element:rate,paymentmeans:element,ratetotals:element"
  },
  "links": [{
    "rel": "list",
    "type": "elasticpath.collections.links",
    "uri": "/purchases/crugive",
    "href": "https://give-stage2.cru.org/cortex/purchases/crugive"
  }, {
    "rel": "coupons",
    "type": "elasticpath.collections.links",
    "uri": "/coupons/purchases/crugive/giydanju=",
    "href": "https://give-stage2.cru.org/cortex/coupons/purchases/crugive/giydanju="
  }, {
    "rel": "discount",
    "type": "elasticpath.discounts.discount",
    "uri": "/discounts/purchases/crugive/giydanju=",
    "href": "https://give-stage2.cru.org/cortex/discounts/purchases/crugive/giydanju="
  }, {
    "rel": "donordetails",
    "type": "elasticpath.donordetails.donor",
    "uri": "/donordetails/purchases/crugive/giydanju=",
    "href": "https://give-stage2.cru.org/cortex/donordetails/purchases/crugive/giydanju="
  }, {
    "rel": "appliedpromotions",
    "type": "elasticpath.collections.links",
    "uri": "/promotions/purchases/crugive/giydanju=/applied",
    "href": "https://give-stage2.cru.org/cortex/promotions/purchases/crugive/giydanju=/applied"
  }, {
    "rel": "lineitems",
    "rev": "purchase",
    "type": "elasticpath.collections.links",
    "uri": "/purchases/crugive/giydanju=/lineitems",
    "href": "https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/lineitems"
  }, {
    "rel": "billingaddress",
    "rev": "purchase",
    "type": "elasticpath.addresses.address",
    "uri": "/purchases/crugive/giydanju=/billingaddress",
    "href": "https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/billingaddress"
  }, {
    "rel": "paymentmeans",
    "rev": "purchase",
    "type": "elasticpath.collections.links",
    "uri": "/purchases/crugive/giydanju=/paymentmeans",
    "href": "https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/paymentmeans"
  }, {
    "rel": "ratetotals",
    "type": "elasticpath.ratetotals.rate-total",
    "uri": "/ratetotals/purchases/crugive/giydanju=",
    "href": "https://give-stage2.cru.org/cortex/ratetotals/purchases/crugive/giydanju="
  }, {
    "rel": "shipments",
    "rev": "purchase",
    "type": "elasticpath.collections.links",
    "uri": "/shipments/purchases/crugive/giydanju=",
    "href": "https://give-stage2.cru.org/cortex/shipments/purchases/crugive/giydanju="
  }],
  "_donordetails": [{
    "self": {
      "type": "elasticpath.donordetails.donor",
      "uri": "/donordetails/purchases/crugive/giydanju=",
      "href": "https://give-stage2.cru.org/cortex/donordetails/purchases/crugive/giydanju="
    },
    "links": [{
      "rel": "purchase",
      "rev": "donordetails",
      "type": "elasticpath.purchases.purchase",
      "uri": "/purchases/crugive/giydanju=",
      "href": "https://give-stage2.cru.org/cortex/purchases/crugive/giydanju="
    }, {
      "rel": "donormatchesform",
      "uri": "/donormatches/form",
      "href": "https://give-stage2.cru.org/cortex/donormatches/form"
    }],
    "donor-type": "Household",
    "mailing-address": {
      "country-name": "US",
      "locality": "sdaf",
      "postal-code": "12345",
      "region": "CA",
      "street-address": "sg"
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
        "uri": "/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=",
        "href": "https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy="
      },
      "links": [{
        "rel": "purchase",
        "type": "elasticpath.purchases.purchase",
        "uri": "/purchases/crugive/giydanju=",
        "href": "https://give-stage2.cru.org/cortex/purchases/crugive/giydanju="
      }, {
        "rel": "list",
        "type": "elasticpath.collections.links",
        "uri": "/purchases/crugive/giydanju=/lineitems",
        "href": "https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/lineitems"
      }, {
        "rel": "code",
        "type": "elasticpath.extlookups.product-code",
        "uri": "/productcodes/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=",
        "href": "https://give-stage2.cru.org/cortex/productcodes/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy="
      }, {
        "rel": "options",
        "rev": "lineitem",
        "type": "elasticpath.collections.links",
        "uri": "/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=/options",
        "href": "https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=/options"
      }, {
        "rel": "rate",
        "rev": "lineitem",
        "type": "elasticpath.rates.rate",
        "uri": "/rates/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=",
        "href": "https://give-stage2.cru.org/cortex/rates/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy="
      }],
      "_code": [{
        "self": {
          "type": "elasticpath.extlookups.product-code",
          "uri": "/productcodes/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=",
          "href": "https://give-stage2.cru.org/cortex/productcodes/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy="
        }, "links": [], "code": "0798349", "product-code": "0798349"
      }],
      "_rate": [{
        "self": {
          "type": "elasticpath.rates.rate",
          "uri": "/rates/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=",
          "href": "https://give-stage2.cru.org/cortex/rates/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy="
        },
        "links": [{
          "rel": "lineitem",
          "rev": "rate",
          "type": "elasticpath.purchases.line-item",
          "uri": "/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy=",
          "href": "https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/lineitems/g5tdqzrvmmydqllgg4zgkljumi4taljygjtdkljxmuydiyjwgzqtgyzugy="
        }],
        "cost": {"amount": 50.00, "currency": "USD", "display": "$50.00"},
        "display": "$50.00 One Time",
        "recurrence": {"display": "One Time", "interval": "NA"}
      }],
      "line-extension-amount": [{"amount": 50.00, "currency": "USD", "display": "$50.00"}],
      "line-extension-tax": [{"amount": 0.00, "currency": "USD", "display": "$0.00"}],
      "line-extension-total": [{"amount": 50.00, "currency": "USD", "display": "$50.00"}],
      "name": "E-Ministry",
      "quantity": 1
    }, {
      "self": {
        "type": "elasticpath.purchases.line-item",
        "uri": "/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=",
        "href": "https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu="
      },
      "links": [{
        "rel": "purchase",
        "type": "elasticpath.purchases.purchase",
        "uri": "/purchases/crugive/giydanju=",
        "href": "https://give-stage2.cru.org/cortex/purchases/crugive/giydanju="
      }, {
        "rel": "list",
        "type": "elasticpath.collections.links",
        "uri": "/purchases/crugive/giydanju=/lineitems",
        "href": "https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/lineitems"
      }, {
        "rel": "code",
        "type": "elasticpath.extlookups.product-code",
        "uri": "/productcodes/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=",
        "href": "https://give-stage2.cru.org/cortex/productcodes/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu="
      }, {
        "rel": "options",
        "rev": "lineitem",
        "type": "elasticpath.collections.links",
        "uri": "/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=/options",
        "href": "https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=/options"
      }, {
        "rel": "rate",
        "rev": "lineitem",
        "type": "elasticpath.rates.rate",
        "uri": "/rates/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=",
        "href": "https://give-stage2.cru.org/cortex/rates/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu="
      }],
      "_code": [{
        "self": {
          "type": "elasticpath.extlookups.product-code",
          "uri": "/productcodes/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=",
          "href": "https://give-stage2.cru.org/cortex/productcodes/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu="
        }, "links": [], "code": "0775813_mon", "product-code": "0775813"
      }],
      "_rate": [{
        "self": {
          "type": "elasticpath.rates.rate",
          "uri": "/rates/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=",
          "href": "https://give-stage2.cru.org/cortex/rates/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu="
        },
        "links": [{
          "rel": "lineitem",
          "rev": "rate",
          "type": "elasticpath.purchases.line-item",
          "uri": "/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu=",
          "href": "https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/lineitems/gu3tsmlgmizdoljyg4ztsljumiztoljzgftgiljumi3dgzjzgnrgknlcgu="
        }],
        "cost": {"amount": 50.00, "currency": "USD", "display": "$50.00"},
        "display": "$50.00 Monthly",
        "recurrence": {"display": "Monthly", "interval": "MON"}
      }],
      "line-extension-amount": [{"amount": 0.00, "currency": "USD", "display": "$0.00"}],
      "line-extension-tax": [{"amount": 0.00, "currency": "USD", "display": "$0.00"}],
      "line-extension-total": [{"amount": 0.00, "currency": "USD", "display": "$0.00"}],
      "name": "Half a Team Motorbike",
      "quantity": 1
    }]
  }],
  "_paymentmeans": [{
    "_element": [{
      "self": {
        "type": "elasticpath.purchases.purchase.paymentmeans",
        "uri": "/purchases/crugive/giydanju=/paymentmeans/giydamzyge=",
        "href": "https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/paymentmeans/giydamzyge="
      },
      "links": [{
        "rel": "list",
        "type": "elasticpath.collections.links",
        "uri": "/purchases/crugive/giydanju=/paymentmeans",
        "href": "https://give-stage2.cru.org/cortex/purchases/crugive/giydanju=/paymentmeans"
      }, {
        "rel": "purchase",
        "type": "elasticpath.purchases.purchase",
        "uri": "/purchases/crugive/giydanju=",
        "href": "https://give-stage2.cru.org/cortex/purchases/crugive/giydanju="
      }],
      "billing-address": {
        "address": {
          "country-name": "US",
          "extended-address": "Apt 45",
          "locality": "State",
          "postal-code": "12345",
          "region": "AL",
          "street-address": "123 Asdf St"
        }, "name": {"family-name": "Lname", "given-name": "Fname"}
      },
      "card-type": "Visa",
      "expiry-date": {"month": "12", "year": "2019"},
      "holder-name": "sadf",
      "primary-account-number-id": "*******************************************************cNKg",
      "telephone-type": "voice"
    }]
  }],
  "_ratetotals": [{
    "_element": [{
      "self": {
        "type": "elasticpath.ratetotals.rate-total",
        "uri": "/ratetotals/purchases/crugive/giydanju=/a5ve2uj7yoadlqvvku6dckreernmfj6cxvqt6mtooquwyscpppble4jqgnzusp3tfhbkyi3jnhbk46lujmsmhadhykvemv6cwpblg7odrjp4fmwcwjnugwj3lizd65smee=",
        "href": "https://give-stage2.cru.org/cortex/ratetotals/purchases/crugive/giydanju=/a5ve2uj7yoadlqvvku6dckreernmfj6cxvqt6mtooquwyscpppble4jqgnzusp3tfhbkyi3jnhbk46lujmsmhadhykvemv6cwpblg7odrjp4fmwcwjnugwj3lizd65smee="
      },
      "links": [],
      "cost": {"amount": 50.00, "currency": "USD", "display": "$50.00"},
      "display": "$50.00 Monthly",
      "recurrence": {"display": "Monthly", "interval": "MON"}
    }]
  }],
  "monetary-total": [{"amount": 50.00, "currency": "USD", "display": "$50.00"}],
  "purchase-date": {"display-value": "September 3, 2016 4:14:33 AM", "value": 1472876073000},
  "purchase-number": "20054",
  "status": "COMPLETED",
  "tax-total": {"amount": 0.00, "currency": "USD", "display": "$0.00"}
};
