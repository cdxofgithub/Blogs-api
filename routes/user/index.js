var express = require("express");
var controller = require('./user.controller');
var expressJwt = require('express-jwt');
var config = require('../../config');

var router = express.Router();

router.post('/addUser', controller.addUser);
router.get('/authInfo', expressJwt({ secret: config.session.secrets }), controller.authInfo);
module.exports = router;