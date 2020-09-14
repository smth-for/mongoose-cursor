/**
 * @param {Object}              [query={}]
 * @param {Object}              [options={}]
 * @param {Object|String}       [options.select='']
 * @param {Object|String}       [options.projection={}]
 * @param {Object}              [options.options={}]
 * @param {Object|String}       [options.sort]
 * @param {Object|String}       [options.customLabels]
 * @param {Object}              [options.collation]
 * @param {Array|Object|String} [options.populate]
 * @param {Boolean}             [options.lean=false]
 * @param {Boolean}             [options.leanWithId=true]
 * @param {Number}              [options.limit=10]
 * @param {String}              [options.key='_id']
 * @param {String}              [options.startingAfter=null]
 * @param {String}              [options.endingBefore=null]
 * @param {Object}              [options.read={}] - Determines the MongoDB nodes from which to read.
 * @param {Function}            [callback]
 *
 * @returns {Promise}
 */

const defaultOptions = {
  customLabels: {
    totalDocs: 'totalDocs',
    limit: 'limit',
    docs: 'docs',
    hasMore: 'hasMore',
    startingAfter: 'startingAfter',
    endingBefore: 'endingBefore',
    meta: null,
  },
  key: '_id',
  startingAfter: null,
  endingBefore: null,
  lean: false,
  limit: 10,
  projection: {},
  select: '',
  options: {},
  sort: {},
  forceCountFn: false
};

function cursor(query, options, callback) {
  options = {
    ...defaultOptions,
    ...cursor.options,
    ...options
  };
  query = query || {};

  const {
    key,
    startingAfter,
    endingBefore,
    collation,
    lean,
    populate,
    projection,
    read,
    select,
    sort,
    forceCountFn
  } = options;

  const customLabels = {
    ...defaultOptions.customLabels,
    ...options.customLabels
  };

  const limit = parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 0;

  const isCallbackSpecified = typeof callback === 'function';
  const findOptions = options.options;

  let docsPromise = [];

  // Labels
  const labelDocs = customLabels.docs;
  const labelLimit = customLabels.limit;
  const labelHasMore = customLabels.hasMore;
  const labelTotal = customLabels.totalDocs;
  const labelMeta = customLabels.meta;

  let countPromise;

  if (forceCountFn === true) {
    countPromise = this.count(query).exec();
  } else {
    countPromise = this.countDocuments(query).exec();
  }

  if (limit) {
    const mQuery = this.find(query, projection, findOptions);
    mQuery.select(select);
    mQuery.lean(lean);

    if (read && read.pref) {
      /**
       * Determines the MongoDB nodes from which to read.
       * @param read.pref one of the listed preference options or aliases
       * @param read.tags optional tags for this query
       */
      mQuery.read(read.pref, read.tags);
    }

    // Hack for mongo < v3.4
    if (!!collation && Object.keys(collation).length > 0) {
      mQuery.collation(collation);
    }

    if (populate) {
      mQuery.populate(populate);
    }

    if (startingAfter || endingBefore) {
      mQuery[key] = {};

      if (endingBefore) {
          mQuery[key] = { $lt: endingBefore };

        if (sort[key] && sort[key] > 0) {
          sort[key] = -1;
        }
      } else {
          mQuery[key] = { $gt: startingAfter };

        if (sort[key] && sort[key] <= 0) {
          sort[key] = 1;
        }
      }
    }

    mQuery.sort(sort);
    mQuery.limit(limit + 1);
    docsPromise = mQuery.exec();

    if (lean && leanWithId) {
      docsPromise = docsPromise.then((docs) => {
        docs.forEach((doc) => {
          doc.id = String(doc._id);
        });
        return docs;
      });
    }

  }

  return Promise.all([countPromise, docsPromise])
    .then((values) => {

      const [count, docs] = values;
      const meta = {
        [labelTotal]: count
      };

      let result = {};
  
      // Setting default values
      meta[labelLimit] = limit;
      meta[labelHasMore] = count >= limit + 1;

      // Remove customLabels set to false
      delete meta['false'];

      if (limit == 0) {
        meta[labelLimit] = 0;
      }

      if (labelMeta) {
        result = {
          [labelDocs]: docs,
          [labelMeta]: meta
        };
      } else {
        result = {
          [labelDocs]: docs,
          ...meta
        };
      }

      return isCallbackSpecified ? callback(null, result) : Promise.resolve(result);
    }).catch((error) => {
      return isCallbackSpecified ? callback(error) : Promise.reject(error);
    });
}

/**
 * @param {Schema} schema
 */
module.exports = (schema) => {
  schema.statics.cursor = cursor;
};

module.exports.cursor = cursor;
