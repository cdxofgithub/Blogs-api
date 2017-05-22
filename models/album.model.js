var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AlbumSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  photo: String,
  thumbnail: String,
  name: String,
  likeCount: { type: Number, default: 0 },
  likeToady: [{
    userIp: String,
    date: { type: Date, default: Date.now }
  }],
  status: { type: Number, default: 1 },
  created: { type: Date, default: Date.now }
});

var Album = mongoose.model('Album', AlbumSchema);

var Promise = require('bluebird');
Promise.promisifyAll(Album);
Promise.promisifyAll(Album.prototype);

module.exports = Album;