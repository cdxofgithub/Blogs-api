var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var User = mongoose.model('User');

var  signToken = function(id) {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign({
        id: id ,
        exp:parseInt(expiry.getTime()/1000)
    }, config.session.secrets );
};

exports.signToken = signToken;