import angular from 'angular';
import find from 'lodash/find';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import mapValues from 'lodash/mapValues';
import values from 'lodash/values';

let serviceName = 'hateoasHelperService';

class HateoasHelper {

  getLink(response, relationshipName){
    let linkObj = find(response.links, {rel: relationshipName});
    return linkObj ? linkObj.uri : undefined;
  }

  getElement(response, path){
    if(isArray(path)){
      path = path.join('[0]._');
    }
    let objectPath = '_' + path + '[0]';
    return get(response, objectPath);
  }

  serializeZoom(zoom){
    return values(zoom).join();
  }

  mapZoomElements(data, zoom){
    let dataObj = mapValues(zoom, (zoomString) => {
      return this.getElement(data, zoomString.split(':'));
    });
    dataObj.rawData = data;
    return dataObj;
  }

}

export default angular
  .module(serviceName, [

  ])
  .service(serviceName, HateoasHelper);
