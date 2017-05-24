var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

exports.setup = function (User) {
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function(email, password, done) {
            User.findOne({
                email: email.toLowerCase()
            }, function(err, user) {
                if (err) return done(err);
                if (!user) {
                    return done(null, false, { errorMsg: '用户名或密码错误' });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, { errorMsg: '用户名或密码错误' });
                }

                if(user.status === 2){
                    return done(null, false, { errorMsg: '用户被阻止登录' });
                }
                /*if(user.status === 0){
                    return done(null, false, { errorMsg: '用户未验证.' });
                }*/
                return done(null, user);
            });
        }
    ));
};