import angular from 'angular';
import find from 'lodash/find';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import mapValues from 'lodash/mapValues';
import map from 'lodash/map';
import values from 'lodash/values';
import escapeRegExp from 'lodash/escapeRegExp';
import forEach from 'lodash/forEach';
import cloneDeep from 'lodash/cloneDeep';
import upperFirst from 'lodash/upperFirst';

const serviceName = 'hateoasHelperService';

class HateoasHelper {
  /* @ngInject */
  constructor() /* eslint-disable-line no-useless-constructor */ {}

  getLink(response, relationshipName) {
    const linkObj = find(response && response.links, { rel: relationshipName });
    if (linkObj) {
      return linkObj.uri
        ? linkObj.uri.replace(/^\//, '') // remove initial slash
        : linkObj.href
          ? linkObj.href.replace(
              /^https?:\/{2}:?[0-9]{0,4}[a-z].*\/cortex(.*)/,
              '$1',
            )
          : undefined;
    }
    return undefined;
  }

  getElement(response, path, zoomIsArray) {
    if (isArray(path)) {
      path = path.join('[0]._');
    }

    let elementArray = get(response, '_' + path); // Try finding it with a underscore
    elementArray = elementArray || get(response, path); // Try finding it without a underscore
    return !elementArray || zoomIsArray ? elementArray : elementArray[0];
  }

  serializeZoom(zoom) {
    return this.stripArrayIndicators(values(zoom).join());
  }

  mapZoomElements(data, zoom) {
    const dataObj = mapValues(zoom, (zoomString) => {
      let childZoomStrings = [];
      [zoomString, ...childZoomStrings] = zoomString.split(','); /// / map to first zoom value only. Allows for the most general one to be up front and request nested ones after
      const element = this.getElement(
        data,
        this.stripArrayIndicators(zoomString).split(':'),
        this.hasArrayIndicators(zoomString),
      );
      if (!element) {
        return element;
      } else if (isArray(element)) {
        return map(element, (singleElement) => {
          return this.mapChildZoomElements(
            singleElement,
            zoomString,
            childZoomStrings,
          );
        });
      } else {
        return this.mapChildZoomElements(element, zoomString, childZoomStrings);
      }
    });
    dataObj.rawData = data;
    return dataObj;
  }

  mapChildZoomElements(element, parentZoomString, childZoomStrings) {
    // Clone element so we can keep searching the original element
    const newElement = cloneDeep(element);

    // setup the parentZoomString as a regex so we can strip it from the children
    const commonPrefixRegex = new RegExp(
      '^' + escapeRegExp(this.stripArrayIndicators(parentZoomString)) + ':',
    );

    // Add each child zoom string into parent object
    forEach(childZoomStrings, (zoomString) => {
      // strip parentZoomString from child zoom string
      zoomString = zoomString.replace(commonPrefixRegex, '');
      const path = this.stripArrayIndicators(zoomString).split(':');
      // Camel case the new key
      const newKey = map(path, (pathItem, index) => {
        return index === 0 ? pathItem : upperFirst(pathItem);
      }).join('');
      newElement[newKey] = this.getElement(
        element,
        path,
        this.hasArrayIndicators(zoomString),
      );
      delete newElement['_' + path[0]]; // Delete original underscored key if it exists
    });
    return newElement;
  }

  stripArrayIndicators(zoomString) {
    return zoomString.replace(/\[|\]/g, '');
  }

  hasArrayIndicators(zoomString) {
    return zoomString.match(/\[\]$/) !== null;
  }
}

export default angular
  .module(serviceName, [])
  .service(serviceName, HateoasHelper);
