var express = require('express');
var passport = require('passport');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var auth = require('./auth.service');

require('./local/passport').setup(User);

var router = express.Router();

router.use('/local', require('./local'));

module.exports = router;