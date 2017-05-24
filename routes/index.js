var path = require('path');

module.exports = function(app) {
    app.all('*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "http://localhost:8080");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        res.header("Access-Control-Allow-Methods","POST,GET,PUT,DELETE,OPTIONS");
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("X-Powered-By",' 3.2.1');
        res.header("Content-Type", "application/json;charset=utf-8");
        next();
    });

    app.use('/auth', require('./auth/index'));

    app.use('/user', require('./user/index'));

    app.use('/article', require('./article/index'));

    app.use('/comment', require('./comment/index'));

    app.use('/album', require('./album/index'));

    app.use('/*', function (req,res,next) {
        return res.json({status:'success',data:'复制黏贴 一把梭'});
    })
};