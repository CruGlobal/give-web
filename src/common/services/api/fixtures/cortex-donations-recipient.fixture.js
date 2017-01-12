export default {
  "self": {
    "type": "elasticpath.donations.recipient-donation-history-list",
    "uri": "/donations/historical/crugive/recipient/recent",
    "href": "http://localhost:9080/cortex/donations/historical/crugive/recipient/recent"
  },
  "donation-summaries": [
    {
      "designation-active": true,
      "designation-name": "Steve and Betty Kiefer (0507715)",
      "designation-number": "0507765",
      "donations": [
        {
          "donation-row-id": "1-K4GVYL",
          "donation-status": "In Process",
          "historical-donation-line": {
            "amount": 100,
            "anonymous": false,
            "campaign-code": "000000",
            "completed": false,
            "designation-active": true,
            "designation-name": "Steve and Betty Kiefer (0507715)",
            "designation-number": "0507765",
            "given-through-description": "",
            "master-account": false,
            "pass-through": false,
            "payment-method-id": "giydaobqgy=",
            "payment-type": "EFT",
            "related-account-description": "",
            "transaction-date": {
              "display-value": "2017-01-09",
              "value": 1483920000000
            },
            "transaction-sub-type": "EFT"
          }
        }
      ],
      "most-recent-donation": {
        "donation-row-id": "1-K4GVYL",
        "donation-status": "In Process",
        "historical-donation-line": {
          "amount": 100,
          "anonymous": false,
          "campaign-code": "000000",
          "completed": false,
          "designation-active": true,
          "designation-name": "Colby and Sarah Keefer (0507765)",
          "designation-number": "0507765",
          "given-through-description": "",
          "master-account": false,
          "pass-through": false,
          "payment-method-id": "giydaobqgy=",
          "payment-type": "EFT",
          "related-account-description": "",
          "transaction-date": {
            "display-value": "2017-01-09",
            "value": 1483920000000
          },
          "transaction-sub-type": "EFT"
        }
      },
      "year-to-date-amount": 100
    }
  ],
  "links": [
    {
      "rel": "recurringdonations",
      "uri": "/donations/recurring/crugive/recipient/ga2tanzxgy2q=",
      "href": "http://localhost:9080/cortex/donations/recurring/crugive/recipient/ga2tanzxgy2q="
    },
    {
      "rel": "givingdashboard",
      "uri": "/giving/crugive",
      "href": "http://localhost:9080/cortex/giving/crugive"
    }
  ]
};
