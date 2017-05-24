var express = require("express");
var controller = require('./article.controller');
var expressJwt = require('express-jwt');
var config = require('../../config');

var router = express.Router();

router.post('/addArticle', expressJwt({secret: config.session.secrets}), controller.addArticle);
router.post('/upload', expressJwt({secret: config.session.secrets}), controller.upload);
router.get('/tags', controller.tags);
router.get('/:id/articlePage', expressJwt({secret: config.session.secrets,credentialsRequired:false}), controller.articlePage);
router.get('/articleList/:date', controller.articleList);
router.get('/:id/:date', expressJwt({secret: config.session.secrets,credentialsRequired:false}), controller.articleUser);
router.get('/:id/:date/articleTogether', expressJwt({secret: config.session.secrets,credentialsRequired:false}), controller.articleTogether);
router.put('/:id/articleCollect', expressJwt({secret: config.session.secrets}), controller.articleCollect);
router.put('/:id/editArticle', expressJwt({secret: config.session.secrets}), controller.editArticle);
router.put('/:id/articleStatus', expressJwt({secret: config.session.secrets}), controller.articleStatus);
router.delete('/:id', expressJwt({secret: config.session.secrets}), controller.delArticle);

module.exports = router;