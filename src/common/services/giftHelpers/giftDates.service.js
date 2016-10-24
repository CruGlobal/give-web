import moment from 'moment';
import range from 'lodash/range';
import map from 'lodash/map';
import toString from 'lodash/toString';

export function possibleTransactionDays() {
  return range( 1, 29 ).map( toString );
}

// Generate a string of 4 months based on transactionDay and nextDrawDate
export function quarterlyMonths(transactionDay, nextDrawDate, monthOffset){
  monthOffset = monthOffset || 0;
  nextDrawDate = startDate(transactionDay, nextDrawDate).add(monthOffset, 'months');
  let months = map(range(4), index => {
    return nextDrawDate.clone().add(index, 'quarters').format('MMMM');
  });
  months.push('and ' + months.pop());
  return months.join(', ');
}

// Given a transactionDay, find the next occurrence of that day on or after nextDrawDate
export function startDate(transactionDay, nextDrawDate, monthOffset){
  monthOffset = monthOffset || 0;
  let transactionDate = moment(nextDrawDate);
  if(transactionDay){
    transactionDate.date(transactionDay);
  }
  if(transactionDate.isBefore(nextDrawDate)){
    monthOffset++;
  }
  return transactionDate.add(monthOffset, 'months');
}

// Given a transactionDay and month, find the next occurrence of that month and day on or after nextDrawDate
export function startMonth(transactionDay, month, nextDrawDate, monthOffset){
  monthOffset = monthOffset || 0;
  let transactionDate = moment(nextDrawDate).month(parseInt(month) - 1).date(transactionDay);
  if(transactionDate.isBefore(nextDrawDate)){
    transactionDate.add(1, 'years');
  }
  return transactionDate.add(monthOffset, 'months');
}
