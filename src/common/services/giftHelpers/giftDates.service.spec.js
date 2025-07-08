import moment from 'moment';
import { advanceTo, clear } from 'jest-date-mock';

import * as giftDates from './giftDates.service';

describe('giftDates service', () => {
  beforeEach(() => {
    // Keep current date before all of these dates so it is not taken into account
    advanceTo(moment('2015-01-01').toDate());
  });

  afterEach(clear);

  describe('possibleTransactionDays', () => {
    it('should calculate gift start date', () => {
      expect(giftDates.possibleTransactionDays('09', '2018-10-06')).toEqual([
        '01',
        '02',
        '03',
        '04',
        '05',
        '06',
        '07',
        '08',
        '09',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        '23',
        '24',
        '25',
        '26',
        '27',
        '28',
      ]);

      expect(giftDates.possibleTransactionDays('07', '2018-07-16')).toEqual([
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        '23',
        '24',
        '25',
        '26',
        '27',
        '28',
      ]);
    });
  });

  describe('possibleTransactionMonths', () => {
    it('should list available months with years', () => {
      const months = giftDates.possibleTransactionMonths('2018-10-06');

      expect(months).toEqual([
        '2018-10-01',
        '2018-11-01',
        '2018-12-01',
        '2019-01-01',
        '2019-02-01',
        '2019-03-01',
        '2019-04-01',
        '2019-05-01',
        '2019-06-01',
        '2019-07-01',
        '2019-08-01',
        '2019-09-01',
      ]);
    });
  });

  describe('quarterlyMonths', () => {
    it('should get the months for quarterly gifts starting with the nextDrawDate', () => {
      expect(giftDates.quarterlyMonths(10, '2015-11-10')).toEqual(
        'November, February, May, and August',
      );
      expect(giftDates.quarterlyMonths(10, '2015-12-10')).toEqual(
        'December, March, June, and September',
      );
      expect(giftDates.quarterlyMonths(10, '2016-01-10')).toEqual(
        'January, April, July, and October',
      );
    });

    it('should get the months for quarterly gifts taking transaction day into account', () => {
      expect(giftDates.quarterlyMonths(9, '2015-11-10')).toEqual(
        'December, March, June, and September',
      );
      expect(giftDates.quarterlyMonths(9, '2015-12-10')).toEqual(
        'January, April, July, and October',
      );
      expect(giftDates.quarterlyMonths(9, '2016-01-10')).toEqual(
        'February, May, August, and November',
      );
    });

    it('should get the months for quarterly gifts taking the monthOffset into account', () => {
      expect(giftDates.quarterlyMonths(9, '2015-01-01')).toEqual(
        'January, April, July, and October',
      );
      expect(giftDates.quarterlyMonths(9, '2015-01-01', 1)).toEqual(
        'February, May, August, and November',
      );
      expect(giftDates.quarterlyMonths(9, '2015-01-01', 2)).toEqual(
        'March, June, September, and December',
      );
    });
  });

  describe('startDate', () => {
    it('should calculate gift start date', () => {
      expect(giftDates.startDate('10', '2017-01-02').toString()).toEqual(
        moment('2017-01-10').toString(),
      );
      expect(giftDates.startDate(10, '2017-01-02').toString()).toEqual(
        moment('2017-01-10').toString(),
      );
      expect(giftDates.startDate('1', '2017-01-02').toString()).toEqual(
        moment('2017-02-01').toString(),
      );
      expect(giftDates.startDate('1', '2016-12-31').toString()).toEqual(
        moment('2017-01-01').toString(),
      );
    });

    it('should support month offsets', () => {
      expect(giftDates.startDate('10', '2017-01-02', 1).toString()).toEqual(
        moment('2017-02-10').toString(),
      );
      expect(giftDates.startDate('10', '2017-01-02', 2).toString()).toEqual(
        moment('2017-03-10').toString(),
      );
      expect(giftDates.startDate('1', '2017-01-02', 2).toString()).toEqual(
        moment('2017-04-01').toString(),
      );
    });

    it('should support using the old startDate', () => {
      expect(
        giftDates.startDate('3', '2017-01-02', 0, '2017-01-03').toString(),
      ).toEqual(moment('2017-01-03').toString());
      expect(
        giftDates.startDate('2', '2017-01-02', 0, '2017-01-03').toString(),
      ).toEqual(moment('2017-02-02').toString());
      expect(
        giftDates.startDate('1', '2017-01-03', 0, '2017-01-02').toString(),
      ).toEqual(moment('2017-02-01').toString());
    });

    it('should allow transaction day to be null', () => {
      // Currently used to display quarter months based on nextDrawDate only
      expect(giftDates.startDate(null, '2017-01-02').toString()).toEqual(
        moment('2017-01-02').toString(),
      );
      expect(giftDates.startDate(null, '2017-01-02').toString()).toEqual(
        moment('2017-01-02').toString(),
      );
      expect(giftDates.startDate(null, '2017-01-02', 1).toString()).toEqual(
        moment('2017-02-02').toString(),
      );
    });
  });

  describe('startMonth', () => {
    it('should calculate gift start date', () => {
      expect(giftDates.startMonth('10', '1', '2017-01-02').toString()).toEqual(
        moment('2017-01-10').toString(),
      );
      expect(giftDates.startMonth(10, 1, '2017-01-02').toString()).toEqual(
        moment('2017-01-10').toString(),
      );
      expect(giftDates.startMonth('1', 1, '2017-01-02').toString()).toEqual(
        moment('2018-01-01').toString(),
      );
      expect(giftDates.startMonth('1', 12, '2016-12-31').toString()).toEqual(
        moment('2017-12-01').toString(),
      );
    });

    it('should support month offsets', () => {
      expect(giftDates.startMonth('10', 1, '2017-01-02', 1).toString()).toEqual(
        moment('2017-02-10').toString(),
      );
      expect(giftDates.startMonth('10', 1, '2017-01-02', 2).toString()).toEqual(
        moment('2017-03-10').toString(),
      );
      expect(giftDates.startMonth('1', 1, '2017-01-02', 2).toString()).toEqual(
        moment('2018-03-01').toString(),
      );
    });

    it('should support using the old startDate', () => {
      expect(
        giftDates.startMonth('3', 1, '2017-01-02', 0, '2017-01-03').toString(),
      ).toEqual(moment('2017-01-03').toString());
      expect(
        giftDates.startMonth('2', 1, '2017-01-02', 0, '2017-01-03').toString(),
      ).toEqual(moment('2018-01-02').toString());
      expect(
        giftDates.startMonth('1', 1, '2017-01-03', 0, '2017-01-02').toString(),
      ).toEqual(moment('2018-01-01').toString());
    });
  });

  describe('_earliestValidDate', () => {
    it('should use the nextDrawDate if it is the greatest', () => {
      expect(
        giftDates._earliestValidDate('2017-01-03', '2017-01-02').toString(),
      ).toEqual(moment('2017-01-03').toString());
      expect(
        giftDates._earliestValidDate('2017-01-02', '2016-01-03').toString(),
      ).toEqual(moment('2017-01-02').toString());
      expect(
        giftDates._earliestValidDate('2017-03-02', '2017-01-02').toString(),
      ).toEqual(moment('2017-03-02').toString());
      expect(giftDates._earliestValidDate('2017-03-02').toString()).toEqual(
        moment('2017-03-02').toString(),
      );
    });

    it('should use the startDate if it is the greatest', () => {
      expect(
        giftDates._earliestValidDate('2017-01-02', '2017-01-03').toString(),
      ).toEqual(moment('2017-01-03').toString());
      expect(
        giftDates._earliestValidDate('2016-01-03', '2017-01-02').toString(),
      ).toEqual(moment('2017-01-02').toString());
      expect(
        giftDates._earliestValidDate('2017-01-02', '2017-03-02').toString(),
      ).toEqual(moment('2017-03-02').toString());
      expect(
        giftDates._earliestValidDate(undefined, '2017-03-02').toString(),
      ).toEqual(moment('2017-03-02').toString());
    });

    it('should use the current date if it is the greatest', () => {
      advanceTo(moment.utc('2017-01-04').local().toDate());

      expect(
        giftDates._earliestValidDate('2017-01-02', '2017-01-03').toString(),
      ).toEqual(moment('2017-01-04').toString());
      expect(
        giftDates._earliestValidDate('2017-01-03', '2017-01-02').toString(),
      ).toEqual(moment('2017-01-04').toString());
    });

    it('should not use the current date if it is slightly before another date', () => {
      advanceTo(moment.utc('2017-01-02 23:59:59').local().toDate());

      expect(
        giftDates._earliestValidDate('2017-01-02', '2017-01-03').toString(),
      ).toEqual(moment('2017-01-03').toString());
      expect(
        giftDates._earliestValidDate('2017-01-03', '2017-01-02').toString(),
      ).toEqual(moment('2017-01-03').toString());
    });

    it('should not use the next day if the current date is a second before midnight on the same day as another date', () => {
      advanceTo(moment.utc('2017-01-03 23:59:59').local().toDate());

      expect(
        giftDates._earliestValidDate('2017-01-02', '2017-01-03').toString(),
      ).toEqual(moment('2017-01-03').toString());
      expect(
        giftDates._earliestValidDate('2017-01-03', '2017-01-02').toString(),
      ).toEqual(moment('2017-01-03').toString());
    });

    it('should move the current date to the next month if it is after the 28th', () => {
      advanceTo(moment.utc('2017-01-29 23:59:59').local().toDate());

      expect(
        giftDates._earliestValidDate('2017-01-28', '2017-01-27').toString(),
      ).toEqual(moment('2017-02-01').toString());
      expect(
        giftDates._earliestValidDate('2017-02-01', '2017-01-02').toString(),
      ).toEqual(moment('2017-02-01').toString());

      advanceTo(moment.utc('2017-01-30 23:59:59').local().toDate());

      expect(
        giftDates._earliestValidDate('2017-01-28', '2017-01-27').toString(),
      ).toEqual(moment('2017-02-01').toString());
      expect(
        giftDates._earliestValidDate('2017-02-01', '2017-01-02').toString(),
      ).toEqual(moment('2017-02-01').toString());

      advanceTo(moment.utc('2017-12-31 23:59:59').local().toDate());

      expect(
        giftDates._earliestValidDate('2017-12-28', '2017-12-27').toString(),
      ).toEqual(moment('2018-01-01').toString());
      expect(
        giftDates._earliestValidDate('2017-12-01', '2017-12-02').toString(),
      ).toEqual(moment('2018-01-01').toString());
    });

    it('should not use startDate if it is empty', () => {
      advanceTo(moment.utc('2017-01-29 23:59:59').local().toDate());

      expect(giftDates._earliestValidDate('2017-02-01', '').toString()).toEqual(
        moment('2017-02-01').toString(),
      );
      expect(
        giftDates._earliestValidDate('2017-02-01', null).toString(),
      ).toEqual(moment('2017-02-01').toString());
      expect(giftDates._earliestValidDate('2017-02-01').toString()).toEqual(
        moment('2017-02-01').toString(),
      );
    });
  });
});
