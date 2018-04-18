(function(){
  window.onload = function () {
    var brandedElement = document.getElementsByTagName('branded-checkout')[0];
    if(!brandedElement){
      console.log('No branded checkout element found.');
      return;
    }

    //convert element attributes to json hash to pass to iframe src
    var attributes = {};
    [].slice.call(brandedElement.attributes).forEach(function(attr){
      attributes[attr.nodeName] = attr.nodeValue;
    });

    //build iframe element
    var iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('scrolling', 'no');
    iframe.src = 'https://give-static.cru.org/brandedCheckoutEmbed.html#' + btoa(JSON.stringify(attributes));
    brandedElement.appendChild(iframe);

    //listen for iframe height changes
    var eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
    var eventer = window[eventMethod];
    var messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';
    eventer(messageEvent, function(e) {
      if (isNaN(e.data)) return;
      iframe.style.height = e.data + 'px';
    }, false);
  };
})();
