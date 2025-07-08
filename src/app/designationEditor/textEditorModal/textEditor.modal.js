import angular from 'angular';
import 'textangularjs';
import 'textangularjs/dist/textAngular-sanitize';
import 'textangularjs/dist/textAngular.css';

import './textEditor.scss';

const controllerName = 'textEditorCtrl';

class ModalInstanceCtrl {
  /* @ngInject */
  constructor(initialText) {
    this.text = initialText;
  }

  stripHtml(html) {
    return html ? String(html).replace(/<[^>]+>/gm, '') : '';
  }
}

export default angular
  .module(controllerName, ['textAngular'])
  .config(function ($provide) {
    $provide.decorator('taOptions', [
      '$delegate',
      function (taOptions) {
        taOptions.toolbar = [
          ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
          [
            'bold',
            'italics',
            'underline',
            'strikeThrough',
            'ul',
            'ol',
            'redo',
            'undo',
            'clear',
          ],
          ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
          ['insertLink'],
        ];

        return taOptions;
      },
    ]);
  })
  .controller(controllerName, ModalInstanceCtrl);
