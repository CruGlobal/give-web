import angular from 'angular'
import 'angular-mocks'
import module from './historicalView.component'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'
import recipientResponse from '../../../../common/services/api/fixtures/cortex-donations-recipient.fixture'

describe('your giving', function () {
  describe('historical view', () => {
    beforeEach(angular.mock.module(module.name))
    let $ctrl

    beforeEach(inject((_$componentController_) => {
      $ctrl = _$componentController_(module.name, {}, {
        year: 2016,
        month: { month: 5 },
        setLoading: jest.fn()
      })
    }))

    it('to be defined', function () {
      expect($ctrl).toBeDefined()
      expect($ctrl.donationsService).toBeDefined()
      expect($ctrl.profileService).toBeDefined()
    })

    describe('$onChanges()', () => {
      beforeEach(() => {
        jest.spyOn($ctrl, 'loadGifts').mockImplementation(() => {})
      })

      it('should reload historical gifts when year changes', () => {
        $ctrl.year = 2018
        $ctrl.$onChanges({ year: { currentValue: 2018 } })

        expect($ctrl.loadGifts).toHaveBeenCalledWith(2018, 5)
      })

      it('should reload historical gifts when month changes', () => {
        $ctrl.month = { month: 10 }
        $ctrl.$onChanges({ year: { currentValue: 10 } })

        expect($ctrl.loadGifts).toHaveBeenCalledWith(2016, 10)
      })

      it('should reload historical gifts when reload changes to true', () => {
        $ctrl.$onChanges({ reload: { currentValue: true } })

        expect($ctrl.loadGifts).toHaveBeenCalledWith(2016, 5)
      })

      it('should not reload historical gifts when reload changes to false', () => {
        $ctrl.$onChanges({ reload: { currentValue: false } })

        expect($ctrl.loadGifts).not.toHaveBeenCalled()
      })

      it('does nothing if there are no changes', () => {
        $ctrl.$onChanges({})

        expect($ctrl.loadGifts).not.toHaveBeenCalled()
      })
    })

    describe('loadGifts( year, month )', () => {
      let subscriberSpy
      beforeEach(() => {
        subscriberSpy = { unsubscribe: jest.fn() }
        jest.spyOn($ctrl.donationsService, 'getRecipients')
        jest.spyOn($ctrl.donationsService, 'getRecipientsRecurringGifts')
        jest.spyOn($ctrl.profileService, 'getPaymentMethod')
      })

      it('should parse and keep the historical gift data that we care about', () => {
        const paymentInstrument = {
          'account-type': 'Checking',
          'bank-name': 'Test Bank',
          'default-on-profile': false,
          description: 'Test Bank Checking **0000',
          'display-account-number': '0000',
          'encrypted-account-nmber': 'encrypted-value',
          id: 'base-32-encoded-id',
          links: [],
          messages: [],
          name: 'Cru Payment Instrument',
          'routing-number': '123123123',
          self: {},
          'siebel-row-id': '1-TEST'
        }
        const recurringGift = {
          rate: { recurrence: { interval: 'Monthly' } }
        }

        const expectedHistoricalGifts = [
          { ...recipientResponse['donation-summaries'][0].donations[0], paymentmethod: paymentInstrument, recurringdonation: recurringGift },
          recipientResponse['donation-summaries'][1].donations[0],
          recipientResponse['donation-summaries'][2].donations[0],
        ]

        $ctrl.donationsService.getRecipients.mockImplementation(() => Observable.of(recipientResponse['donation-summaries']))
        $ctrl.donationsService.getRecipientsRecurringGifts.mockImplementation(() => Observable.of({ donations: [ recurringGift ] }))
        $ctrl.profileService.getPaymentMethod.mockImplementation(() => Observable.of(paymentInstrument))
        $ctrl.subscriber = subscriberSpy
        $ctrl.loadGifts(2017, 1)
        expect($ctrl.historicalGifts).toEqual(expectedHistoricalGifts)
      })

      it('loads historical gifts by year and month if current request is pending', () => {
        $ctrl.donationsService.getRecipients.mockImplementation(() => Observable.of(['a', 'b']))
        $ctrl.subscriber = subscriberSpy
        $ctrl.loadGifts(2016, 5)

        expect($ctrl.loadingGiftsError).toEqual(false)
        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
        expect(subscriberSpy.unsubscribe).toHaveBeenCalled()
        expect($ctrl.donationsService.getRecipients).toHaveBeenCalledWith(2016)
        expect($ctrl.historicalGifts).toEqual(['a', 'b'])
        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false })
      })

      it('sets loading false on error ', () => {
        $ctrl.donationsService.getRecipients.mockImplementation(() => Observable.throw('error'))
        $ctrl.loadGifts(1990, 1)

        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: true })
        expect($ctrl.historicalGifts).not.toBeDefined()
        expect($ctrl.setLoading).toHaveBeenCalledWith({ loading: false })
        expect($ctrl.loadingGiftsError).toEqual(true)
        expect($ctrl.$log.error.logs[0]).toEqual(['Error loading historical gifts', 'error'])
      })
    })
  })
})
