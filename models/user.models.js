var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var userSchema = new Schema({
  nickname: String,
  email: { type: String, lowercase: true },
  provider: { type: String, default: 'local' },
  github: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  weibo: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  hashedPassword: String,
  salt: String,
  role: { type: String, default: 'user' },
  status: { type: Number, default: 0 },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  header: { type: String, default: '/static/img/header.jpg' },
  sex: { type: Number, default: 1, min: 1, max: 2 },
  showEmail: { type: Number, default: 1 },
  birthday: {
    month: { type: Number, default: 0, min: 0, max: 12 },
    day: { type: Number, default: 0, min: 0, max: 31 }
  },
  blood: { type: Number, default: 0 },
  summary: String,
  url: String,
  qqnumber: String,
  collectList: [{
    type: Schema.Types.ObjectId,
    ref: 'Article'
  }],
  friend: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
});

userSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });


userSchema
  .virtual('authInfo')
  .get(function () {
    return {
      'id': this._id,
      'nickname': this.nickname,
      'provider': this.provider,
      'role': this.role,
      'header': this.header
    };
  });

userSchema
  .virtual('userInfo')
  .get(function () {
    return {
      'id': this._id,
      'nickname': this.nickname,
      'header': this.header,
      'sex': this.sex,
      'email': this.email,
      'showEmail': this.showEmail,
      'birthdayMonth': this.birthday.month,
      'birthdayDay': this.birthday.day,
      'blood': this.blood,
      'summary': this.summary,
      'url': this.url,
      'qqnumber': this.qqnumber,
      'created': this.created
    };
  });

userSchema
  .virtual('providerInfo')
  .get(function () {
    return {
      'github': this.github,
      'weibo': this.weibo
    };
  });

userSchema
  .virtual('token')
  .get(function () {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

userSchema
  .path('nickname')
  .validate(function (value, respond) {
    var self = this;
    this.constructor.findOne({ nickname: value }, function (err, user) {
      if (err) return err;
      if (user) {
        if (self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
  }, '呢称已经被使用');

userSchema
  .path('email')
  .validate(function (value, respond) {
    var self = this;
    this.constructor.findOne({ email: value }, function (err, user) {
      if (err) return err;
      if (user) {
        if (self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
  }, '邮箱已经被使用');

userSchema.methods = {
  //检查用户权限
  hasRole: function (role) {
    var selfRoles = this.role;
    return (selfRoles.indexOf('admin') !== -1 || selfRoles.indexOf(role) !== -1);
  },
  //验证用户密码
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },
  //生成盐
  makeSalt: function () {
    return crypto.randomBytes(16).toString('base64');
  },
  //生成密码
  encryptPassword: function (password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha1').toString('base64');
  }
};

userSchema.set('toObject', { virtuals: true });

var User = mongoose.model('User', userSchema);

var Promise = require('bluebird');
Promise.promisifyAll(User);
Promise.promisifyAll(User.prototype);

module.exports = User;

