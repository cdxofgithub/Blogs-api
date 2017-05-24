var mongoose = require('mongoose');
var Comment = mongoose.model('Comment');
var Article = mongoose.model('Article');
var _ = require('lodash');

exports.addComment = function (req,res) {
	var aid = req.body.aid;
	var content = req.body.content;
	var userId = req.user.id;
	var sendComment;
	var errorMsg;
	if(!aid){
		errorMsg = '缺少必须参数';
	}else if(!content || content == ''){
		errorMsg = "留言内容不能为空";
	}else if(content.length > 500){
		errorMsg = "留言内容过长";
	}
	if(errorMsg){
		return res.status(401).send({errorMsg:errorMsg});
	}
	var data = {
		aid: aid,
		content: content,
		userId: userId
	};
	Comment.createAsync(data).then(function (comment) {
			sendComment = comment;
			return Article.findByIdAndUpdateAsync(aid,{ $inc:{commentCount:1}},{new:true});
	}).then(function (article) {
		return res.status(200).send({
			comment: sendComment,
			commentCount: article.commentCount
		});
	}).catch(function (err) {
		return res.status(401).send();
	})
};

exports.commentList = function (req,res) {
	var aid = req.params.id;
	Comment.find({
		aid: aid,
		status: {$eq: 1}
	}).sort('created')
		.limit(10)
		.populate('userId', 'nickname header')
		.exec()
		.then(function (comment) {
			return res.status(200).send({
				comment: comment
			});
	}).catch(function (err) {
		return res.status(401).send();
	});
};

exports.commentListAll = function (req,res) {
	var aid = req.params.id;
	Comment.find({
		aid: aid,
		status: {$eq: 1}
	}).sort('created')
		.populate('userId', 'nickname header')
		.exec()
		.then(function (comment) {
			return res.status(200).send({
				comment: comment
			});
		}).catch(function (err) {
		return res.status(401).send();
	});
};

exports.delComment = function (req,res) {
	var cid = req.params.id;
	Comment.findByIdAndRemoveAsync(cid).then(function (comment) {
		return Article.findByIdAndUpdateAsync(comment.aid, {$inc: {commentCount: -1}},{new:true});
	}).then(function (article) {
		return res.status(200).send({
			aid: article._id,
			commentCount: article.commentCount
		});
	}).catch(function (err) {
		return res.status(401).send();
	})
};