var express = require('express');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router.post('/', function (req,res,next) {
    var errorMsg;
    if(req.body.email === '' || req.body.password === ''){
        errorMsg = "用户名和密码不能为空";
    }
    if(errorMsg){
        return res.status(401).send({errorMsg:errorMsg});
    }else{
        next();
    }

},function(req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err){
            return res.status(401).send();
        }
        if(info){
            return res.status(403).send(info);
        }
        var token = auth.signToken(user._id);
        return res.json({
            token: token,
        });
    })(req, res, next)
});

module.exports = router;