// 'use strict';

let mongoose = require('mongoose');
let expect = require('chai').expect;
let mongoosePaginate = require('../dist/index');

let MONGO_URI = 'mongodb://localhost/mongoose_cursor_test';

let AuthorSchema = new mongoose.Schema({
  name: String
});
let Author = mongoose.model('Author', AuthorSchema);

let BookSchema = new mongoose.Schema({
  uuid: {
    unique: true,
    type: String
  },
  title: String,
  date: Date,
  price: Number,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'Author'
  },
  loc: Object
});

BookSchema.index({
  loc: "2dsphere"
});

BookSchema.plugin(mongoosePaginate);

let Book = mongoose.model('Book', BookSchema);

describe('mongoose-cursor', function () {

  before(function (done) {
    mongoose.connect(MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    }, done);
  });

  before(function (done) {
    mongoose.connection.db.dropDatabase(done);
  });

  before(function () {
    let book, books = [];
    let date = new Date();

    return Author.create({
      name: 'Arthur Conan Doyle'
    }).then(function (author) {
      for (let i = 1; i <= 100; i++) {
        book = new Book({
          // price: Math.floor(Math.random() * (1000 - 50) ) + 50,
          uuid: `${i}`,
          price: (i * 5) + i,
          title: 'Book #' + i,
          date: new Date(date.getTime() + i),
          author: author._id,
          loc: {
            type: "Point",
            coordinates: [-10.97, 20.77]
          },
        });
        books.push(book);
      }

      return Book.create(books);
    });

  });

  afterEach(function () {

  });

  it('promise return test', function () {

    let promise = Book.cursor();
    expect(promise.then).to.be.an.instanceof(Function);
  });

  it('callback test', function (done) {
    Book.cursor({}, {}, function (err, result) {
      expect(err).to.be.null;
      expect(result).to.be.an.instanceOf(Object);
      done();
    });
  });

  it('with limit', function () {
    var query = {
      title: {
        $in: [/Book/i]
      }
    };

    var options = {
      limit: 10
    };

    return Book.cursor(query, options).then((result) => {
      expect(result.docs).to.have.length(11);
      expect(result.totalDocs).to.equal(100);
      expect(result.limit).to.equal(10);
    });
  });
 
  it('with startingAfter and limit', function() {
    var query = {
      title: {
        $in: [/Book/i],
      },
    };

    var options = {
      key: 'uuid',
      startingAfter: '1',
      limit: 10,
    };

    return Book.cursor(query, options).then(result => {
      expect(result.docs).to.have.length(11);
      expect(result.totalDocs).to.equal(100);
      expect(result.limit).to.equal(10);
    });
  });
  
  it('with endingBefore and limit', function() {
    var query = {
      title: {
        $in: [/Book/i],
      },
    };

    var options = {
      key: 'uuid',
      endingBefore: '1',
      limit: 10,
    };

    return Book.cursor(query, options).then(result => {
      expect(result.docs).to.have.length(11);
      expect(result.totalDocs).to.equal(100);
      expect(result.limit).to.equal(10);
    });
  });

  it('with startingAfter, endingBefore and limit', function() {
    var query = {
      title: {
        $in: [/Book/i],
      },
    };

    var options = {
      key: 'uuid',
      startingAfter: '15',
      endingBefore: '20',
      limit: 10,
    };

    return Book.cursor(query, options).then(result => {
      expect(result.docs).to.have.length(11);
      expect(result.totalDocs).to.equal(100);
      expect(result.limit).to.equal(10);
    });
  });

  // it('with empty custom labels', function () {
  //   var query = {
  //     title: {
  //       $in: [/Book/i]
  //     }
  //   };

  //   const myCustomLabels = {
  //     nextPage: false,
  //     prevPage: '',
  //   };

  //   var options = {
  //     sort: {
  //       _id: 1
  //     },
  //     limit: 10,
  //     page: 5,
  //     select: {
  //       title: 1,
  //       price: 1
  //     },
  //     customLabels: myCustomLabels
  //   };
  //   return Book.cursor(query, options).then((result) => {

  //     expect(result.docs).to.have.length(10);
  //     expect(result.docs[0].title).to.equal('Book #41');
  //     expect(result.totalDocs).to.equal(100);
  //     expect(result.limit).to.equal(10);
  //   });
  // });

  // it('with custom labels', function () {
  //   var query = {
  //     title: {
  //       $in: [/Book/i]
  //     }
  //   };

  //   const myCustomLabels = {
  //     totalDocs: 'itemCount',
  //     docs: 'itemsList',
  //     limit: 'limit',
  //   };

  //   var options = {
  //     sort: {
  //       _id: 1
  //     },
  //     limit: 10,
  //     page: 5,
  //     select: {
  //       title: 1,
  //       price: 1
  //     },
  //     customLabels: myCustomLabels
  //   };
  //   return Book.cursor(query, options).then((result) => {
  //     expect(result.itemsList).to.have.length(10);
  //     expect(result.itemsList[0].title).to.equal('Book #41');
  //     expect(result.itemCount).to.equal(100);
  //     expect(result.limit).to.equal(10);
  //   });
  // });

  // it('with custom Meta label', function () {
  //   var query = {
  //     title: {
  //       $in: [/Book/i]
  //     }
  //   };

  //   const myCustomLabels = {
  //     meta: 'meta',
  //     docs: 'itemsList',
  //     totalDocs: 'total'
  //   };

  //   var options = {
  //     sort: {
  //       _id: 1
  //     },
  //     limit: 10,
  //     page: 5,
  //     select: {
  //       title: 1,
  //       price: 1
  //     },
  //     customLabels: myCustomLabels
  //   };
  //   return Book.cursor(query, options).then((result) => {
  //     expect(result.itemsList).to.have.length(10);
  //     expect(result.itemsList[0].title).to.equal('Book #41');
  //     expect(result.meta).to.be.an.instanceOf(Object);
  //     expect(result.meta.total).to.equal(100);
  //   });
  // });

  // it('2dsphere', function () {
  //   var query = {
  //     loc: {
  //       $nearSphere: 
  //         [ 50, 50 ]
        
  //     }
  //   };

  //   const myCustomLabels = {
  //     meta: 'meta',
  //     docs: 'itemsList',
  //     totalDocs: 'total'
  //   };

  //   var options = {
  //     sort: {
  //       _id: 1
  //     },
  //     limit: 10,
  //     page: 5,
  //     select: {
  //       title: 1,
  //       price: 1
  //     },
	//     forceCountFn: true,
  //     customLabels: myCustomLabels
  //   };
  //   return Book.cursor(query, options).then((result) => {
  //     expect(result.meta.total).to.equal(100);
  //   });
  // });

  // it('all data (without pagination)', function () {
  //   var query = {
  //     title: {
  //       $in: [/Book/i]
  //     }
  //   };

  //   var options = {
  //     pagination: false
  //   };

  //   return Book.cursor(query, options).then((result) => {
  //     expect(result.docs).to.have.length(100);
  //     expect(result.totalDocs).to.equal(100);
  //     expect(result.limit).to.equal(100);

  //   });
  // });

  after(function (done) {
    mongoose.connection.db.dropDatabase(done);
  });

  after(function (done) {
    mongoose.disconnect(done);
  });

});
