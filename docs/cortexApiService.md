# cortexApiService

[Source code](https://github.com/CruGlobal/give-web/blob/master/src/common/services/cortexApi.service.js)

## Usage

### Import into your service

```
import angular from 'angular';
import cortexApiService from 'common/services/cortexApi.service';

let serviceName = 'myService';

class MyService{

  /*@ngInject*/
  constructor(cortexApiService){
    this.cortexApiService = cortexApiService;
  }

  myMethod(){
    // Use this.cortexApiService
  }
}

export default angular
  .module(serviceName, [
    cortexApiService.name
  ])
  .service(serviceName, MyService);

```

### `cortexApiService.http(config)`

#### Helper methods

`cortexApiService.get(config)`, `cortexApiService.post(config)`, `cortexApiService.put(config)`, `cortexApiService.delete(config)` all take the exact same `config` object as `cortexApiService.http(config)` except they automatically prefill the `method` key with the corresponding value.

#### Config

You can call `cortexApiService.http(config)` or any of the helper methods and pass in the following `config` object:

```
cortexApiService.http({
        method: 'GET',
        url: ['path', 'to', 'cortex', 'endpoint'],
        params: {
          key: value
        },
        data: {
            key: value
        },
        followLocation: true,
        zoom: {
            //explained below
        }
    });
```

##### `method`

Any method that Angular's `$http` service accepts.

##### `url`

Accepts either a string or an array of strings to be joined with slashes.
Examples:

```
/carts/crugive/default
carts/crugive/default
['carts', 'crugive', 'default']
```

These will all call `<cortex api url>/cortex/carts/crugive/default`

##### `params`

Query parameters that will be passed on to Angular's `$http` service.

##### `data`

Request data that will be passed on to Angular's `$http` service.

##### `followLocation`

If this key is set to `true`, a query parameter will be added to tell Cortex to followLocation. From the [Cortex docs](https://touchpoint-developers.elasticpath.com/1.16.0/API-Reference/Follow-Location):

> The FollowLocation query parameter reduces the number of requests required when performing POST operations. FollowLocation instructs Cortex to retrieve the resource referenced in the Location header and return it in the response body which eliminates the need to make another call to retrieve the resource. FollowLocation can also be used with zoom to further reduce the number of HTTP requests required.

##### `zoom`

This parameter accepts standard cortex zoom parameters but helps with mapping them to useful JSON objects.
This key takes an object where the values are cortex zoom strings. The keys are used to name the keys in the returned object where the data corresponding to each zoom string is located.

###### Arrays

When using zoom strings here, you may append a square brackets `[]` to indicate that the value returned should be treated as an array and not an object. This will prevent the array from being mapped to it's first item.

Example with 2 keys with zoom params where `addresses` is expected to be an array:

```
cortexApiService.get({
        path: 'profiles/crugive/default',
        zoom: {
            addresses: 'addresses[]',
            email: 'emails'
        }
    });
```

This will return: (the `rawData` key shows what the original response looked like. `self` and `link` keys have been removed for clarity)

```
{
    "addresses": [
        {
            "address": {
                "country-name": "US",
                "extended-address": "Apt 45",
                "locality": "State",
                "postal-code": "12345",
                "region": "AL",
                "street-address": "123 First St"
            },
            "name": {
                "family-name": "Lname",
                "given-name": "Fname"
            }
        },
        {
            "address": {
                "country-name": "BE",
                "postal-code": "12345",
                "street-address": "456 Some Ave||||||"
            },
            "name": {
                "family-name": "Lname",
                "given-name": "Fname"
            }
        }
    ],
    "email": {
        "email": "asdf@asdf.com"
    },
    "rawData": {
        "_addresses": [
            {
                "_element": [
                    {
                        "address": {
                            "country-name": "US",
                            "extended-address": "Apt 45",
                            "locality": "State",
                            "postal-code": "12345",
                            "region": "AL",
                            "street-address": "123 First St"
                        },
                        "name": {
                            "family-name": "Lname",
                            "given-name": "Fname"
                        }
                    },
                    {
                        "address": {
                            "country-name": "BE",
                            "postal-code": "12345",
                            "street-address": "456 Some Ave||||||"
                        },
                        "name": {
                            "family-name": "Lname",
                            "given-name": "Fname"
                        }
                    }
                ]
            }
        ],
        "_emails": [
            {
                "_element": [
                    {
                        "email": "asdf@asdf.com"
                    }
                ]
            }
        ],
        "family-name": "Lname",
        "given-name": "Fname"
    }
}
```

###### Nested zooms

You can specify multiple zoom strings in each item of the zoom object and separate them by commas (`,`). The first zoom string will be loaded into the corresponding key and the rest will be looked for loaded into that object. This currently only supports 1 level deep.

Example where `lineItems` has several zoom strings that will be mapped into the single `lineItems` object:

```
cortexApiService.get({
        path: '/purchases/crugive/giydanby=',
        zoom: {
          donorDetails: 'donordetails',
          paymentInstruments: 'paymentinstruments:element',
          lineItems: 'lineitems:element,lineitems:element:code,lineitems:element:rate',
        }
      });
```

This will return: (the `rawData` key shows what the original response looked like. `self` and `link` keys have been removed for clarity)

```
{
    "donorDetails": {
        "donor-type": "Household",
        "mailing-address": {
            address: {
                "country-name": "US",
                "locality": "sdag",
                "postal-code": "12423",
                "region": "AR",
                "street-address": "dsfg"
            }
        },
        "name": {
            "family-name": "Lname",
            "given-name": "Fname",
            "middle-initial": "m",
            "suffix": "Jr.",
            "title": "Mr."
        },
        "organization-name": "myorg",
        "phone-number": "1234567890",
        "registration-state": "MATCHED",
        "spouse-name": {
            "family-name": "rewq",
            "given-name": "qwer",
            "middle-initial": "a",
            "suffix": "IV",
            "title": "Mrs."
        }
    },
    "paymentInstruments": {
        "billing-address": {
            "address": {
                "country-name": "US",
                "extended-address": "Apt 45",
                "locality": "State",
                "postal-code": "12345",
                "region": "AL",
                "street-address": "123 Asdf St"
            },
            "name": {
                "family-name": "Lname",
                "given-name": "Fname"
            }
        },
        "card-type": "Visa",
        "expiry-date": {
            "month": "12",
            "year": "2019"
        },
        "holder-name": "Some Name",
        "primary-account-number-id": "*******************************************************9vow",
        "telephone-type": "voice"
    },
    "lineItems": {
        "line-extension-amount": [
            {
                "amount": 50,
                "currency": "USD",
                "display": "$50.00"
            }
        ],
        "line-extension-tax": [
            {
                "amount": 0,
                "currency": "USD",
                "display": "$0.00"
            }
        ],
        "line-extension-total": [
            {
                "amount": 50,
                "currency": "USD",
                "display": "$50.00"
            }
        ],
        "name": "D Boswell",
        "quantity": 1,
        "code": {
            "code": "0129130",
            "product-code": "0129130"
        },
        "rate": {
            "cost": {
                "amount": 50,
                "currency": "USD",
                "display": "$50.00"
            },
            "display": "$50.00 One Time",
            "recurrence": {
                "display": "One Time",
                "interval": "NA"
            }
        }
    },
    "rawData": {
        "_donordetails": [
            {
                "donor-type": "Household",
                "mailing-address": {
                    address: {
                        "country-name": "US",
                        "locality": "sdag",
                        "postal-code": "12423",
                        "region": "AR",
                        "street-address": "dsfg"
                    }
                },
                "name": {
                    "family-name": "Lname",
                    "given-name": "Fname",
                    "middle-initial": "m",
                    "suffix": "Jr.",
                    "title": "Mr."
                },
                "organization-name": "myorg",
                "phone-number": "1234567890",
                "registration-state": "MATCHED",
                "spouse-name": {
                    "family-name": "rewq",
                    "given-name": "qwer",
                    "middle-initial": "a",
                    "suffix": "IV",
                    "title": "Mrs."
                }
            }
        ],
        "_lineitems": [
            {
                "_element": [
                    {
                        "_code": [
                            {
                                "code": "0129130",
                                "product-code": "0129130"
                            }
                        ],
                        "_rate": [
                            {
                                "cost": {
                                    "amount": 50,
                                    "currency": "USD",
                                    "display": "$50.00"
                                },
                                "display": "$50.00 One Time",
                                "recurrence": {
                                    "display": "One Time",
                                    "interval": "NA"
                                }
                            }
                        ],
                        "line-extension-amount": [
                            {
                                "amount": 50,
                                "currency": "USD",
                                "display": "$50.00"
                            }
                        ],
                        "line-extension-tax": [
                            {
                                "amount": 0,
                                "currency": "USD",
                                "display": "$0.00"
                            }
                        ],
                        "line-extension-total": [
                            {
                                "amount": 50,
                                "currency": "USD",
                                "display": "$50.00"
                            }
                        ],
                        "name": "D Boswell",
                        "quantity": 1
                    }
                ]
            }
        ],
        "_paymentinstruments": [
            {
                "_element": [
                    {
                        "billing-address": {
                            "address": {
                                "country-name": "US",
                                "extended-address": "Apt 45",
                                "locality": "State",
                                "postal-code": "12345",
                                "region": "AL",
                                "street-address": "123 Asdf St"
                            },
                            "name": {
                                "family-name": "Lname",
                                "given-name": "Fname"
                            }
                        },
                        "card-type": "Visa",
                        "expiry-date": {
                            "month": "12",
                            "year": "2019"
                        },
                        "holder-name": "Some Name",
                        "primary-account-number-id": "*******************************************************9vow",
                        "telephone-type": "voice"
                    }
                ]
            }
        ],
        "monetary-total": [
            {
                "amount": 50,
                "currency": "USD",
                "display": "$50.00"
            }
        ],
        "purchase-date": {
            "display-value": "September 1, 2016 11:44:53 PM",
            "value": 1472773493000
        },
        "purchase-number": "20048",
        "status": "COMPLETED",
        "tax-total": {
            "amount": 0,
            "currency": "USD",
            "display": "$0.00"
        }
    }
}
```
