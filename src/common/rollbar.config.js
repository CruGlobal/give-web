import { rollbarAccessToken } from 'common/app.constants';
import rollbar from 'rollbar-browser';
import stacktrace from 'stacktrace-js';
import defaults from 'lodash/defaults';

/* @ngInject */
function rollbarConfig(envServiceProvider, $provide) {
  let rollbarConfig = {
    accessToken: rollbarAccessToken,
    captureUncaught: true,
    captureUnhandledRejections: true,
    environment: envServiceProvider.get(),
    enabled: !envServiceProvider.is('development'), // Disable rollbar in development environment
    verbose: envServiceProvider.is('development') // Log rollbar errors to console in development environment
  };
  let Rollbar = rollbar.init(rollbarConfig);

  /* @ngInject */
  $provide.decorator('$log', ($delegate) => {
    // Add rollbar functionality to each $log method
    angular.forEach(['log', 'debug', 'info', 'warn', 'error'], (ngLogLevel) => {
      let rollbarLogLevel = ngLogLevel === 'warn' ? 'warning' : ngLogLevel;

      let originalFunction = $delegate[ngLogLevel]; // Call below to keep angular $log functionality

      $delegate[ngLogLevel] = (...args) => {
        originalFunction.apply(null, args);

        // Generate message string
        let message = args
          .map((arg) => angular.toJson(arg))
          .join(', ');

        stacktrace.get({offline: true})
          .then((stackFrames) => {
            // Ignore first stack frame which is this function
            stackFrames.shift();
            // Convert stack trace to string
            stackFrames = stackFrames.map((sf) => {
              return '    at ' + sf.toString();
            }).join('\n');
            // Send combined message and stack trace to rollbar
            Rollbar[rollbarLogLevel](message + '\n' + stackFrames);
          })
          .catch((error) => {
            // Send message without stack trace to rollbar
            Rollbar[rollbarLogLevel](message);
            // Send warning about the issue loading stackframes
            Rollbar.warning('Error loading stackframes: ' + error);
          });
      };

      defaults($delegate[ngLogLevel], originalFunction); // copy properties of original $log function which specs use
    });

    return $delegate;
  });
}

export {
  rollbarConfig as default,
  rollbar, // For mocking during testing
  stacktrace // For mocking during testing
};
