var _app = require('express')();
var _fs = require('fs');
var _http = require('http').Server(_app);
var _io = require('socket.io')(_http);

//--data
var _adminUserNamesString = process.env['ADMIN_NAMES'] || 'Admin|Other Person';
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
	var _userName;
	console.log('connection');
	//---login
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
		}else{
			_socket.emit('formError', {message: 'Invalid password.'});
		}
	});
	_socket.on('userLogin', function(_data){
		console.log('userLogin event');
		if(!_data.name){
			_socket.emit('formError', {message: 'Name must be set.'});
		}else if(_userPassword && _data.password === _userPassword){
			_userName = _data.name;
			_socket.emit('userLoggedIn');
			_loginType = 'user';
			_approvedMessages.forEach(function(_message){
				_socket.emit('message', _message);
			});
		}else{
			_socket.emit('formError', {message: 'Invalid password.'});
		}
	});
	//---messages
	_socket.on('message', function(_messageValue){
		console.log('message event: ' + _messageValue);
		if(_messageValue.message && _messageValue.message.trim()){
			var _now = new Date();
			var _time = _now.getHours();
			var _amPm = (_time >= 12 ? 'PM' : 'AM');
			if(_time > 12){
				_time = _time - 12;
			}
			var _minutes = _now.getMinutes();
			if(_minutes < 9){
				_minutes = '0' + _minutes.toString();
			}
			_time += ':' + _minutes + ' ' + _amPm;
			console.log('time: ' + _time);
			var _message = {
				name: _messageValue.sender
				,time: _time
				,dateTime: _now
				,type: _loginType
				,value: _messageValue.message
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
	//---settings
	_socket.on('setSettings', function(_newSettings){
		if(_loginType === 'admin'){
			_userPassword = _newSettings.pin;
			_adminUserNames = _newSettings.adminNames.split(',').map(function(_name){ return _name.trim(); });
			_io.emit('setSettings', {
				adminNames: _adminUserNames
			});
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
