import angular from 'angular';
import 'textangular';
import 'textangular/dist/textAngular-sanitize';

import './textEditor.scss';

let controllerName = 'textEditorCtrl';

class ModalInstanceCtrl {

  /* @ngInject */
  constructor( initialText ) {
    this.text = initialText;
  }
}


export default angular
  .module( controllerName, [
    'textAngular'
  ] )
  .config(function($provide) {
    $provide.decorator('taOptions', ['$delegate', function(taOptions) {
      taOptions.toolbar = [
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
        ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
        ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
        ['insertLink']
      ];

      return taOptions;
    }]);
  })
  .controller( controllerName, ModalInstanceCtrl );
