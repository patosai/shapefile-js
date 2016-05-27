var proj4 = require('proj4');
var parseDbf = require('parsedbf');
var Promise = require('lie');

var unzip = require('./unzip');
var parseShp = require('./parseShp');
var toArrayBuffer = require('./toArrayBuffer');

var ZIP_HEADER = 0x504B0304; // big endian

function isBuffer(arg) {
  return Buffer.isBuffer(arg);
}

function isArrayBuffer(arg) {
  return arg instanceof ArrayBuffer;
}

function convertToShp(input) {
  return shp(input);
}

function shp(input) {
  if (isBuffer(input)) {
    input = toArrayBuffer(input);
  }

  if (isArrayBuffer(input)) {
    return shp.getShapefile(input).then(function(resp) {
      return resp;
    });
  } else {
    throw new Error('Invalid input buffer');
  }
}

shp.getShapefile = function(buffer) {
  var byteOffset = 0;
  var byteLength = 4;
  var dataView = new DataView(buffer, byteOffset, byteLength);
  if (dataView.getUint32(0) == ZIP_HEADER) {
    return new Promise(function(resolve) {
      var parsedZip = shp.parseZip(buffer);
      resolve(parsedZip);
    });
  } else {
    return Promise.all([
      parseShp(buffer),
      parseDbf(buffer)
    ]).then(shp.combine);
  }
};

shp.combine = function(arr) {
  var out = {};
  out.type = 'FeatureCollection';
  out.features = [];
  var i = 0;
  var len = arr[0].length;
  while (i < len) {
    out.features.push({
      'type': 'Feature',
      'geometry': arr[0][i],
      'properties': arr[1][i]
    });
    i++;
  }
  return out;
};

shp.parseZip = function(buffer, whiteList) {
  var key;
  var zip = unzip(buffer);
  var names = [];
  whiteList = whiteList || [];
  for (key in zip) {
    if (key.indexOf('__MACOSX') !== -1) {
      continue;
    }
    if (key.slice(-3).toLowerCase() === 'shp') {
      names.push(key.slice(0, - 4));
      zip[key.slice(0, -3) + key.slice(-3).toLowerCase()] = zip[key];
    }
    else if (key.slice(-3).toLowerCase() === 'dbf') {
      zip[key.slice(0, -3) + key.slice(-3).toLowerCase()] = parseDbf(zip[key]);
    }
    else if (key.slice(-3).toLowerCase() === 'prj') {
      zip[key.slice(0, -3) + key.slice(-3).toLowerCase()] = proj4(zip[key]);
    }
    else if (key.slice(-4).toLowerCase() === 'json' || whiteList.indexOf(key.split('.').pop()) > -1) {
      names.push(key.slice(0, -3) + key.slice(-3).toLowerCase());
    }
  }
  if (!names.length) {
    throw new Error('no layers founds');
  }
  var geojson = names.map(function(name) {
    var parsed;
    var lastDotIdx = name.lastIndexOf('.');
    if (lastDotIdx > -1 && name.slice(lastDotIdx).indexOf('json') > -1) {
      parsed = JSON.parse(zip[name]);
      parsed.fileName = name.slice(0, lastDotIdx);
    }
    else if (whiteList.indexOf(name.slice(lastDotIdx + 1)) > -1) {
      parsed = zip[name];
      parsed.fileName = name;
    }
    else {
      parsed = shp.combine([parseShp(zip[name + '.shp'], zip[name + '.prj']), zip[name + '.dbf']]);
      parsed.fileName = name;
    }
    return parsed;
  });
  if (geojson.length === 1) {
    return geojson[0];
  }
  else {
    return geojson;
  }
};

shp.parseShp = function(shp, prj) {
  if (isBuffer(shp)) {
    shp = toArrayBuffer(shp);
  }
  if (isBuffer(prj)) {
    prj = prj.toString();
  }
  if (typeof prj === 'string') {
    prj = proj4(prj);
    return parseShp(shp, prj);
  } else {
    return parseShp(shp);
  }
};

shp.parseDbf = function(dbf) {
  if (isBuffer(dbf)) {
    dbf = toArrayBuffer(dbf);
  }
  return parseDbf(dbf);
};

module.exports = convertToShp;
