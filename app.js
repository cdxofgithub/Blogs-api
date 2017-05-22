var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/dairy');
var modelsPath = path.join(__dirname, 'models');
fs.readdirSync(modelsPath).forEach(function (file) {
  if (/(.*)\.(js$|coffee$)/.test(file)) {
    require(modelsPath + '/' + file);
  }
});

var routes = require('./routes/index');

var accessLog = fs.createWriteStream('access.log', { flags: 'a' });
var errorLog = fs.createWriteStream('error.log', { flags: 'a' });

var app = express();

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use(morgan({ stream: accessLog }));

app.use('/public', express.static(path.join(__dirname, 'public')));

routes(app);

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
