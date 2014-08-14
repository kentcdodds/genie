var GW = {
  loadScript: function (url, callback) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
  }
};

// Hijack the console object
document.addEventListener('DOMContentLoaded', function(){
  var output = document.getElementById('output');
  var log = console.log;
  function printToOutput() {
    var args = Array.prototype.slice.call(arguments);
    output.insertAdjacentHTML('beforeend', args.join(' ') + '\n');
  }

  console.log = function() {
    printToOutput.apply(null, arguments);
    log.apply(console, arguments);
  };

  var clear = console.clear;
  console.clear = function() {
    output.innerHTML = '';
    clear.apply(console, arguments);
  };

  var error = console.error;
  console.error = function() {
    printToOutput.apply(null, arguments);
    error.apply(console, arguments);
  };

  // This isn't catching errors...
  window.onerror = function(errorMessage, url, lineNumber) {
    printToOutput('Check console! Error on line ' + lineNumber + ': ' + errorMessage);
    return true;
  }

});