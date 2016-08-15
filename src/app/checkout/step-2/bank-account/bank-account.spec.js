import angular from 'angular';
import 'angular-mocks';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import size from 'lodash/size';
import module from './bank-account.component';

import cartResponse from 'common/services/api/fixtures/cortex-cart-paymentmethodinfo-forms.fixture.js';

describe('checkout', () => {
  describe('step 2', () => {
    describe('bank account', () => {
      beforeEach(angular.mock.module(module.name));
      var self = {};
      self.submitted = false;

      beforeEach(inject(($rootScope, $componentController, $httpBackend) => {
        var $scope = $rootScope.$new();
        self.$httpBackend = $httpBackend;

        self.controller = $componentController(module.name, {
            $scope: $scope
          },
          {
            onSave: () => {}
          });
      }));

      function initForm(){
        //Mock angular form for custom validators
        self.controller.bankPaymentForm = {
          $setSubmitted: () => {},
          $valid: true,
          routingNumber: {
            $parsers: [],
            $validators: {}
          },
          accountNumber: {
            $parsers: [],
            $validators: {},
            $viewChangeListeners: []
          },
          verifyAccountNumber: {
            $parsers: [],
            $validators: {}
          }
        };
      }

      describe('$onChanges', () => {
        it('should call savePayment when submitted changes to true', () => {
          spyOn(self.controller, 'savePayment');
          self.controller.$onChanges({
            submitted: {
              currentValue: true
            }
          });
          expect(self.controller.savePayment).toHaveBeenCalled();
        });
      });

      describe('waitForFormInitialization', () => {
        it('should call addCustomValidators when the form is initialized', () => {
          spyOn(self.controller, 'addCustomValidators');
          self.controller.waitForFormInitialization();
          self.controller.bankPaymentForm = {};
          self.controller.$scope.$apply();
          expect(self.controller.addCustomValidators).toHaveBeenCalled();
        });
      });

      describe('addCustomValidators', () => {
        //TODO: actually test form in template and these functions
        it('should add parser and validator functions to ngModelControllers ', () => {
          initForm();
          self.controller.addCustomValidators();
          expect(size(self.controller.bankPaymentForm.routingNumber.$parsers)).toEqual(1);
          expect(size(self.controller.bankPaymentForm.routingNumber.$validators)).toEqual(2);

          expect(size(self.controller.bankPaymentForm.accountNumber.$parsers)).toEqual(1);
          expect(size(self.controller.bankPaymentForm.accountNumber.$validators)).toEqual(1);
          expect(size(self.controller.bankPaymentForm.accountNumber.$viewChangeListeners)).toEqual(1);

          expect(size(self.controller.bankPaymentForm.verifyAccountNumber.$parsers)).toEqual(1);
          expect(size(self.controller.bankPaymentForm.verifyAccountNumber.$validators)).toEqual(1);
        });
      });

      describe('savePayment', () => {
        afterEach(function() {
          self.$httpBackend.verifyNoOutstandingExpectation();
          self.$httpBackend.verifyNoOutstandingRequest();
        });

        it('should send a request to save the bank account payment info', () => {
          //Request to get form link
          self.$httpBackend.expectGET('https://cortex-gateway-stage.cru.org/cortex/carts/crugive/default?zoom=order:paymentmethodinfo:bankaccountform,order:paymentmethodinfo:creditcardform').respond(200, cartResponse);

          //Custom post data validator to check match on everything except encrypted-account-number which changes on each run
          let expectedPostData = {"account-type":"checking","bank-name":"First Bank","display-account-number":"************9012", "encrypted-account-number": '***encrypted***',"routing-number":"123456789"};
          function dataValidator(data){
            data = angular.fromJson(data);
            return isEqual(omit(data, 'encrypted-account-number'), omit(expectedPostData, 'encrypted-account-number')) && data['encrypted-account-number'].length >= 100;
          }
          dataValidator.toString = () => 'encrypted-account-number must be at least 100 chars and rest of object must match: ' + angular.toJson(expectedPostData);

          //Request to save bank account info
          self.$httpBackend.expectPOST(
            'https://cortex-gateway-stage.cru.org/cortex/bankaccounts/orders/crugive/muytoyrymm2dallghbqtkljuhe3gmllcme4ggllcmu3tmmlcgi2weyldgq=?followLocation=true',
            dataValidator
          ).respond(200, 'success');

          initForm();
          spyOn(self.controller.bankPaymentForm, '$setSubmitted');
          spyOn(self.controller, 'onSave');

          self.controller.bankPayment = {
            accountType: 'checking',
            bankName: 'First Bank',
            routingNumber: '123456789',
            accountNumber: '123456789012'
          };
          self.controller.savePayment();
          expect(self.controller.bankPaymentForm.$setSubmitted).toHaveBeenCalled();

          self.$httpBackend.flush();
          self.$httpBackend.flush();
          expect(self.controller.onSave).toHaveBeenCalledWith({success: true});
        });
      });
    });
  });
});
