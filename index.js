var _app = require('express')();
var _fs = require('fs');
var _http = require('http').Server(_app);
var _io = require('socket.io')(_http);

//--data
var _adminUserNamesString = process.env['ADMIN_NAMES'] || 'Admin';
var _adminUserNames = _adminUserNamesString.split('|');
var _approvedMessages = [];
var _users = [];
var _userMessages = [];
var _adminPassword = process.env['ADMIN_PASSWORD'] || '123456';
var _adminUsers = [];
var _userPassword = process.env['USER_PASSWORD'] || '1234';

//--sockets
_io.on('connection', function(_socket){
	var _loginType;
	console.log('connection');
	_socket.on('adminLogin', function(_password){
		console.log('adminLogin event');
		if(_password === _adminPassword){
			_adminUsers.push(_socket);
			_socket.emit('adminLoggedIn');
			_loginType = 'admin';
			_approvedMessages.forEach(function(_message){
				_socket.emit('message', _message);
			});
			_userMessages.forEach(function(_message){
				_socket.emit('message', _message);
			});
		}
	});
	_socket.on('userLogin', function(_password){
		console.log('userLogin event');
		if(_userPassword && _password === _userPassword){
			_socket.emit('userLoggedIn');
			_loginType = 'user';
			_approvedMessages.forEach(function(_message){
				_socket.emit('message', _message);
			});
		}
	});
	_socket.on('message', function(_messageValue){
		console.log('message event: ' + _messageValue);
		if(_messageValue){
			var _message = {
				type: _loginType
				,value: _messageValue
			};
			if(_loginType === 'admin'){
				console.log('publicMessage received: ' + _messageValue);
				if(_adminUsers.indexOf(_socket) !== -1){
					console.log('publicMessage broadcast: ' + _messageValue);
					_approvedMessages.push(_message);
					_io.emit('message', _message);
					console.log('admin message received');
				}
			}else if(_loginType === 'user'){
				_userMessages.push(_message);
				console.log('message received: ' + _message.value);
				_socket.emit('message', _message);
				_adminUsers.forEach(function(_adminUser){
					_adminUser.emit('message', _message);
				});
			}
		}
	});
});
_http.listen(8021, function(){
	console.log('listening localhost:8021');
});

//--routing
_app.get('/', function(_request, _response){
	_response.sendFile(__dirname + '/index.html');
});
_app.get('/admin', function(_request, _response){
	const output = _fs.readFileSync(__dirname + '/admin.html').toString().replace('ADMIN_NAMES', _adminUserNamesString);
	_response.send(output);
});
//---assets
_app.get('/admin.css', function(_request, _response){
	_response.sendFile(__dirname + '/admin.css');
});
_app.get('/admin.js', function(_request, _response){
	_response.sendFile(__dirname + '/admin.js');
});
_app.get('/jquery.js', function(_request, _response){
	_response.sendFile(__dirname + '/node_modules/jquery/dist/jquery.js');
});
_app.get('/scripts.js', function(_request, _response){
	_response.sendFile(__dirname + '/scripts.js');
});
_app.get('/styles.css', function(_request, _response){
	_response.sendFile(__dirname + '/styles.css');
});
