import angular from 'angular';
import filter from 'lodash/filter';

const filterName = 'filterByYear';

function filterByYear() {
  return (receipts, showYear) => {
    if (!showYear) return receipts;
    const filteredReceipts = filter(receipts, (item) => {
      return item['transaction-date']['display-value'].indexOf(showYear) !== -1;
    });
    return filteredReceipts;
  };
}

export default angular.module(filterName, []).filter(filterName, filterByYear);
