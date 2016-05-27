'use strict';

var JSZip = require('jszip');

function unzip(buffer) {
  var zip = new JSZip(buffer);
  var files = zip.file(/.+/);
  var out = {};
  files.forEach(function(a) {
    if (a.name.slice(-3).toLowerCase() === 'shp' || a.name.slice(-3).toLowerCase() === 'dbf') {
      out[a.name] = a.asText();
      out[a.name] = a.asArrayBuffer();
    } else {
      out[a.name] = a.asText();
    }
  });
  return out;
};

module.exports = unzip;
