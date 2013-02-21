/**
 * Module dependencies.
 */

var express = require('express')
	, routes = require('./routes')
	, user = require('./routes/user')
	, http = require('http')
	, path = require('path')
	, NUbugger = require('./NUbugger');

var app = express();
var server = http.createServer(app);

app.configure(function () {
	
	app.set('port', 9090);
	//app.set('views', __dirname + '/views');
	//app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.compress());
	app.use(express.static(path.join(__dirname, 'public')));
	
});

//app.configure('development', function () {
//	
//	app.use(express.errorHandler());
//	
//});

//app.get('/', routes.index);
//app.get('/users', user.list);

server.listen(app.get('port'), function () {
	
	console.log("Express server listening on port " + app.get('port'));
	
});

io = require('socket.io').listen(server);
io.set('log level', 1);

var nubugger = new NUbugger(io);
