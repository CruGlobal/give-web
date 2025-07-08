import angular from 'angular';
import 'angular-environment';
import rollbar from 'rollbar';
import defaults from 'lodash/defaults';
import find from 'lodash/find';
import includes from 'lodash/includes';

let Rollbar;

const rollbarConfig = /* @ngInject */ function (envServiceProvider, $provide) {
  const config = {
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: false,
    captureUnhandledRejections: false,
    environment: envServiceProvider.get(),
    enabled: !envServiceProvider.is('development'), // Disable rollbar in development environment
    scrubFields: ['password', 'cvv', 'cvv2', 'security-code', 'k'],
    telemetryScrubber: scrubDomNodes([
      'cardNumber',
      'cardholderName',
      'expiryMonth',
      'expiryYear',
      'securityCode',
      'bankName',
      'accountType',
      'routingNumber',
      'accountNumber',
      'verifyAccountNumber',
    ]),
    payload: {
      client: {
        javascript: {
          source_map_enabled: true,
          guess_uncaught_frames: true,
          code_version: process.env.GITHUB_SHA,
        },
      },
      rumSessionId: window.datadogRum?.getInternalContext()?.session_id,
    },
  };
  Rollbar = rollbar.init(config);

  /* @ngInject */
  $provide.decorator('$log', ($delegate) => {
    // Add rollbar functionality to each $log method
    angular.forEach(['log', 'debug', 'info', 'warn', 'error'], (ngLogLevel) => {
      const rollbarLogLevel = ngLogLevel === 'warn' ? 'warning' : ngLogLevel;

      const originalFunction = $delegate[ngLogLevel]; // Call below to keep angular $log functionality

      $delegate[ngLogLevel] = (...args) => {
        originalFunction.apply(null, args);
        const [message, ...rest] = args;

        if (message instanceof Error) {
          Rollbar[rollbarLogLevel](message.message, message, { args: rest });
        } else {
          if (rest[0] && (rest[0].status === -1 || rest[0].status === 401)) {
            return; // Drop browser network errors and unauthorized api errors due to expired tokens
          }
          Rollbar[rollbarLogLevel](message, new Error(message), { args: rest });
        }
      };

      defaults($delegate[ngLogLevel], originalFunction); // copy properties of original $log function which specs use
    });

    return $delegate;
  });
};

function updateRollbarPerson(session, giveSession) {
  let person = {};
  if (session) {
    person = {
      id: session.sub,
      username: session.first_name + ' ' + session.last_name,
      email: session.email,
      giveId: giveSession.sub,
    };
  }

  Rollbar.configure({
    payload: {
      person: person,
    },
  });
}

function scrubDomNodes(scrubNames) {
  return (node) => {
    const nameAttr = find(node.attributes, (attr) => attr.key === 'name');
    return !!nameAttr && includes(scrubNames, nameAttr.value);
  };
}

export {
  rollbarConfig as default,
  updateRollbarPerson,
  rollbar, // For mocking during testing
  scrubDomNodes, // To test this function separately
};
