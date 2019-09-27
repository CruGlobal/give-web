import Loader from './loader'

(function () {
  Loader.start(['vendors~branded~give.js', 'give.js', 'give.css']).then(() => {
    const script = document.getElementById('give-web-script')
    const modules = (script.getAttribute('data-modules') || '').split(',')
    window.setTimeout(() => {
      window.angular.bootstrap(document.body, modules, { strictDi: true })
    }, 10)
  })
})()
