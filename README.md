# Shapefile.js

[![Dependency Status](https://david-dm.org/patosai/shp2json-js.svg)](https://david-dm.org/patosai/shp2json-js)
[![devDependency Status](https://david-dm.org/patosai/shp2json-js/dev-status.svg)](https://david-dm.org/patosai/shp2json-js#info=devDependencies)

##API

Has a function `shp` which accepts a string which is the path the she shapefile minus the extension and returns a promise which resolves into geojson.

```javascript
	//for the shapefiles in the folder called 'files' with the name pandr.shp
	shp("files/pandr").then(function(geojson){
		//do something with your geojson
	});
```
or you can call it on a .zip file which contains the shapefile

```javascript
	//for the shapefiles in the files folder called pandr.shp
	shp("files/pandr.zip").then(function(geojson){
		//see bellow for whats here this internally call shp.parseZip()
	});
```

or if you got the zip some other way (like the [File API](https://developer.mozilla.org/en-US/docs/Web/API/File)) then with the arrayBuffer you can call

```javascript
shp(buffer).then(function(geojson){});
//or
shp.parseZip(buffer)->returns zip
```
If there is only one shp in the zipefile it returns geojson, if there are multiple then it will be an array.  All of the geojson objects have an extra key `fileName` the value of which is the 
name of the shapefile minus the extension (I.E. the part of the name that's the same for all of them)

You could also load the arraybuffers seperately:

```javascript
shp.combine([shp.parseShp(shpBuffer, /*optional prj str*/),shp.parseDbf(dbfBuffer)]);
```

##Stick it in a worker

I used my library [catiline](http://catilinejs.com/) to parallelize the demos to do so I changed

```html
<script src='dist/shp.js'> </script>
<script>
	shp('files/shapeFile.zip').then(function(data){
		//do stuff with data
	});
</script>
```

to 

```html
<script src='website/catiline.js'> </script>
<script>
	var worker = cw(function(base,cb){
		importScripts('dist/shp.js');
		shp(base).then(cb);
	});
	//worker can be called multiple times
	worker.data(cw.makeUrl('files/shapeFile.zip')).then(function(data){
		//do stuff with data
	});
</script>
```

to send the worker a buffer from the file api you'd do (I'm omitting where you include the catiline script)

```javascript
var worker = cw(function(data){
	importScripts('../dist/shp.js');
	return shp.parseZip(data);
});

worker.data(reader.result,[reader.result]).then(function(data){
	//do stuff with data
});
```

##Done

- Binary Ajax
- parsing the shp
- parse the dbf
- join em
- zip
- file api
- Some Projections
- More Projections

##to do

- check for geometry validity.
- Tests


##LICENSE
MIT.
