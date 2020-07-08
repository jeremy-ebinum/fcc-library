/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

const mongoose = require("mongoose");
const Book = require("../models/Book");
const { BadRequest } = require("../utils/errors");

const { MONGODB_URI } = process.env;

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to DB");

    // Book.deleteMany().then(() => console.log("Resetting DB..."));
  })
  .catch((err) => {
    console.error(err);
  });

mongoose.connection.on("error", (err) => {
  console.err(err);
});

module.exports = function(app) {
  app
    .route("/api/books")
    .get(async (req, res) => {
      // response will be array of book objects
      // json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      const books = await Book.find({});
      const booksWithComments = books.map((book) => {
        return {
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length,
        };
      });

      res.json(booksWithComments);
    })

    .post(async (req, res, next) => {
      const { title } = req.body;
      // response will contain new book object including atleast _id and title

      try {
        if (!title) throw new BadRequest("missing title");

        const newBook = new Book({ title });
        const savedBook = await newBook.save();

        res.json(savedBook.toJSON());
      } catch (err) {
        next(err);
      }
    })

    .delete((req, res, next) => {
      // if successful response will be 'complete delete successful'
      Book.deleteMany({})
        .then(() => {
          res.send("complete delete successful");
        })
        .catch((err) => next(err));
    });

  app
    .route("/api/books/:id")
    .get(async (req, res, next) => {
      const bookid = req.params.id;
      // json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      try {
        if (!bookid) throw new BadRequest("missing id");

        const book = await Book.findById(bookid);

        if (book) res.json(book.toJSON());
        else res.status(404).send("no book exists");
      } catch (err) {
        next(err);
      }
    })

    .post(async (req, res, next) => {
      const bookid = req.params.id;
      const { comment } = req.body;
      // json res format same as .get

      try {
        if (!bookid) throw new BadRequest("missing id");
        if (!comment) throw new BadRequest("missing comment");

        const book = await Book.findById(bookid);

        if (book) {
          book.comments.push(comment);
          const updatedBook = await book.save();
          res.json(updatedBook.toJSON());
        } else {
          res.stauts(404).send("no book exists");
        }
      } catch (err) {
        next(err);
      }
    })

    .delete(async (req, res, next) => {
      const bookid = req.params.id;
      // if successful response will be 'delete successful'
      try {
        if (!bookid) throw new BadRequest("missing id");

        const book = await Book.findById(bookid);

        if (book) {
          await book.remove();
          res.send("delete successful");
        } else {
          res.status(404).send("no book exists");
        }
      } catch (err) {
        next(err);
      }
    });
};
