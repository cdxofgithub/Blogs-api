var express = require('express');
var controller = require('./comment.controller');
var expressJwt = require('express-jwt');
var config = require('../../config');

var router = express.Router();

router.delete('/:id', expressJwt({secret: config.session.secrets}), controller.delComment);
router.post('/addComment',expressJwt({secret: config.session.secrets}), controller.addComment);
router.get('/:id/commentList', controller.commentList);
router.get('/:id/commentListAll', controller.commentListAll);
router.delete('/:id', expressJwt({secret: config.session.secrets}), controller.delComment);

module.exports = router;