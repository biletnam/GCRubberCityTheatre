jQuery(function(){
	var _socket = io();
	var _app = jQuery('.app');
	var _messageListEl;

	//--controller
	var showLoginView = function(){
		_app.html(
			'<form class="loginForm">'
				+ '<input class="passwordField" name="password" autocomplete="off" autofocus="autofocus" type="password" /><button>Log In</button>'
			+ '</form>'
		);
		var _loginForm = _app.find('.loginForm');
		_loginForm.on('submit', function(){
			_socket.emit('userLogin', _loginForm.find('.passwordField').val());
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
			var _message = _messageEl.val();
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
		var _liEl = jQuery('<li>', {'data-type': _message.type});
		switch(_message.type){
			case 'user':
				_messageListEl.append(_liEl.text(_message.value));
			break;
			case 'admin':
				_messageListEl.append(_liEl.text(_message.value));
			break;
		}
	});
	_socket.on('reconnect', function(){
		showLoginView();
	});
	_socket.on('userLoggedIn', function(){
		showMessageView();
	});
});
