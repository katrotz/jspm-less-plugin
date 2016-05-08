var less = require('less.js');

if (typeof window !== 'undefined') {

  var head = document.getElementsByTagName('head')[0];

  // get all injected style tags in the page
  var styles = document.getElementsByTagName('style');
  var styleIds = [];
  for (var i = 0; i < styles.length; i++) {
    if(!styles[i].hasAttribute("data-href")) continue;
    styleIds.push(styles[i].getAttribute("data-href"));
  }

  var loadStyle = function(url) {
    return new Promise(function(resolve, reject) {
      var request = new XMLHttpRequest();
      request.open('GET', url, true);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          var data = request.responseText;

          var options = window.less || {};
          options.filename = url;
          options.rootpath = url.replace(/[^\/]*$/,'');

          //render it using less
          less.render(data, options).then(function(data){
            resolve(data.css);
          });

        } else {
          // We reached our target server, but it returned an error
          reject()
        }
      };

      request.onerror = function(e) {
        reject(e)
      };

      request.send();
    });
  };

  exports.fetch = function(load) {
    // don't reload styles loaded in the head
    for (var i = 0; i < styleIds.length; i++) {
      if (load.address == styleIds[i]) {
        // "Less" probable to hit this spot as JSPM will not fetch same source from remote twice
        return '';
      }
    }
    return loadStyle(load.address);
  };

  exports.translate = function(load) {
    // Read JSPM configurations of the plugin
    var lessOptions = this.lessOptions || {};

    var appendStyles = lessOptions.append;

    if (appendStyles) {
      var style = document.createElement('style');

      style.textContent = load.source;
      style.setAttribute('type', 'text/css');
      style.setAttribute('data-type', 'text/less');
      style.setAttribute('data-href', load.address);

      head.appendChild(style);

      load.metadata.format = 'defined';
    } else {
      if (this.builder || this.transpiler) {
        load.metadata.format = 'esm';
        return 'export default ' + JSON.stringify(load.source) + ';';
      }

      load.metadata.format = 'amd';
      return 'def' + 'ine(function() {\nreturn ' + JSON.stringify(load.source) + ';\n});';
    }
  };
}
else {
  // setting format = 'defined' means we're managing our own output
  exports.translate = function(load) {
    load.metadata.format = 'defined';
  };
  
  exports.bundle = function(loads, opts) {
    var loader = this;
    if (loader.buildCSS === false)
      return '';
    return loader.import('./less-builder', { name: module.id }).then(function(builder) {
      return builder.call(loader, loads, opts);
    });
  }
}
