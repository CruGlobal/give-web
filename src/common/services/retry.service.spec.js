import angular from 'angular';
import 'angular-mocks';
import module from './retry.service';

describe('retryService', () => {
  beforeEach(angular.mock.module(module.name));

  let $flushPendingTasks, $q, $verifyNoPendingTasks, retryService;
  beforeEach(() => {
    inject(($injector) => {
      $flushPendingTasks = $injector.get('$flushPendingTasks');
      $q = $injector.get('$q');
      $verifyNoPendingTasks = $injector.get('$verifyNoPendingTasks');
      retryService = $injector.get('retryService');
    });
  });

  afterEach(() => {
    $verifyNoPendingTasks();
  });

  it('retries then succeeds', () => {
    const execute = jest
      .fn()
      .mockReturnValueOnce($q.reject(new Error('Failed')))
      .mockReturnValueOnce($q.resolve(true));

    expect(retryService.executeWithRetries(execute, 3, 100)).resolves.toBe(
      true,
    );
    $flushPendingTasks();
    $flushPendingTasks();
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('retries the right number of times', () => {
    const execute = jest
      .fn()
      .mockImplementation(() => $q.reject(new Error('Failed')));

    expect(retryService.executeWithRetries(execute, 3, 100)).rejects.toThrow(
      'Failed',
    );
    $flushPendingTasks();
    $flushPendingTasks();
    $flushPendingTasks();
    $flushPendingTasks();
    expect(execute).toHaveBeenCalledTimes(4);
  });

  it('rejects with the last error after running out of attempts', () => {
    let attempt = 0;
    const execute = jest
      .fn()
      .mockImplementation(() => $q.reject(new Error(`Failure ${++attempt}}`)));

    expect(retryService.executeWithRetries(execute, 3, 100)).rejects.toThrow(
      'Failure 4',
    );
    $flushPendingTasks();
    $flushPendingTasks();
    $flushPendingTasks();
    $flushPendingTasks();
  });
});
