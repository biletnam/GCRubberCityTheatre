jQuery(function(){
	var _socket = io();
	var _app = jQuery('.app');
	var _messageListEl;
	var _userName;

	//--controller
	var showLoginView = function(){
		_app.html(
			'<form class="loginForm">'
				+ '<label for="nameField">Name</label>'
				+ '<input class="nameField" id="nameField" name="name" />'
				+ '<label for="passwordField">Password</label>'
				+ '<input class="passwordField" id="passwordField" name="password" type="password" />'
				+ '<button>Log In</button>'
			+ '</form>'
		);
		var _loginForm = _app.find('.loginForm');
		_loginForm.on('submit', function(){
			_userName = _loginForm.find('.nameField').val();
			_socket.emit('userLogin', {
				'name': _userName
				,password: _loginForm.find('.passwordField').val()
			});
			return false;
		});
	};
	var showMessageView = function(){
		_app.html(
			'<ul class="messagesList"></ul>'
			+ '<form class="messageForm">'
				+ '<input class="messageField" name="message" autocomplete="off" autofocus="autofocus" required="required" /><button>Send</button>'
			+ '</form>'
		);
		var _formEl = _app.find('.messageForm');
		var _messageEl = _formEl.find('.messageField');
		_messageListEl = _app.find('.messagesList');
		_formEl.on('submit', function(){
			var _message = {
				message: _messageEl.val(),
				sender: _userName
			};
			if(_message){
				_socket.emit('message', _message);
				_messageEl.val('');
			}
			return false;
		});
	}

	//--routing
	showLoginView();
	_socket.on('message', function(_message){
		console.log('message: ' + _message);
		var _liEl = jQuery(`<li>${_message.name}`, {'data-type': _message.type});
		switch(_message.type){
			case 'user':
				_messageListEl.append(_liEl.text(`${_message.name}: ${_message.value}`));
			break;
			case 'admin':
				_messageListEl.append(_liEl.text(`${_message.name}: ${_message.value}`));
			break;
		}
	});
	_socket.on('formError', function(_error){
		var _formEl = _app.find('form');
		if(_formEl.length){
			var _formErrorEl = _formEl.find('.error');
			if(!_formErrorEl.length){
				_formErrorEl = jQuery('<div class="error">');
				_formEl.prepend(_formErrorEl);
			}
			_formErrorEl.html(_error.message);
		}
	});
	_socket.on('reconnect', function(){
		showLoginView();
	});
	_socket.on('userLoggedIn', function(){
		showMessageView();
	});
});
