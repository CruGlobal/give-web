var getEPSelector = function(){

  // eslint-disable-next-line angular/window-service
  var absUrl = window.location.href;

  if(absUrl){

    var relativeUrl = "";
    var question = absUrl.lastIndexOf("?");
    var lastSlashChar = absUrl.lastIndexOf("/");

    // checking if contains parameters the absolute url
    if ( question === -1 ){
      relativeUrl = absUrl.substring(lastSlashChar+1, absUrl.length);
    }else {
      // retrieving url without parameters
      relativeUrl = absUrl.substring(lastSlashChar+1, question);
    }

    if(relativeUrl.includes(".html")){

      relativeUrl = relativeUrl.replace(".html","");

      if(relativeUrl.includes(".")){

        var selectors = relativeUrl.split(".");
        return selectors[1];
      }
    }
  }
};

export default {
  get: getEPSelector
};
