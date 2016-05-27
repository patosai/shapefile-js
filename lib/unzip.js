'use strict';

var JSZip = require('jszip');
var Promise = require('lie');

var ARRAY_BUFFER_TYPES = ['shp', 'dbf'];

function unzip(buffer) {
  return new Promise(function(resolve, reject) {
    JSZip.loadAsync(buffer).then(function(zip) {
      var files = zip.file(/.+/);
      var out = {};
      Promise.all(files.map(function(file) {
        var filetype = file.name.slice(-3).toLowerCase();
        var datatype = "string";
        if (ARRAY_BUFFER_TYPES.indexOf(filetype) !== -1) {
          datatype = "arraybuffer";
        }
        return new Promise(function(resolve, reject) {
          file.async(datatype).then(function(data) {
            out[file.name] = data;
            resolve();
          });
        });
      })).then(function() {
        resolve(out);
      });
    }).catch(function(err) {
      reject(err);
    });
  });
};

module.exports = unzip;
