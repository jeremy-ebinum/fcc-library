const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  comments: [String],
});

bookSchema.set("toJSON", {
  transform: (doc, obj) => {
    delete obj.__v;
    return obj;
  },
});

module.exports = mongoose.model("Book", bookSchema);
