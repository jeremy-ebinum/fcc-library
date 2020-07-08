/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const { before } = require("mocha");
const chai = require("chai");

const server = require("../server");
const Book = require("../models/Book");

const { assert } = chai;
const GLOBALS = {};

chai.use(chaiHttp);

suite("Functional Tests", function() {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */

  before(async () => {
    const bookTitles = ["Test Title 1", "Test Title 2", "Test Title 3"];

    const bookPromisesToResolve = bookTitles.map((title) => {
      const newBook = new Book({ title });
      return newBook.save();
    });

    const booksInDb = await Promise.all(bookPromisesToResolve);

    GLOBALS._id = booksInDb[0]._id;
    GLOBALS.oldCommentCount = booksInDb[0].comments.length;
  });

  after((done) => {
    Book.deleteMany({})
      .then(() => done())
      .catch((err) => done(err));
  });

  test("#example Test GET /api/books", function(done) {
    chai
      .request(server)
      .get("/api/books")
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        assert.property(
          res.body[0],
          "commentcount",
          "Books in array should contain commentcount"
        );
        assert.property(
          res.body[0],
          "title",
          "Books in array should contain title"
        );
        assert.property(
          res.body[0],
          "_id",
          "Books in array should contain _id"
        );
        done();
      });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function() {
    suite(
      "POST /api/books with title => create book object/expect book object",
      function() {
        test("Test POST /api/books with title", function(done) {
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "test title" })
            .end((err, res) => {
              GLOBALS._id = res.body._id;

              assert.equal(res.status, 200);
              assert.property(res.body, "_id");
              assert.property(res.body, "title");
              assert.property(res.body, "comments");
              assert.isArray(res.body.comments);
              done();
            });
        });

        test("Test POST /api/books with no title given", function(done) {
          chai
            .request(server)
            .post("/api/books")
            .send({})
            .end((err, res) => {
              assert.equal(res.status, 400);
              assert.propertyVal(res.body, "error", "missing title");
              done();
            });
        });
      }
    );

    suite("GET /api/books => array of books", function() {
      test("Test GET /api/books", function(done) {
        chai
          .request(server)
          .get("/api/books")
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], "commentcount");
            assert.property(res.body[0], "title");
            assert.property(res.body[0], "_id");
            done();
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function() {
      test("Test GET /api/books/[id] with id not in db", function(done) {
        chai
          .request(server)
          .get("/api/books/0123456789ab")
          .end((err, res) => {
            assert.equal(res.status, 404);
            done();
          });
      });

      test("Test GET /api/books/[id] with valid id in db", function(done) {
        chai
          .request(server)
          .get(`/api/books/${GLOBALS._id}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body, "_id");
            assert.property(res.body, "title");
            assert.property(res.body, "comments");
            assert.isArray(res.body.comments);
            done();
          });
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function() {
        test("Test POST /api/books/[id] with comment", function(done) {
          const { _id, oldCommentCount } = GLOBALS;
          const testComment = "spam and eggs is yum";

          chai
            .request(server)
            .post(`/api/books/${_id}`)
            .send({ comment: testComment })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.property(res.body, "_id");
              assert.property(res.body, "title");
              assert.property(res.body, "comments");
              assert.isArray(res.body.comments);
              assert.equal(res.body.comments.length, oldCommentCount + 1);
              assert.equal(res.body.comments.includes(testComment), true);
              done();
            });
        });
      }
    );
  });
});
