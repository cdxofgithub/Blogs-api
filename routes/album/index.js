var express = require("express");
var controller = require('./album.controller');
var expressJwt = require('express-jwt');
var config = require('../../config');

var router = express.Router();

router.post('/addPhoto', expressJwt({secret: config.session.secrets}), controller.addPhoto);
router.get('/photoList/:date', controller.photoList);
router.get('/:id/:date/photoUser', expressJwt({secret: config.session.secrets,credentialsRequired:false}), controller.photoUser);
router.delete('/:id', expressJwt({secret: config.session.secrets}), controller.delPhoto);
router.put('/:id/photoLike', controller.photoLike);

module.exports = router;