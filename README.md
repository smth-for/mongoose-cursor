![Banner](static/poweredBy01.jpg)
[Smth.it](https://smth.it)

# mongoose-cursor
<!-- [![npm version](https://img.shields.io/npm/v/moongoose-cursor.svg)](https://www.npmjs.com/package/moongoose-cursor) -->
<!-- [![Build Status](https://travis-ci.com/smth-for/moongoose-cursor.svg?branch=master)](https://travis-ci.com/smth-for/moongoose-cursor) -->
[![Dependency Status](https://david-dm.org/smth-for/moongoose-cursor.svg)](https://david-dm.org/smth-for/moongoose-cursor)
[![devDependency Status](https://david-dm.org/smth-for/moongoose-cursor/dev-status.svg)](https://david-dm.org/smth-for/moongoose-cursor#info=devDependencies)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/smth-for/moongoose-cursor/issues)
<!-- [![Downloads](https://img.shields.io/npm/dm/moongoose-cursor.svg)](https://img.shields.io/npm/dm/moongoose-cursor.svg) -->
[![HitCount](http://hits.dwyl.com/smth-for/moongoose-cursor.svg)](http://hits.dwyl.com/smth-for/moongoose-cursor)

> A cursor based custom library for [Mongoose](http://mongoosejs.com) with customizable labels.

<!-- [![NPM](https://nodei.co/npm/mongoose-cursor.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/mongoose-cursor) -->

## Why This Plugin
moongoose-cursor is a cursor based library having a cursor wrapper. The plugin can be used as both page as well as cursor pagination. The main usage of the plugin is you can alter the return value keys directly in the query itself so that you don't need any extra code for transformation.

The below documentation is in progress. Feel free to contribute. :)

## Installation
```sh
TODO
```
<!-- ```sh
npm install moongoose-cursor
``` -->

## Usage

Add plugin to a schema and then use model `cursor` method:

```js
const mongoose         = require('mongoose');
const mongoosePaginate = require('moongoose-cursor');

const mySchema = new mongoose.Schema({
  /* your schema definition */
});

mySchema.plugin(mongoosePaginate);

const myModel = mongoose.model('SampleModel',  mySchema);

myModel.cursor().then({}) // Usage
```

### Model.paginate([query], [options], [callback])

Returns promise

**Parameters**

* `[query]` {Object} - Query criteria. [Documentation](https://docs.mongodb.org/manual/tutorial/query-documents)
* `[options]` {Object}
  - `[select]` {Object | String} - Fields to return (by default returns all fields). [Documentation](http://mongoosejs.com/docs/api.html#query_Query-select)
  - `[collation]` {Object} - Specify the collation [Documentation](https://docs.mongodb.com/manual/reference/collation/)
  - `[sort]` {Object | String} - Sort order. [Documentation](http://mongoosejs.com/docs/api.html#query_Query-sort)
  - `[populate]` {Array | Object | String} - Paths which should be populated with other documents. [Documentation](http://mongoosejs.com/docs/api.html#query_Query-populate)
  - `[projection]` {String | Object} - Get/set the query projection. [Documentation](https://mongoosejs.com/docs/api/query.html#query_Query-projection)
  - `[lean=false]` {Boolean} - Should return plain javascript objects instead of Mongoose documents?  [Documentation](http://mongoosejs.com/docs/api.html#query_Query-lean)
  - `[leanWithId=true]` {Boolean} - If `lean` and `leanWithId` are `true`, adds `id` field with string representation of `_id` to every document
  - `[limit=10]` {Number}
  - `[customLabels]` {Object} - Developers can provide custom labels for manipulating the response data.
  - `[key]` {String} - Key field in Scheme for apply a cursor logic (Default: `_id`)
  - `[startingAfter]` {String} - Apply a cursor logic for starting result after value (Default: null)
  - `[endingBefore]` {String} - Apply a cursor logic for ending result before value (Default: null)
  - `[forceCountFn]` {Boolean} - Set this to true, if you need to support $geo queries.
  - `[read]` {Object} - Determines the MongoDB nodes from which to read. Below are the available options.
    - `[pref]`: One of the listed preference options or aliases.
    - `[tags]`: Optional tags for this query. (Must be used with `[pref]`)
  - `[options]` {Object} - Options passed to Mongoose's `find()` function. [Documentation](https://mongoosejs.com/docs/api.html#query_Query-setOptions)


**Return value**

Promise fulfilled with object having properties:

* `docs` {Array} - Array of documents
* `totalDocs` {Number} - Total number of documents in collection that match a query
* `limit` {Number} - Limit that was used
* `hasMore` {Boolean} - Result have a another docs
* `startingAfter` {String} - Appling a cursor logic for starting result after value (Default: null)
* `endingBefore` {String} - Appling a cursor logic for ending result before value (Default: null)
* `meta` {Object} - Object of pagination meta data (Default false).

Please note that the above properties can be renamed by setting customLabels attribute.

### Sample Usage

#### Return first 10 documents from 100

```javascript
const options = {
  limit: 10,
  collation: {
    locale: 'en'
  }
};

Model.paginate({}, options, function(err, result) {
  // result.docs
  // result.totalDocs = 100
  // result.limit = 10
  // result.hasMore = true
});
```

### With custom return labels

Now developers can specify the return field names if they want. Below are the list of attributes whose name can be changed.

* totalDocs
* docs
* limit
* key
* hasMore
* startingAfter
* endingBefore
* meta

You should pass the names of the properties you wish to changes using `customLabels` object in options.
Set the property to false to remove it from the result.
Same query with custom labels

```javascript
const myCustomLabels = {
  totalDocs: 'itemCount',
  docs: 'itemsList',
  limit: 'limit',
  hasMore: 'another',
  startingAfter: 'starting',
  endingBefore: 'endingBefore',
  meta: 'meta'
};

const options = {
  limit: 10,
  customLabels: myCustomLabels
};

Model.paginate({}, options, function(err, result) {
  // result.itemsList [here docs become itemsList]
  // result.meta.itemCount = 100 [here totalDocs becomes itemCount]
});
```

With promise:

```js
Model.paginate({}, { limit: 10 }).then(function(result) {
  // ...
});
```

#### More advanced example

```javascript
var query   = {};
var options = {
  select:   'title date author',
  sort:     { date: -1 },
  populate: 'author',
  lean:     true,
  limit:    10
};

Book.paginate(query, options).then(function(result) {
  // ...
});
```

#### Zero limit

You can use `limit=0` to get only metadata:

```javascript
Model.paginate({}, { limit: 0 }).then(function(result) {
  // result.docs - empty array
  // result.totalDocs
  // result.limit - 0
});
```

#### Set custom default options for all queries

config.js:

```javascript
var mongoosePaginate = require('moongoose-cursor');

mongoosePaginate.paginate.options = {
  lean:  true,
  limit: 20
};
```

controller.js:

```javascript
Model.paginate().then(function(result) {
  // result.docs - array of plain javascript objects
  // result.limit - 20
});
```

#### Fetch all docs without cursor.
If you need to fetch all the documents in the collection without applying a limit. Then set `cursor` as false,

```javascript
const options = {
  pagination: false
};

Model.paginate({}, options, function(err, result) {
  // result.docs
  // result.totalDocs = 100
  // result.limit = 100
});
```

#### Setting read preference.
Determines the MongoDB nodes from which to read.

```js
const options = {
  lean: true,
  limit: 10,
  read: {
    pref: 'secondary',
    tags: [{
      region: 'South'
    }]
  }
};
    
Model.paginate({}, options, function(err, result) {
 // Result
});
```

Below are some references to understand more about preferences,
- https://github.com/Automattic/mongoose/blob/master/lib/query.js#L1008
- https://docs.mongodb.com/manual/core/read-preference/
- http://mongodb.github.io/node-mongodb-native/driver-articles/anintroductionto1_1and2_2.html#read-preferences

## Note
There are few operators that this plugin does not support natively, below are the list and suggested replacements,

* $where: $expr
* $near: $geoWithin with $center
* $nearSphere: $geoWithin with $centerSphere

But we have added another option. So if you need to use $near and $nearSphere please set `forceCountFn` as true and try running the query.

```js
const options = {
  lean: true,
  limit: 10,
  forceCountFn: true
};
    
Model.paginate({}, options, function(err, result) {
 // Result
});
```

## License

[MIT](LICENSE)

## Special Thanks
* [mongoose-paginate-v2](https://github.com/aravindnc/mongoose-paginate-v2)
