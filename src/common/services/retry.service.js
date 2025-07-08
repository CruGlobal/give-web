import angular from 'angular';

const serviceName = 'retryService';

class Retry {
  /* @ngInject */
  constructor($q, $timeout) {
    this.$q = $q;
    this.$timeout = $timeout;
  }

  executeWithRetries(execute, maxRetries, retryDelay) {
    return this.$q((resolve, reject) => {
      let attempts = 0;
      const attempt = () => {
        ++attempts;

        execute()
          .then(resolve)
          .catch((err) => {
            if (attempts > maxRetries) {
              reject(err);
            } else {
              this.$timeout(attempt, retryDelay);
            }
          });
      };

      attempt();
    });
  }
}

export default angular.module(serviceName, []).service(serviceName, Retry);
