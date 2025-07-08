import angular from 'angular';
import 'angular-mocks';
import module from './textEditor.modal';

describe('Designation Editor Text', function () {
  beforeEach(angular.mock.module(module.name));
  let $ctrl;

  beforeEach(inject(function (_$controller_) {
    $ctrl = _$controller_(module.name, {
      initialText: '',
    });
  }));

  it('to be defined', function () {
    expect($ctrl).toBeDefined();
  });

  it('to strip html', function () {
    expect($ctrl.stripHtml('<span style="color:#fff;">Hello!</span>')).toEqual(
      'Hello!',
    );
  });
});
