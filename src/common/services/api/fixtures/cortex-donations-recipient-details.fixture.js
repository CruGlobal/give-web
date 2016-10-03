export default {
  "self":                {
    "type": "elasticpath.donations.recipient-donation-history",
    "uri":  "/donations/historical/crugive/recipientsummary/a5ufc43nkb2htqvrlu6vg3lsmtbkkus5ijjh2ob2ykxuyprsykytqrwcuhbl6vlzinix2mdrn5lt2mklo4=?zoom=element,element:paymentmethod",
    "href": "https://cortex-gateway-stage.cru.org/cortex/donations/historical/crugive/recipientsummary/a5ufc43nkb2htqvrlu6vg3lsmtbkkus5ijjh2ob2ykxuyprsykytqrwcuhbl6vlzinix2mdrn5lt2mklo4=?zoom=element,element:paymentmethod"
  },
  "links":               [{
    "rel":  "element",
    "rev":  "list",
    "type": "elasticpath.donations.historical-donation",
    "uri":  "/donations/historical/crugive/gewtswcrkfjek=",
    "href": "https://cortex-gateway-stage.cru.org/cortex/donations/historical/crugive/gewtswcrkfjek="
  }, {
    "rel":  "mostrecentdonation",
    "uri":  "/donations/historical/crugive/gewtswcrkfjek=",
    "href": "https://cortex-gateway-stage.cru.org/cortex/donations/historical/crugive/gewtswcrkfjek="
  }, {
    "rel":  "giveagift",
    "type": "elasticpath.items.item",
    "uri":  "/items/crugive/gi3tsnbwhaya=",
    "href": "https://cortex-gateway-stage.cru.org/cortex/items/crugive/gi3tsnbwhaya="
  }],
  "_element":            [{
    "self":                     {
      "type": "elasticpath.donations.historical-donation",
      "uri":  "/donations/historical/crugive/gewtswcrkfjek=",
      "href": "https://cortex-gateway-stage.cru.org/cortex/donations/historical/crugive/gewtswcrkfjek="
    },
    "links":                    [{
      "rel":  "paymentmethod",
      "uri":  "/paymentmethods/crugive/giydgmrsgq=",
      "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive/giydgmrsgq="
    }, {
      "rel":  "giveagift",
      "type": "elasticpath.items.item",
      "uri":  "/items/crugive/gi3tsnbwhaya=",
      "href": "https://cortex-gateway-stage.cru.org/cortex/items/crugive/gi3tsnbwhaya="
    }],
    "_paymentmethod":           [{
      "self":            {
        "type": "cru.creditcards.named-credit-card",
        "uri":  "/paymentmethods/crugive/giydgmrsgq=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive/giydgmrsgq="
      },
      "links":           [{
        "rel":  "list",
        "type": "elasticpath.collections.links",
        "uri":  "/paymentmethods/crugive",
        "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive"
      }],
      "card-number":     "7685",
      "card-type":       "Discover",
      "cardholder-name": "Melissa Sue Howell",
      "description":     "Discover - 7685",
      "expiry-month":    "02",
      "expiry-year":     "2019"
    }],
    "donation-row-id":          "1-9XQQRE",
    "donation-status":          "Completed",
    "historical-donation-line": {
      "amount":                      30,
      "anonymous":                   false,
      "campaign-code":               "W52DML",
      "completed":                   true,
      "designation-active":          true,
      "designation-name":            "Port Cities Outreach (2794680)",
      "designation-number":          "2794680",
      "given-through-description":   "Howell, Melissa(420408771)",
      "master-account":              false,
      "pass-through":                false,
      "payment-method-id":           "203224",
      "payment-type":                "Discover",
      "related-account-description": "Howell, Melissa(420408771)",
      "transaction-date":            {"display-value": "2015-03-03", "value": 1425340800000},
      "transaction-sub-type":        "Credit Card"
    }
  }],
  "designation-active":  true,
  "designation-name":    "Port Cities Outreach (2794680)",
  "designation-number":  "2794680",
  "year-to-date-amount": 30
};
