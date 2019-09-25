/* global XMLHttpRequest */
const defaultChunks = ['angular.js']

const SCRIPT = /.*\.js$/
const STYLE = /.*\.css$/

const loadManifest = () => {
  return new Promise((resolve, reject) => {
    const manifestRequest = new XMLHttpRequest()
    manifestRequest.addEventListener('load', function () {
      resolve(JSON.parse(this.responseText))
    })
    manifestRequest.open('GET', 'manifest.json')
    manifestRequest.send()
  })
}

const addScriptTag = (filename) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.addEventListener('load', resolve)
    script.src = filename
    script.async = false
    document.head.appendChild(script)
  })
}

const addStyleTag = (filename) => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.addEventListener('load', resolve)
    link.href = filename
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  })
}

const Loader = {
  start: async (chunks = []) => {
    const manifest = await loadManifest()
    console.log(manifest)
    await Promise.all(defaultChunks.concat(chunks).map(name => {
      console.log(name, manifest[name])
      if (SCRIPT.test(name)) {
        return addScriptTag(manifest[name])
      } else if (STYLE.test(name)) {
        return addStyleTag(manifest[name])
      }
      return Promise.resolve()
    }))
    console.log('Resources loaded!!')
    window.setTimeout(() => {
      window.angular.bootstrap(document.body, ['main'], { strictDi: true })
    }, 10)
  }
}

export default Loader
