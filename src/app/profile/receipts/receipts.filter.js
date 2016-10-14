import angular from 'angular';
import filter from 'lodash/filter';

let filterName = 'filterByYear';

function Capitalize(){
  return (receipts,showYear) => {
    if(!showYear) return receipts;
    let filteredReceipts = filter(receipts, (item) => {
      return item['transaction-date']['display-value'].indexOf(showYear) != -1;
    });
    return filteredReceipts;
  };
}

export default angular
  .module(filterName, [

  ])
  .filter(filterName, Capitalize);
