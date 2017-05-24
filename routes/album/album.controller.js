var mongoose = require('mongoose');
var Album = mongoose.model('Album');
var fs = require('fs');
var	formidable = require('formidable');
var gm = require('gm').subClass({imageMagick: true});
var _ = require('lodash');
var config = require('../../config');

exports.addPhoto = function (req,res) {

	var form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.uploadDir =  __dirname + '/../../public/uploads/album/';
	form.parse(req, function (err, fields, files) {
		if (err) {
			throw err;
		}
		var img = files.photo;
		var path = img.path;
		var type = img.type.split('/')[0];
		if(img.size > 1024*1024) {
			fs.unlink(path, function () {
				return res.send({errorMsg: '图片超出最大限制'});
			});
		}else if(type != 'image' && type != 'application'){
			fs.unlink(path, function() {
				return res.send({errorMsg: '图片不合法'});
			});
		}else {
			console.log('成功进入')
			var urlPath = path.replace(/\\/g, '/');
			console.log(urlPath);
			var photoPath = urlPath.substr(urlPath.lastIndexOf('/'), urlPath.length);
			var url = config.root + '/public/uploads/album' + photoPath;
			//http://localhost:3000/public/uploads/album/upload_5571801264e78e34ab657762a56e0815.png

			gm(urlPath).resize(350, null).write(__dirname + '/../../public/uploads/thumbnail' + photoPath, function (err) {
					if (err) {
						console.log('失败')
						return res.send({errorMsg: '上传图片失败'});
					}
					console.log('成功进入imageMagick')
					var thumbnailUrl = config.root + '/public/uploads/thumbnail' + photoPath;
					var data = {
						userId: req.user.id,
						photo: url,
						thumbnail: thumbnailUrl
					};
					console.log('开始存储')
					Album.createAsync(data).then(function (photo) {
						console.log('存储完毕'+ photo)
						return res.status(200).send({
							photo: photo
						});
					}).catch(function (err) {
						return res.status(401).send({errorMsg: '上传图片失败'});
					});
				});
		}
	});
};

exports.photoList = function (req, res) {
	var time = parseInt(req.params.date);
	var date = new Date(time);
	var condition = {
		status: {$gt: 0},
		created: {$lt: date }
	};
	Album.find(condition, 'userId photo thumbnail created likeCount', {
		sort: {created: -1},
		limit: 20
	}).populate('userId','nickname')
		.exec()
		.then(function (photo) {
		return res.status(200).send({
			photo: photo
		})
	}).catch(function (err) {
		return res.status(401).send();
	});
};

exports.photoUser = function (req, res) {
	var id;
	if(req.user) id = req.user.id;
	var uid = req.params.id;
	var time = parseInt(req.params.date);
	var date = new Date(time);
	var own = id == uid?1:0;
	if(id == uid) own = true;
	var condition = {
		userId: {$eq: uid},
		created: {$lt: date }
	};

	var photoUserList = function (photo) {
		var photosList = [];
		for(var i=0;i<photo.length;i++) {
			var date = getDate(photo[i].created);
			var index = _.findIndex(photosList, {'date': date});

			if (index !== -1) {
				photosList[index].list.push(photo[i])
			} else {
				photosList[photosList.length] = {
					date: date,
					list: [photo[i]]
				}
			}
		}
		return photosList;
	};

	var getDate = function (value) {
		var date = new Date(value);
		return date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日"
	};

	Album.findAsync(condition, 'photo thumbnail created likeCount', {
		sort: {created: -1},
		limit: 20
	}).then(function (photos) {
		var photosList = photoUserList(photos);

		return res.status(200).send({
			own: own,
			photo: photosList
		})
	}).catch(function (err) {
		return res.status(401).send();
	});
};

exports.delPhoto = function (req, res) {
	var id = req.user.id;
	var pid = req.params.id;
	Album.findByIdAsync(pid).then(function (photo) {
		if (photo.userId != id) throw new Error();
		return Album.findByIdAndRemoveAsync(pid)
	}).then(function (photo) {
		return res.status(200).send({photo: photo});
	}).catch(function (err) {
		return res.status(401).send(err);
	});
};

exports.photoLike = function (req, res) {
	var pid = req.params.id;
	var ip = req.ip;

	var getToday = function (value) {
		var date = new Date(value);
		var dateToday = new Date();
		return date.getFullYear() === dateToday.getFullYear() && date.getMonth() === dateToday.getMonth() && date.getDate() === dateToday.getDate();
	};

	Album.findByIdAsync(pid).then(function (photo) {
		var isLiked = _.findIndex(photo.likeToady, {userIp:ip});
		if(isLiked !== -1 && getToday(photo.likeToady[isLiked].date)) {
			throw new Error();
		}else if(isLiked !== -1){
			photo.likeCount += 1;
			photo.likeToady[isLiked].date = new Date();
		}else{
			photo.likeCount += 1;
			photo.likeToady.push({
				userIp: ip,
				date: new Date()
			})
		}
		return photo.saveAsync();
	}).then(function (photo) {
		return res.status(200).send({
			pid: photo._id,
			likeCount: photo.likeCount
		});
	}).catch(function (err) {
		return res.status(401).send({errorMsg: '今天已经点过赞啦'});
	});
};