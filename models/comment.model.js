var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
  aid: {
    type: Schema.Types.ObjectId,
    ref: 'Article'
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  content: String,
  status: { type: Number, default: 1 },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

var Comment = mongoose.model('Comment', CommentSchema);

var Promise = require('bluebird');
Promise.promisifyAll(Comment);
Promise.promisifyAll(Comment.prototype);

module.exports = Comment;