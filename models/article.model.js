var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleSchema = new Schema({
  authId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  title: String,
  content: String,
  image: { type: String, default: '/static/img/logo.jpg' },
  tag: String,
  weather: String,
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  status: { type: Number, default: 1 },
  commentCount: { type: Number, default: 0 },
  collectCount: { type: Number, default: 0 },
  pv: { type: Number, default: 0 }
});

var Article = mongoose.model('Article', articleSchema);

var Promise = require('bluebird');
Promise.promisifyAll(Article);
Promise.promisifyAll(Article.prototype);

module.exports = Article;