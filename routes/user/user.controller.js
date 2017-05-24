var mongoose = require('mongoose');
var User = mongoose.model('User');
var Article = mongoose.model('Article');
var Comment = mongoose.model('Comment');
var Album = mongoose.model('Album');
var config = require('../../config');
var auth = require('../auth/auth.service');
var fs = require('fs');
var	formidable = require('formidable');
var _ = require('lodash');
var config = require('../../config');

exports.addUser = function (req,res) {
	var nickname = req.body.nickname ? req.body.nickname.replace(/(^\s+)|(\s+$)/g, "") : '';
	var email = req.body.email ? req.body.email.replace(/(^\s+)|(\s+$)/g, "") : '';
	var password = req.body.password;
	var passwordRepeat = req.body.passwordRepeat;
	var NICKNAME_REGEXP = /^[(\u4e00-\u9fa5)0-9a-zA-Z\_\s@]+$/;
	var EMAIL_REGEXP = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
	var errorMsg;
	if (nickname === '') {
		errorMsg = "昵称不能为空";
	} else if (email === '') {
		errorMsg = "邮箱地址不能为空";
	} else if (nickname.length <= 3 || nickname.length > 9 || !NICKNAME_REGEXP.test(nickname)) {
		//不符合呢称规定.
		errorMsg = "呢称不合法";
	} else if (email.length <= 4 || email.length > 30 || !EMAIL_REGEXP.test(email)) {
		errorMsg = "邮箱地址不合法";
	} else if (password.length <= 5 || password.length > 15) {
		errorMsg = "密码不合法";
	} else if (password !== passwordRepeat) {
		errorMsg = "两次输入的密码不一致";
	}
	if (errorMsg) {
		return res.status(401).send({errorMsg: errorMsg});
	}

	var newUser = new User(req.body);
	newUser.role = 'user';

	newUser.saveAsync().then(function (user) {
		var token = auth.signToken(user._id);
		return res.status(200).send({
			token: token
		});
	}).catch(function (err) {
		if (err.errors && err.errors.nickname) {
			err = {errorMsg: err.errors.nickname.message}
		}
		if (err.errors && err.errors.email) {
			err = {errorMsg: err.errors.email.message}
		}
		return res.status(401).send(err);
	});
};

exports.authInfo = function (req,res) {
	var id = req.user.id;
	var data;
	User.findByIdAsync(id).then(function (user) {
		data = user.toObject();
		return Article.countAsync({authId: data._id})
	}).then(function (articleCount) {
		data.authInfo.articleCount = articleCount;
		data.authInfo.collectCount = data.collectList.length;
		return Album.countAsync({userId: data._id})
	}).then(function (photoCount) {
		data.authInfo.photoCount = photoCount;
		var token = auth.signToken(data._id);
		return res.status(200).send({
			token: token,
			authInfo: data.authInfo
		});
	}).catch(function (err) {
		return res.status(401).send();
	});
};

exports.header = function (req,res) {
	var form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.uploadDir = __dirname + '/../../public/uploads/head/';
	form.parse(req, function (err, fields, files) {
		if (err) {
			throw err;
		}

		var img = files.img;
		var path = img.path;
		var type = img.type.split('/')[0];
		if(img.size > 1024*1024) {
			fs.unlink(path, function () {
				return res.send({"error":0});
			});
		}else if(type != 'image' && type != 'application'){
			fs.unlink(path, function() {
				return res.send({"error":0});
			});
		}else{
			var urlPath = path.replace(/\\/g, '/');
			var url = config.root + '/public/uploads/head' + urlPath.substr(urlPath.lastIndexOf('/'), urlPath.length);
			var info = {
				"error": 0,
				"url" :url
			};
			
			var id = req.user.id;
			User.findByIdAsync(id).then(function (user) {
				user.header = url;
				return user.saveAsync()
			}).then(function () {
				return res.status(200).send({
					"url" :url
				});
			}).catch(function (err) {
				return res.status(401).send(err);
			});
		}
	});
};

exports.userInfo = function (req,res) {
	var uid = req.params.id;
	var id;
	var data;
	var own = false;
	if (req.user) {
		id = req.user.id;
	}
	User.findById(uid)
		.populate('friend','nickname header')
		.exec()
		.then(function (user) {
		data = user.toObject();
		data.userInfo.friend = user.friend;
		if (id == data._id) own = true;
		return Article.count({authId: data._id})
	}).then(function (articleCount) {
		data.userInfo.articleCount = articleCount;
		data.userInfo.collectCount = data.collectList.length;
		return Album.countAsync({userId: data._id})
	}).then(function (photoCount) {
		data.userInfo.photoCount = photoCount;
		return res.status(200).send({
			own: own,
			userInfo: data.userInfo
		});
	}).catch(function (err) {
		return res.status(401).send();
	});
};

exports.userSet = function (req,res) {
	var id = req.user.id;
	User.findByIdAsync(id).then(function (user) {
		var own = true;
		return res.status(200).send({
			own: own,
			userInfo: user.userInfo
		});
	}).catch(function (err) {
		return res.status(401).send();
	});
};

exports.updateUser = function (req, res) {
	var id = req.user.id;
	var errorMsg;
	var NICKNAME_REGEXP = /^[(\u4e00-\u9fa5)0-9a-zA-Z\_\s@]+$/;
	var QQ_REGEXP = /^\+?[1-9][0-9]*$/;
	if (req.body.nickname) {
		var nickname = req.body.nickname ? req.body.nickname.replace(/(^\s+)|(\s+$)/g, "") : '';
		if (nickname === '') {
			errorMsg = "昵称不能为空";
		} else if (nickname.length <= 3 || nickname.length > 9 || !NICKNAME_REGEXP.test(nickname)) {
			errorMsg = "呢称不合法";
		}
	}
	if (req.body.summary && req.body.summary.length > 20) {
		errorMsg = "简介过长";
	} else if (req.body.url && req.body.url.length > 20) {
		errorMsg = "微博地址过长";
	} else if (req.body.qqnumber && (req.body.qqnumber.length > 12 || !QQ_REGEXP.test(req.body.qqnumber))) {
		errorMsg = "QQ号码不合法";
	}
	if (errorMsg) {
		return res.status(401).send({errorMsg: errorMsg});
	}
	User.findByIdAsync(id).then(function (user) {
		_.assign(user, req.body);
		if (req.body.birthdayMonth) user.birthday.month = req.body.birthdayMonth;
		if (req.body.birthdayDay) user.birthday.day = req.body.birthdayDay;
		user.updated = new Date();
		return user.saveAsync()
	}).then(function (user) {
		return res.status(200).send({
			userInfo: user.userInfo
		})
	}).catch(function (err) {
		if (err.errors && err.errors.nickname) {
			err = {errorMsg: err.errors.nickname.message}
		}
		return res.status(401).send(err);
	})
};

exports.updatePassword = function (req,res) {
	var id = req.user.id;
	var errorMsg;

	var password = req.body.password;
	var passwordRepeat = req.body.passwordRepeat;
	if (password.length <= 5 || password.length > 15) {
		errorMsg = "密码不合法";
	} else if (password !== passwordRepeat) {
		errorMsg = "两次输入的密码不一致";
	}
	if (errorMsg) {
		return res.status(401).send({errorMsg: errorMsg});
	}

	User.findByIdAsync(id).then(function (user) {
		user.password = password;
		return user.saveAsync()
	}).then(function () {
		return res.status(200).send({
			success: 'true'
		});
	}).catch(function (err) {
		return res.status(401).send(err);
	});
};