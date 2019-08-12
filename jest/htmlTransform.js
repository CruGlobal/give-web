const path = require('path')
const ngTemplateLoader = require('ngtemplate-loader')

module.exports = {
  process (src, filename, config, options) {
    const webpackContext = {
      resource: path.basename(filename)
    }
    const result = ngTemplateLoader.call(webpackContext, `\`${src}\``)
    return `${result}; module.exports = "${path.basename(filename)}"`
  }
}
