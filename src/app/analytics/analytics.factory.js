function analyticsFactory() {
    return {
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
            if (digitalData.page.category) {
                digitalData.page.category.subCategory1 = siteSubSection;
            } else {
                digitalData.page.category = {
                    subcategory1: siteSubSection
                }
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
                                productType: 'designation'
                            }
                        }
                    };

                    digitalData.cart.item.push(item);

                }
            }

            // Call DTM direct call rule
            if (typeof callType !== 'undefined' && callType == 'customLink') {
                if (typeof _satellite !== 'undefined') {
                    s.clearVars();
                    _satellite.track('aa-view-minicart');
                }
            }
        },
        getPath: function() {
            var pagename = '',
                delim = ':',
                path = window.location.pathname,
                queryParams = ['modal','step'];

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

            for (var i = 0; i < queryParams.length; i++) {
                var paramVal = this.getQueryParam(queryParams[i]);
            }

            if (paramVal !== null && paramVal.length) {
                pagename = pagename + delim + paramVal;
            }

            this.setPageNameObj(pagename);

            return path;
        },
        getQueryParam: function(name) {
            var url = window.location.href;

            name = name.replace(/[\[\]]/g, '\\$&');

            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                results = regex.exec(url);

            if (!results) return null;
            if (!results[2]) return '';

            return decodeURIComponent(results[2].replace(/\+/g, ' '));  
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
            //digitalData = {};

            this.getPath();
            this.getSetProductCategory();
            this.setSiteSections();
            
            if (typeof digitalData.page.attributes !== 'undefined') {
                if (digitalData.page.attributes.angularLoaded == '1') {
                    digitalData.page.attributes.angularLoaded = '0';
                } else {
                    digitalData.page.attributes.angularLoaded = '1';
                }
            } else {
                digitalData.page.attributes = {
                    angularLoaded: '0'
                };
            }

            // Allow time for data layer changes to be consumed & fire image request
            window.setTimeout(function() {
                s.t();
            }, 800);
        },
        search: function(params, results) {
            if (typeof params !== 'undefined') {
                digitalData.page.pageInfo.onsiteSearchTerm = params.keyword;
            }

            if (results.length > 0) {
                digitalData.page.pageInfo.onsiteSearchResults = results.length;
            } else {
                digitalData.page.pageInfo.onsiteSearchResults = 0;
            }
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
            if (!path) {
                var path = this.getPath();
            }

            digitalData.page.category = {
                primaryCategory: 'give'
            };

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
