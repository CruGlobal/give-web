export default {
  "self":     {
    "type": "elasticpath.collections.links",
    "uri":  "/donations/historical/crugive/recipient/recent?zoom=element,element:mostrecentdonation,element:mostrecentdonation:recurringdonationelement",
    "href": "https://cortex-gateway-stage.cru.org/cortex/donations/historical/crugive/recipient/recent?zoom=element,element:mostrecentdonation,element:mostrecentdonation:recurringdonationelement"
  },
  "links":    [{
    "rel":  "element",
    "rev":  "list",
    "type": "elasticpath.donations.historical-donation",
    "uri":  "/donations/historical/crugive/recentrecipientsummary/a5ufc43nkb2htqvrlu6vg3lsmtbkkus5ijjh2ob2ykxuypjsnvvf7qvbykuv26kdkf6ta4ltyoavpqvbyk5x3q4co4=",
    "href": "https://cortex-gateway-stage.cru.org/cortex/donations/historical/crugive/recentrecipientsummary/a5ufc43nkb2htqvrlu6vg3lsmtbkkus5ijjh2ob2ykxuypjsnvvf7qvbykuv26kdkf6ta4ltyoavpqvbyk5x3q4co4="
  }, {
    "rel":  "givingdashboard",
    "uri":  "/giving/crugive",
    "href": "https://cortex-gateway-stage.cru.org/cortex/giving/crugive"
  }],
  "_element": [{
    "self":                {
      "type": "elasticpath.donations.recipient-donation-history",
      "uri":  "/donations/historical/crugive/recentrecipientsummary/a5ufc43nkb2htqvrlu6vg3lsmtbkkus5ijjh2ob2ykxuypjsnvvf7qvbykuv26kdkf6ta4ltyoavpqvbyk5x3q4co4=",
      "href": "https://cortex-gateway-stage.cru.org/cortex/donations/historical/crugive/recentrecipientsummary/a5ufc43nkb2htqvrlu6vg3lsmtbkkus5ijjh2ob2ykxuypjsnvvf7qvbykuv26kdkf6ta4ltyoavpqvbyk5x3q4co4="
    },
    "links":               [{
      "rel":  "mostrecentdonation",
      "uri":  "/donations/historical/crugive/gewusqknjrju6=",
      "href": "https://cortex-gateway-stage.cru.org/cortex/donations/historical/crugive/gewusqknjrju6="
    }, {
      "rel":  "giveagift",
      "type": "elasticpath.items.item",
      "uri":  "/items/crugive/ga3dinzwga3q=",
      "href": "https://cortex-gateway-stage.cru.org/cortex/items/crugive/ga3dinzwga3q="
    }],
    "_mostrecentdonation": [{
      "self":                      {
        "type": "elasticpath.donations.historical-donation",
        "uri":  "/donations/historical/crugive/gewusqknjrju6=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/donations/historical/crugive/gewusqknjrju6="
      },
      "links":                     [{
        "rel":  "recurringdonationelement",
        "rev":  "recurringdonationlist",
        "type": "elasticpath.donations.donation",
        "uri":  "/donations/recurring/crugive/gewugmkok5jvi=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/donations/recurring/crugive/gewugmkok5jvi="
      }, {
        "rel":  "paymentmethod",
        "uri":  "/paymentmethods/crugive/giydgmrwha=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive/giydgmrwha="
      }, {
        "rel":  "giveagift",
        "type": "elasticpath.items.item",
        "uri":  "/items/crugive/ga3dinzwga3q=",
        "href": "https://cortex-gateway-stage.cru.org/cortex/items/crugive/ga3dinzwga3q="
      }],
      "_recurringdonationelement": [{
        "self":                   {
          "type": "donations.recurring",
          "uri":  "/donations/recurring/crugive/gewugmkok5jvi=",
          "href": "https://cortex-gateway-stage.cru.org/cortex/donations/recurring/crugive/gewugmkok5jvi="
        },
        "links":                  [{
          "rel":  "paymentmethods",
          "uri":  "/paymentmethods/crugive",
          "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive"
        }, {
          "rel":  "paymentmethod",
          "uri":  "/paymentmethods/crugive/giydgmrwha=",
          "href": "https://cortex-gateway-stage.cru.org/cortex/paymentmethods/crugive/giydgmrwha="
        }],
        "donation-lines":         [{
          "amount":                         10,
          "designation-name":               "Jesse and Rachel Rogers (0647607)",
          "designation-number":             "0647607",
          "donation-line-row-id":           "1-C1NWSV",
          "donation-line-status":           "Standard",
          "payment-method-id":              "203268",
          "updated-donation-line-status":   "",
          "updated-payment-method-id":      "",
          "updated-rate":                   {"recurrence": {"interval": ""}},
          "updated-recurring-day-of-month": "",
          "updated-start-month":            "",
          "updated-start-year":             ""
        }],
        "donation-row-id":        "1-C1NWST",
        "donation-status":        "Active",
        "effective-status":       "Active",
        "rate":                   {"recurrence": {"interval": "Monthly"}},
        "recurring-day-of-month": "15",
        "start-date":             {"display-value": "2015-05-08", "value": 1431043200000}
      }],
      "donation-row-id":           "1-IAMLSO",
      "donation-status":           "Completed",
      "historical-donation-line":  {
        "amount":                      10,
        "anonymous":                   false,
        "campaign-code":               "CCWBST",
        "completed":                   true,
        "designation-active":          true,
        "designation-name":            "Jesse and Rachel Rogers (0647607)",
        "designation-number":          "0647607",
        "given-through-description":   "Stovall, Shelly(431770622)",
        "master-account":              false,
        "pass-through":                false,
        "payment-method-id":           "203268",
        "payment-type":                "Visa",
        "related-account-description": "Stovall, Shelly(431770622)",
        "transaction-date":            {"display-value": "2015-11-16", "value": 1447632000000},
        "transaction-sub-type":        "Credit Card"
      }
    }],
    "designation-active":  true,
    "designation-name":    "Jesse and Rachel Rogers (0647607)",
    "designation-number":  "0647607",
    "year-to-date-amount": 0
  }]
};
