# Shapefile to GeoJSON converter

[![Dependency Status](https://david-dm.org/patosai/shp2json-js.svg)](https://david-dm.org/patosai/shp2json-js)
[![devDependency Status](https://david-dm.org/patosai/shp2json-js/dev-status.svg)](https://david-dm.org/patosai/shp2json-js#info=devDependencies)

## Usage

```javascript
var shp = require('shp2json-js');
shp(buffer).then(function(geojson) {
  // do stuff with your geojson object
});
```

Only buffers (Buffer/ArrayBuffer) are allowed, and you may give .shp/.dbf files or .zip files.

## To do

- check for geometry validity.
- Tests


## License
MIT.
