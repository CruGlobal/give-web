import angular from 'angular';

const filterName = 'giftAmount';

function GiftAmount($filter) {
  // Gift amounts are usually whole dollars, so only show cents when the amount has them.
  return (amount) =>
    $filter('currency')(amount, '$', `${amount}`.indexOf('.') > -1 ? 2 : 0);
}

export default angular
  .module(filterName, [])
  .filter(filterName, ['$filter', GiftAmount]);
