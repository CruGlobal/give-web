import { rollbarAccessToken } from 'common/app.constants';
import rollbar from 'rollbar-browser';
import stacktrace from 'stacktrace-js';
import map from 'lodash/map';
import defaults from 'lodash/defaults';
import get from 'lodash/get';

let Rollbar;

/* @ngInject */
function rollbarConfig(envServiceProvider, $provide) {
  let rollbarConfig = {
    accessToken: rollbarAccessToken,
    captureUncaught: true,
    captureUnhandledRejections: false,
    environment: envServiceProvider.get(),
    enabled: !envServiceProvider.is('development'), // Disable rollbar in development environment
    transform: transformRollbarPayload,
    hostWhiteList: ['give.cru.org', 'give-stage2.cru.org', 'stage.cru.org', 'dev.aws.cru.org', 'devauth.aws.cru.org', 'devpub.aws.cru.org', 'uatauth.aws.cru.org', 'uatpub.aws.cru.org']
  };
  Rollbar = rollbar.init(rollbarConfig);

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
          .map(arg => {
            if(arg && arg.message){
              return arg.message; // Message came from $ExceptionHandler
            }else{
              return angular.toJson(arg);
            }
          })
          .join(', ');

        let origin = args[0].message ? '$ExceptionHandler' : '$log';

        stacktrace.get({offline: true})
          .then((stackFrames) => {
            // Ignore first stack frame which is this function
            stackFrames.shift();
            // Send combined message and stack trace to rollbar
            Rollbar[rollbarLogLevel](message, {stackTrace: stackFrames, origin: origin});
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

function formatStacktraceForRollbar(stackFrames){
  return map(stackFrames, (frame) => {
    return {
      method: frame.functionName,
      lineno: frame.lineNumber,
      colno: frame.columnNumber,
      filename: frame.fileName
    };
  });
}

function transformRollbarPayload(payload){
  if(get(payload, 'data.body.message.extra.stackTrace')) {
    // Convert message format to trace format
    payload.data.body.trace = {
      frames: formatStacktraceForRollbar(payload.data.body.message.extra.stackTrace),
      exception: {
        message: payload.data.body.message.body,
        class: payload.data.body.message.extra.origin
      }
    };
    delete payload.data.body.message;
  }
  return payload;
}

function updateRollbarPerson(session){
  let person = {};
  if(session){
    person = {
      id: session.sub,
      username: session.first_name + ' ' + session.last_name,
      email: session.email
    };
  }

  Rollbar.configure({
    payload: {
      person: person
    }
  });
}

export {
  rollbarConfig as default,
  updateRollbarPerson,
  rollbar, // For mocking during testing
  stacktrace, // For mocking during testing,
  formatStacktraceForRollbar, // To test this function separately
  transformRollbarPayload // To test this function separately
};
