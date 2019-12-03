export default angular.module('givewebTranslations', []).run(['gettextCatalog', function (gettextCatalog) {
/* jshint -W100 */
    gettextCatalog.setStrings('es', {"Amount must be at least {{amount}}":"La cantidad debe ser de al menos {{amount}}.","Give a Gift":"Dar un regalo"});
/* jshint +W100 */
}]);
