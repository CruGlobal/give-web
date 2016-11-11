function analyticsFactory() {
    return {
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
                digitalData.page.pageInfo = {
                    pageName: 'give' + delim + path.join(delim)
                };
            } else {
                // Set pageName
                digitalData.page.pageInfo = {
                    pageName: 'give' + delim + 'home'
                };
            }

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
        setSiteSections: function(path) {
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
        },
        createEvent: function(detail) {
            var target = document.getElementsByTagName('body')[0];

            try {
                var event = new CustomEvent(detail.eventName, {
                    detail,
                    bubbles: true,
                    cancelable: true
                });
                target.dispatchEvent(event);
            } catch(e) {
                var event = document.createEvent('Event');
                event.initEvent(detail.eventName, true, true, {
                    detail
                }); // can bubble, and is cancellable
                if (target.addEventListener) {
                    target.addEventListener(detail.eventName, function(event) {
                        event.detail = detail;
                    }, false);
                    target.dispatchEvent(event);
                } else {
                    target.attachEvent(detail.eventName, function(event) {
                        event.detail = detail;
                    });
                }
            }
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

            // Call DTM direct call rule
            if (typeof _satellite !== 'undefined') {
                _satellite.track('aa-give-gift-modal');
            }
        },
        addToCart: function(itemConfig, productData, page) {
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

            // Set site sub section
            if (page == 'cart modal') {
                
            }

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
        viewCart: function(cartData, callType) {
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
            if (callType == 'customLink') {
                if (typeof _satellite !== 'undefined') {
                    _satellite.track('aa-view-minicart');
                }
            } else if (callType == 'pageLoad') {
                if (typeof _satellite !== 'undefined') {
                    digitalData.page.category.subCategory1 = 'gift cart';
                    _satellite.track('aa-view-cart');
                }
            }
        },
        getProductID: function(path) {
            if (/^\d+$/.test(path[0])) {

            }
        },
        pageLoaded: function() {
          console.log('Page Load Event');
        }
    }
}

export default angular
    .module('analytics')
    .factory('analyticsFactory', analyticsFactory);
