jQuery(function(){
	var _socket = io();
	var _app = jQuery('.app');
	_app.html(
		'<header class="appHeader"><nav></nav></header>'
		+ '<main class="appMain"><span class="loading">Loading…</span></main>'
	);
	var _appMain = _app.find('.appMain');
	var _messageListEl;

	//--controller
	var showLoginView = function(){
		_appMain.html(
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
	var showMessageView = function () {
		_app.html(`
			<nav class="navbar navbar-expand-lg navbar-light bg-light">
				<a class="navbar-brand">Rubber City Theatre</a>
			</nav>
			<div class="messagesList"></div>
			<form class="messageForm fixed-bottom">
				<div class="input-group">
					<input type="text" class="form-control messageField" name="message" autocomplete="off" autofocus="autofocus" required="required" placeholder="Enter Message" aria-label="Enter message..." aria-describedby="button-addon2">
					<div class="input-group-append">
						<button class="btn btn-outline-secondary" type="submit" id="button-addon2">Send</button>
					</div>
				</div>
			</form>`
		);
		var _formEl = _app.find('.messageForm');
		var _messageEl = _formEl.find('.messageField');
		_messageListEl = _app.find('.messagesList');
		_formEl.on('submit', function () {
			var _message = _messageEl.val();
			if (_message) {
				_socket.emit('message', _message);
				_messageEl.val('');
			}
			return false;
		});
	}

	//--routing
	showLoginView();
	_socket.on('message', function (_message) {
		console.log('message: ' + _message);

		if (_message.type === 'admin') {
			_messageListEl.append(jQuery(`
			<div class="card">
				<div class="card-body" >
					<h6 class="card-title admin-header">
						${_message.name} <span style="font-size:.7em;"> posted at </span> ${_message.time}
					</h6>
					<div style="display: flex; flex-direction: row; align-items:center; width:100%">
						<div class="user profile-pic">
						</div>
						<div>
							${_message.value}
						</div>
					</div>
				</div>
			</div>
		`,
				{ 'data-type': _message.type }
			));
		}
		else if (_message.type === "user") {
			_messageListEl.append(jQuery(`
			<div class="card">
				<div class="card-body">
					<h6 class="card-title user-header">
						${_message.name} <span style="font-size:.8em; margin-left:8px; margin-right:8px;">posted at</span> ${_message.time}
					</h6>
					<div style="display: flex; flex-direction: row; align-items:center; justify-content:flex-end;">

						<div>
							${_message.value}
						</div>
						<div class="user profile-pic">
						</div>
					</div>
				</div>
			</div>
		`, ))
		}
	});

	//--routing
	showLoginView();
	_socket.on('adminLoggedIn', function(){
		showMessageView();
	});

	_socket.on('reconnect', function(){
		showLoginView();
	});
});
