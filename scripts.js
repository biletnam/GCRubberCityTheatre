jQuery(function(){
	var _socket = io();
	var _app = jQuery('.app');
	var _messageListEl;
	var _userName;
	var _backgroundImage = _app.data('backgroundImage') || false;
	var _headerName = _app.data('headerName') || 'Rubber City Theatre';
	var _loginImage = _app.data('loginImage') || '/login-image.jpg';

	//--controller
	var showLoginView = function(){
		_app.html(
			'<div >'
			+	'<img style="display: block; margin-left: auto;	margin-right: auto; margin-top: 50px; width: 50%;" src="' + _loginImage + '">'
			+	'</div>'
			+	'<form class="loginForm" style="margin:10px 0">'
				+ '<div class="form-group">'
				+ '<label for="nameField">Name</label>'
				+ '<input type="text" class="nameField form-control" id="nameField" name="name" />'
				+ '</div>'
				+ '<div class="form-group">'
				+ '<label for="passwordField">Audience Pin</label>'
				+ '<input class="passwordField form-control" id="passwordField" name="password" type="text" />'
				+ '</div>'
				+ '<div>'
				+ '<button class="btn btn-default">Log In</button>'
				+ '</div>'
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
		_app.html(`
			<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
				<a class="navbar-brand">${_headerName}</a>
			</nav>
			<div class="messagesList"></div>
			<form class="messageForm fixed-bottom">
				<div class="input-group">
					<input type="text" class="form-control messageField" name="message" autocomplete="off" autofocus="autofocus" required="required" placeholder="Enter Message" aria-label="Enter message..." aria-describedby="button-addon2">
					<div class="input-group-append">
						<button class="btn btn-outline-secondary btn-primary" type="submit" id="button-addon2">Send</button>
					</div>
				</div>
			</form>`
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
	if(_backgroundImage){
		jQuery('html').css('background-image', 'url("' + _backgroundImage + '")');
	}
	showLoginView();
	_socket.on('clearMessages', function(){
		if(_messageListEl){
			_messageListEl.html('');
		}
	});
	_socket.on('message', function(_message){
		console.log('message: ' + _message);
		let momentDate = moment(_message.dateTime)
		_message.time = momentDate.format('h:mm')
		var _liEl = jQuery(`<li>${_message.name}`, {'data-type': _message.type});
		switch(_message.type){
			case 'user':
				_messageListEl.prepend(jQuery(`
					<div class="card bg-dark">
						<div class="card-body">
							<h6 class="card-title user-header">
								${_message.name} <span style="font-size:.8em; margin-left:8px; margin-right:8px;">posted at</span> ${_message.time}
							</h6>
							<div style="display: flex; flex-direction: row; align-items:center; justify-content:flex-end;">

								<div>
									${_message.value}
								</div>

							</div>
						</div>
					</div>
				`));
			break;
			case 'admin':
				_messageListEl.prepend(jQuery(`
					<div class="card bg-dark">
						<div class="card-body" >
							<h6 class="card-title admin-header">
								${_message.name} <span style="font-size:.7em;"> posted at </span> ${_message.time}
							</h6>
							<div style="display: flex; flex-direction: row; align-items:center; width:100%">
								<div class="user profile-pic" style="background-image: url(${_message.image}); margin-right:20px;">
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
