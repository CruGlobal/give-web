import sessionService from 'common/services/session/session.service';

function analyticsFactory(sessionService) {
    return {
        buildProductVar: function(cartData) {
            var item, donationType;

            // Instantiate cart data layer
            digitalData.cart = {
                item: []
            };

            // Build cart data layer
            digitalData.cart.price = {
                cartTotal: cartData.cartTotal
            }

            if (cartData && cartData.items) {

                for (var i = 0; i < cartData.items.length; i++) {

                    // Set donation type
                    if (cartData.items[i].frequency.toLowerCase() == 'single') {
                        donationType = 'one-time donation';
                    } else {
                        donationType = 'recurring donation';
                    }

                    item = {
                        productInfo: {
                            productID: cartData.items[i].designationNumber
                        },
                        price: {
                            basePrice: cartData.items[i].amount
                        },
                        attributes: {
                            donationType: donationType,
                            donationFrequency: cartData.items[i].frequency.toLowerCase(),
                            siebel: {
                                productType: 'designation',
                                campaignCode: cartData.items[i].config['campaign-code']
                            }
                        }
                    };

                    digitalData.cart.item.push(item);

                }
            }
        },
        cartAdd: function(itemConfig, productData, page) {
            var siteSubSection, donationType,
                cart = {
                    item: [{
                        productInfo: {
                            productID: productData.designationNumber
                        },
                        price: {
                            basePrice: itemConfig.amount
                        },
                        attributes: {
                            siebel: {
                                productType: 'designation'
                            }
                        }
                    }]
                };

            // Set site sub-section
            if (typeof digitalData.page !== 'undefined') {
                if (typeof digitalData.page.category !== 'undefined') {
                    digitalData.page.category.subCategory1 = siteSubSection;
                } else {
                    digitalData.page.category = {
                        subCategory1: siteSubSection
                    };
                }
            } else {
                digitalData.page = {
                    category: {
                        subcategory1: siteSubSection
                    }
                };
            }

            // Set donation type
            if (productData.frequency == 'NA') {
                cart.item[0].attributes.donationType = 'one-time donation';
            } else {
                cart.item[0].attributes.donationType = 'recurring donation';
            }

            // Set donation frequency
            for (var i = 0; i < productData.frequencies.length; i++) {
                if (productData.frequencies[i].name == productData.frequency) {
                    cart.item[0].attributes.donationFrequency = productData.frequencies[i].display.toLowerCase();
                }
            }

            // Set data layer
            digitalData.cart = cart;

            // Call DTM direct call rule
            if (typeof _satellite !== 'undefined') {
                _satellite.track('aa-add-to-cart');
            }
        },
        cartRemove: function(designationNumber) {
            if (typeof designationNumber !== 'undefined') {
                var products = s.products;

                digitalData.cart.item = [{
                    productInfo: {
                        productID: designationNumber
                    }
                }];

                _satellite.track('aa-cart-remove');

                // Curate events variable for subsequent scView event
                if (s.events.length > -1) {
                    var eventsArr = s.events.split(',');

                    for (var i = 0; i < eventsArr.length; i++) {
                        if (eventsArr[i] == 'scRemove') {
                            eventsArr.splice(i, 1);
                        }
                    }

                    s.events = eventsArr.join(',');
                    s.events = s.apl(s.events, 'scView', ',', 2);
                }

                // Curate products variable for subsequent scView event
                if (products.length > -1) {
                    var productsArr = products.split(',');

                    for (var i = 0; i < productsArr.length; i++) {
                        if (productsArr[i].slice(1) == designationNumber) {
                            productsArr.splice(i, 1);
                        }
                    }

                    s.products = productsArr.join(',');
                }
            }
        },
        cartView: function(cartData, callType) {
            // Build products variable
            this.buildProductVar(cartData);

            // Call DTM direct call rule
            if (typeof callType !== 'undefined' && callType == 'customLink') {
                if (typeof _satellite !== 'undefined') {
                    s.clearVars();
                    _satellite.track('aa-view-minicart');
                }
            }
        },
        editRecurringDonation: function(giftData) {
            var frequency = '';

            if (giftData && giftData.length) {
                if (giftData[0].gift.updated-rate.recurrence.interval.length) {
                    frequency = giftData[0].gift.updated-rate.recurrence.interval.toLowerCase();
                } else {
                    frequency = giftData[0].parentDonation.rate.recurrence.interval.toLowerCase();
                }

                if (typeof digitalData !== 'undefined') {
                    if (typeof digitalData.recurringGift !== 'undefined') {
                        digitalData.recurringGift.originalFrequency = frequency;
                    } else {
                        digitalData.recurringGift = {
                            originalFrequency: frequency
                        }
                    }
                } else {
                    digitalData = {
                        recurringGift: {
                            originalFrequency: frequency
                        }
                    }
                }
            }

            this.pageLoaded();
        },
        getPath: function() {
            var pagename = '',
                delim = ':',
                path = window.location.pathname;

            if (path !== '/') {
                var extension = ['.html','.htm'];

                for (var i = 0; i < extension.length; i++) {
                    if (path.indexOf(extension[i]) > -1) {
                        path = path.split(extension[i]);
                        path = path.splice(0,1);
                        path = path.toString();

                        break;
                    }
                }

                path = path.split('/');

                if (path[0].length == 0) {
                    path.shift();
                }

                // Set pageName
                pagename = 'give' + delim + path.join(delim);
            } else {
                // Set pageName
                pagename = 'give' + delim + 'home';
            }

            this.setPageNameObj(pagename);

            return path;
        },
        getSetProductCategory: function(path) {
            var allElements = document.getElementsByTagName('*');

            for (var i = 0, n = allElements.length; i < n; i++) {
                var desigType = allElements[i].getAttribute('designationtype');

                if (desigType !== null) {
                    digitalData.product = [{
                        category: {
                            primaryCategory: 'donation ' + desigType.toLowerCase(),
                            siebelProductType: 'designation',
                            organizationId: path[0]
                        }
                    }];

                    return path[0];
                }
            }

            return false;
        },
        giveGiftModal: function(productCode) {
            console.log('GIFT MODAL');
            var product = [{
                    productInfo: {
                        productID: productCode
                    },
                    attributes: {
                        siebel: {
                            producttype: 'designation'
                        }
                    }
                }];

            digitalData.product = product;
            this.setEvent('give gift modal');
            this.pageLoaded();
        },
        pageLoaded: function() {
            this.getPath();
            this.getSetProductCategory();
            this.setSiteSections();
            
            if (typeof digitalData.page.attributes !== 'undefined') {
                if (digitalData.page.attributes.angularLoaded == 'true') {
                    digitalData.page.attributes.angularLoaded = 'false';
                } else {
                    digitalData.page.attributes.angularLoaded = 'true';
                }
            } else {
                digitalData.page.attributes = {
                    angularLoaded: 'true'
                };
            }

            var angularLoaded = digitalData.page.attributes.angularLoaded;

            // Allow time for data layer changes to be consumed & fire image request
            window.setTimeout(function() {
                s.t();
                s.clearVars();
                digitalData = {
                    page: {
                        attributes: {
                            angularLoaded: angularLoaded
                        }
                    }
                };
            }, 1000);
        },
        purchase: function(donorDetails, cartData) {
            // Build cart data layer
            this.setDonorDetails(donorDetails);
            this.buildProductVar(cartData);

            var aaProducts = s.setProducts('checkout');

            // Store data for use on following page load
            localStorage.setItem('aaProducts', aaProducts);
        },
        search: function(params, results) {
            if (typeof params !== 'undefined') {
                if (typeof digitalData.page !== 'undefined') {
                    if (typeof digitalData.page.pageInfo !== 'undefined') {
                        digitalData.page.pageInfo.onsiteSearchTerm = params.keyword;
                        digitalData.page.pageInfo.onsiteSearchFilter = params.type;
                    } else {
                        digitalData.page.pageInfo = {
                            onsiteSearchTerm: params.keyword,
                            onsiteSearchFilter: params.type
                        };
                    }
                } else {
                    digitalData.page = {
                        pageInfo: {
                            onsiteSearchTerm: params.keyword,
                            onsiteSearchFilter: params.type
                        }
                    };
                }
            }

            if (typeof results !== 'undefined' && results.length > 0) {
                if (typeof digitalData.page !== 'undefined') {
                    if (typeof digitalData.page.pageInfo !== 'undefined') {
                        digitalData.page.pageInfo.onsiteSearchResults = results.length;
                    } else {
                        digitalData.page.pageInfo = {
                            onsiteSearchResults: results.length
                        };
                    }
                } else {
                    digitalData.page = {
                        pageInfo: {
                            onsiteSearchResults: results.length
                        }
                    };
                }
            } else {
                digitalData.page.pageInfo.onsiteSearchResults = 0;
            }
        },
        setDonorDetails: function(donorDetails) {
            var ssoGuid = '',
                donorType = '',
                donorAcct = '';

            if (donorDetails) {
                donorType = donorDetails['donor-type'].toLowerCase();
                donorAcct = donorDetails['donor-number'].toLowerCase();
            }

            if (typeof sessionService !== 'undefined') {
                if (typeof sessionService.session['sub'] !== 'undefined') {
                    ssoGuid = sessionService.session['sub'].split('|').pop();
                }
            }

            if (typeof digitalData.user !== 'undefined') {
                if (typeof digitalData.user[0].profile !== 'undefined') {
                    if (typeof digitalData.user[0].profile[0].profileInfo !== 'undefined') {
                        digitalData.user[0].profile[0].profileInfo.ssoGuid = ssoGuid;
                        digitalData.user[0].profile[0].profileInfo.donorType = donorType;
                        digitalData.user[0].profile[0].profileInfo.donorAcct = donorAcct;
                    } else {
                        digitalData.user[0].profile[0].profileInfo = {
                            ssoGuid: ssoGuid,
                            donorType: donorType,
                            donorAcct: donorAcct
                        };
                    }
                } else {
                    digitalData.user[0].profile = [{
                        profileInfo: {
                            ssoGuid: ssoGuid,
                            donorType: donorType,
                            donorAcct: donorAcct
                        }
                    }];
                }
            } else {
                digitalData.user = [{
                    profile: [{
                        profileInfo: {
                            ssoGuid: ssoGuid,
                            donorType: donorType,
                            donorAcct: donorAcct
                        }
                    }]
                }];
            }

            // Store data for use on following page load
            localStorage.setItem('aaDonorType', digitalData.user[0].profile[0].profileInfo.donorType);
            localStorage.setItem('aaDonorAcct', digitalData.user[0].profile[0].profileInfo.donorAcct);
        },
        setEvent: function(eventName) {
            var evt = {
                    eventInfo: {
                        eventName: eventName
                    }
                };

            digitalData.event = [];
            digitalData.event.push(evt);
        },
        setPageNameObj: function(pageName) {
            if (typeof digitalData.page !== 'undefined') {
                if (typeof digitalData.page.pageInfo !== 'undefined') {
                    digitalData.page.pageInfo.pageName = pageName;
                } else {
                    digitalData.page.pageInfo = {
                        pageName: pageName
                    };
                }
            } else {
                digitalData.page = {
                    pageInfo: {
                        pageName: pageName
                    }
                };
            }
        },
        setSiteSections: function(path) {
            var primaryCat = 'give';

            if (!path) {
                var path = this.getPath();
            }

            if (typeof digitalData !== 'undefined') {
                if (typeof digitalData.page !== 'undefined') {
                    digitalData.page.category = {
                        primaryCategory: primaryCat
                    };
                } else {
                    digitalData.page = {
                        category: {
                            primaryCategory: primaryCat
                        }
                    };
                }
            } else {
                digitalData = {
                    page: {
                        category: {
                            primaryCategory: primaryCat
                        }
                    }
                };
            }

            if (path.length >= 1) {

                // Check if product page
                if (/^\d+$/.test(path[0])) {
                    this.getSetProductCategory(path);
                    digitalData.page.category.subCategory1 = 'designation detail';
                } else {
                    digitalData.page.category.subCategory1 = path[0];
                }

                if (path.length >= 2) {
                    digitalData.page.category.subCategory2 = path[1];

                    if (path.length >= 3) {
                        digitalData.page.category.subCategory3 = path[2];
                    }
                }

            }
        }
    }
}

export default angular
    .module('analytics')
    .factory('analyticsFactory', analyticsFactory);
