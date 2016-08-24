import { rollbarAccessToken } from 'common/app.constants';
import rollbar from 'rollbar-browser';

/* @ngInject */
function rollbarConfig(envServiceProvider, $provide) {
  let rollbarConfig = {
    accessToken: rollbarAccessToken,
    captureUncaught: true,
    captureUnhandledRejections: true,
    environment: envServiceProvider.get()
  };
  let Rollbar = rollbar.init(rollbarConfig);

  /* @ngInject */
  $provide.decorator('$log', ($delegate) => {
    angular.forEach(['log', 'debug', 'info', 'warn', 'error'], (ngLogLevel) => {
      let originalFunction = $delegate[ngLogLevel];
      let rollbarLogLevel = ngLogLevel === 'warn' ? 'warning' : ngLogLevel;
      $delegate[ngLogLevel] = function () {
        Rollbar[rollbarLogLevel]([].slice.call(arguments)); // Convert arguments to array
        originalFunction.apply(null, arguments);
      };
    });

    return $delegate;
  });
}

export default rollbarConfig;
