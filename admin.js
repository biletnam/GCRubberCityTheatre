jQuery(function(){
	var _socket = io();
	var _app = jQuery('.app');
	var _currentView;

	var _currentMessages;
	var _loggedIn = false;
	var _settings = {
		adminNames: jQuery('[data-admin-names]').data('adminNames').split('|')
	};

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
		_currentView = 'login';
	};
	var showMessageView = function(){
		console.log('_currentMessages', _currentMessages);
		var _nameOptions = _settings.adminNames.map(function(name) { return `<option>${name}</option>`; });
		_setMainContent(`
			<nav class="navbar navbar-expand-lg navbar-light bg-light">
				<a class="navbar-brand">Rubber City Theatre</a>
			</nav>
			<div class="messagesList"></div>
			<form class="messageForm fixed-bottom">
				<select name="sender">
					${_nameOptions}
				</select>
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
		if(_currentMessages){
			_messageListEl.html(_currentMessages);
		}
		_formEl.on('submit', function(){
			var _message = {
				message: _messageEl.val(),
				sender: _formEl.find('[name="sender"]').val()
			};
			if(_message){
				_socket.emit('message', _message);
				_messageEl.val('');
			}
			return false;
		});
		_currentView = 'message';
	};
	var showSettingsView = function(){
		_setMainContent(
			'<form class="settingsForm">'
				+ '<label for="pinField">Pin</label>'
				+ '<input class="pinField" id="pinField" name="pin" autocomplete="off" autofocus="autofocus" required="required" value="' + (_settings.pin || '') + '" />'
				+ '<label for="adminNamesField">Names</label>'
				+ '<input class="adminNamesField" id="adminNamesField" name="pin" autocomplete="off" autofocus="autofocus" required="required" value="' + (_settings.adminNames ? _settings.adminNames.join(', ') : null) + '" />'
				+ '<button>Save</button>'
			+ '</form>'
		);
		var _form = _app.find('.settingsForm');
		_form.on('submit', function(){
			_socket.emit('setSettings', {
				'pin': _form.find('.pinField').val()
				,'adminNames': _form.find('.adminNamesField').val()
			});
			return false;
		});
		_currentView = 'messages';
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
	_socket.on('message', function(_message){
		console.log('message: ' + _message);
		var _liEl = jQuery('<li>', {'data-type': _message.type});
		switch(_message.type){
			case 'user':
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
				`));
			break;
			case 'admin':
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
			break;
		}
	});
	_socket.on('reconnect', function(){
		_loggedIn = false;
		showLoginView();
	});
	_socket.on('setSettings', function(_newSettings){
		_settings = _newSettings;
		if(_newSettings.adminNames){
			//--rerender message view because name dropdown may have changed
			if(_currentView === 'messages'){
				showMessageView();
			}
		}

	});
});
