jQuery(function(){
	var _socket = io();
	var _app = jQuery('.app');
	var _currentMessages;
	var _loggedIn = false;
	_app.html(
		'<header class="appHeader"><nav>'
			+ '<button class="messagesNavAction">Messages</button>'
			+ '<button class="settingsNavAction">Settings</button>'
		+ '</nav></header>'
		+ '<main class="appMain"><span class="loading">Loading…</span></main>'
	);
	var _appMain = _app.find('.appMain');
	var _messageListEl;

	//--controller
	var _setMainContent = function(_mainContent){
		if(_messageListEl && _messageListEl.html()){
			_currentMessages = _messageListEl.html();
		}
		_appMain.html(_mainContent);
	};
	var showLoginView = function(){
		_currentMessages = undefined;
		_setMainContent(
			'<form class="loginForm">'
				+ '<input class="passwordField" name="password" autocomplete="off" autofocus="autofocus" type="password" /><button>Log In</button>'
			+ '</form>'
		);
		var _loginForm = _app.find('.loginForm');
		_loginForm.on('submit', function(){
			_socket.emit('adminLogin', _loginForm.find('.passwordField').val());
			return false;
		});
	};
	var showMessageView = function(){
		console.log('_currentMessages', _currentMessages);
		_setMainContent(
			'<ul class="messagesList"></ul>'
			+ '<form class="messageForm">'
				+ '<input class="messageField" name="message" autocomplete="off" autofocus="autofocus" required="required" /><button>Send</button>'
			+ '</form>'
		);
		var _formEl = _app.find('.messageForm');
		var _messageEl = _formEl.find('.messageField');
		_messageListEl = _app.find('.messagesList');
		if(_currentMessages){
			_messageListEl.html(_currentMessages);
		}
		_formEl.on('submit', function(){
			var _message = _messageEl.val();
			if(_message){
				_socket.emit('message', _message);
				_messageEl.val('');
			}
			return false;
		});
	};
	var showSettingsView = function(){
		_setMainContent(
			'<form class="settingsForm">'
				+ '<input class="pinField" name="pin" autocomplete="off" autofocus="autofocus" required="required" />'
				+ '<button>Save</button>'
			+ '</form>'
		);
		var _form = _app.find('.settingsForm');
		_form.on('submit', function(){
			_socket.emit('setSettings', {
				'pin': _form.find('.pinField').val()
			});
			return false;
		});
	};

	//--routing
	showLoginView();
	//---buttons
	_app.find('.messagesNavAction').on('click', function(){
		if(_loggedIn){
			showMessageView();
		}
	});
	_app.find('.settingsNavAction').on('click', function(){
		if(_loggedIn){
			showSettingsView();
		}
	});

	//---sockets
	_socket.on('adminLoggedIn', function(){
		_loggedIn = true;
		showMessageView();
	});
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
		_loggedIn = false;
		showLoginView();
	});
});
