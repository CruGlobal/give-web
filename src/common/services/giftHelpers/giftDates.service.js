import moment from 'moment';
import range from 'lodash/range';
import map from 'lodash/map';

export function possibleTransactionDays() {
  return range( 1, 29 ).map((i) => (`0${i}`).slice(-2));
}

// Generate a string of 4 months based on transactionDay and nextDrawDate
export function quarterlyMonths(transactionDay, nextDrawDate, monthOffset){
  monthOffset = monthOffset || 0;
  nextDrawDate = startDate(transactionDay, nextDrawDate, monthOffset);
  let months = map(range(4), index => {
    return nextDrawDate.clone().add(index, 'quarters').format('MMMM');
  });
  months.push('and ' + months.pop());
  return months.join(', ');
}

// Given a transactionDay, find the next occurrence of that day on or after nextDrawDate and startDate
export function startDate(transactionDay, nextDrawDate, monthOffset, startDate){
  monthOffset = monthOffset || 0;
  let earliestValidDate = _earliestValidDate(nextDrawDate, startDate);
  let transactionDate = earliestValidDate.clone();
  if(transactionDay){
    transactionDate.date(transactionDay);
  }
  if(transactionDate.isBefore(earliestValidDate)){
    monthOffset++;
  }
  return transactionDate.add(monthOffset, 'months');
}

// Given a transactionDay and month, find the next occurrence of that month and day on or after nextDrawDate or startDate
export function startMonth(transactionDay, month, nextDrawDate, monthOffset, startDate){
  monthOffset = monthOffset || 0;
  let earliestValidDate = _earliestValidDate(nextDrawDate, startDate);
  let transactionDate = earliestValidDate.clone().month(parseInt(month) - 1).date(transactionDay);
  if(transactionDate.isBefore(earliestValidDate)){
    transactionDate.add(1, 'years');
  }
  return transactionDate.add(monthOffset, 'months');
}

export function _earliestValidDate(nextDrawDate, startDate){
  let currentDate = moment.utc();
  // If date is past the 28th of the month (which are invalid transaction days) use the first of the next month
  if(currentDate.date() > 28){
    currentDate.add(1, 'months');
    currentDate.date(1);
  }

  let datesToCompare = [
    currentDate,
    moment.utc(nextDrawDate)
  ];

  // Include start date unless it is not provided
  if(startDate){
    datesToCompare.push(moment.utc(startDate));
  }

  // Find greatest of today's date, nextDrawDate, and startDate by comparing dates in UTC
  let utcGreatest = moment.max(datesToCompare);

  // Toss all timezone info and pretend the date is at midnight in the browser's timezone
  // like the rest of the dates in the app that are used for display only.
  // The date shown this way is really the UTC date.
  return moment(utcGreatest.format('YYYY-MM-DD'));
}
