var express = require("express");
var controller = require('./user.controller');
var expressJwt = require('express-jwt');
var config = require('../../config');

var router = express.Router();

router.post('/addUser', controller.addUser);
router.get('/authInfo', expressJwt({secret: config.session.secrets}), controller.authInfo);
router.get('/set', expressJwt({secret: config.session.secrets}),  controller.userSet);
router.get('/:id/userInfo', expressJwt({secret: config.session.secrets,credentialsRequired:false}), controller.userInfo);
router.post('/header', expressJwt({secret: config.session.secrets}), controller.header);
router.put('/updateUser', expressJwt({secret: config.session.secrets}), controller.updateUser);
router.put('/updatePassword', expressJwt({secret: config.session.secrets}), controller.updatePassword);

module.exports = router;