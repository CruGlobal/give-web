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

let serviceName = 'hateoasHelperService';

class HateoasHelper {

  getLink(response, relationshipName){
    let linkObj = find(response.links, {rel: relationshipName});
    return linkObj ? linkObj.uri : undefined;
  }

  getElement(response, path, zoomIsArray){
    if(isArray(path)){
      path = path.join('[0]._');
    }
    let objectPath = '_' + path;

    let elementArray = get(response, objectPath);
    return !elementArray || zoomIsArray ? elementArray : elementArray[0];
  }

  serializeZoom(zoom){
    return this.stripArrayIndicators(values(zoom).join());
  }

  mapZoomElements(data, zoom){
    let dataObj = mapValues(zoom, (zoomString) => {
      let childZoomStrings = [];
      [zoomString, ...childZoomStrings] = zoomString.split(','); //// map to first zoom value only. Allows for the most general one to be up front and request nested ones after
      let element = this.getElement(data, this.stripArrayIndicators(zoomString).split(':'), this.hasArrayIndicators(zoomString));
      if(!element){
        return element;
      }else if(isArray(element)){
        return map(element, (singleElement) => {
          return this.mapChildZoomElements(singleElement, zoomString, childZoomStrings);
        });
      }else{
        return this.mapChildZoomElements(element, zoomString, childZoomStrings);
      }
    });
    dataObj.rawData = data;
    return dataObj;
  }

  mapChildZoomElements(element, parentZoomString, childZoomStrings){
    element = cloneDeep(element);
    let commonPrefixRegex = new RegExp('^' + escapeRegExp(this.stripArrayIndicators(parentZoomString)) + ':');
    forEach(childZoomStrings, (zoomString) => {
      zoomString = zoomString.replace(commonPrefixRegex, '');
      let path = this.stripArrayIndicators(zoomString).split(':');
      element[path.join('')] = this.getElement(element, path, this.hasArrayIndicators(zoomString)); //TODO: could do camel case key name instead of joining with spaces
      delete element['_' + path[0]];
    });
    return element;
  }

  stripArrayIndicators(zoomString){
    return zoomString.replace(/\[|\]/g, '');
  }

  hasArrayIndicators(zoomString){
    return zoomString.match(/\[\]$/) !== null;
  }
}

export default angular
  .module(serviceName, [

  ])
  .service(serviceName, HateoasHelper);
