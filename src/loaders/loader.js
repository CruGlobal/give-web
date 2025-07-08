/* global XMLHttpRequest */
const defaultChunks = ['angular.js', 'fontawesome.css'];

const SCRIPT = /.*\.js$/;
const STYLE = /.*\.css$/;

const loadManifest = () => {
  return new Promise((resolve, reject) => {
    const manifestRequest = new XMLHttpRequest();
    manifestRequest.addEventListener('load', function () {
      resolve(JSON.parse(this.responseText));
    });
    manifestRequest.open('GET', process.env.S3_GIVE_DOMAIN + '/manifest.json');
    manifestRequest.send();
  });
};

const addScriptTag = (filename) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.addEventListener('load', resolve);
    script.src = filename;
    script.async = true;
    document.head.appendChild(script);
  });
};

const addStyleTag = (filename) => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.addEventListener('load', resolve);
    link.href = filename;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  });
};

const Loader = {
  start: async (chunks = []) => {
    const manifest = await loadManifest();
    return Promise.all(
      defaultChunks.concat(chunks).map((name) => {
        if (SCRIPT.test(name)) {
          return addScriptTag(manifest[name]);
        } else if (STYLE.test(name)) {
          return addStyleTag(manifest[name]);
        }
        return Promise.resolve();
      }),
    );
  },
};

export default Loader;
