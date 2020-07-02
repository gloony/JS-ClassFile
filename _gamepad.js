var _gamepad = {
	controllers:		[],
	axis_margin:		0.4,
	activated:			false,
	players:			[],
	addplayer:			function(func, index, axis_margin){
		if(typeof func === 'object'){
			if(func.axis_margin!==undefined){
				axis_margin = func.axis_margin;
				delete func.axis_margin;
			}
			if(func.index!==undefined){
				index = func.index;
				delete func.index;
			}
		}
		if(index===undefined) index = -1;
		if(axis_margin===undefined) axis_margin = _gamepad.axis_margin;
		_gamepad.activate();
		_gamepad.scangamepads();
		_gamepad.players.push({ index: index, connected: false, proc: func, buttons: [], axes: [], axis_margin: axis_margin });
		return _gamepad.players.length - 1;
	},
	haveEvents:			'GamepadEvent' in window,
	activate:			function(){
		if(_gamepad.activated) return;
		if(_gamepad.haveEvents){
			window.addEventListener("gamepadconnected", _gamepad.connecthandler);
			window.addEventListener("gamepaddisconnected", _gamepad.disconnecthandler);
		}else setInterval(_gamepad.scangamepads, 500);
		window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		window.requestAnimationFrame(_gamepad.updateStatus);
		_gamepad.scangamepads();
		_gamepad.activated = true;
	},
	scangamepads:		function(){
		var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
		for(var i = 0; i < gamepads.length; i++){
			if(gamepads[i]){
				if(!(gamepads[i].index in _gamepad.controllers)) _gamepad.addgamepad(gamepads[i]);
				else _gamepad.controllers[gamepads[i].index] = gamepads[i];
			}
		}
	},
	addgamepad:			function(gamepad){
		_gamepad.controllers[gamepad.index] = gamepad;
		window.requestAnimationFrame(_gamepad.updateStatus);
	},
	connecthandler:		function(e){ _gamepad.addgamepad(e.gamepad); },
	disconnecthandler:	function(e){ delete _gamepad.controllers[e.gamepad.index]; },
	associateGamepad:	function(index_p, index_c, controller){
		_gamepad.players[index_p].index = index_c;
		var controller_b = _gamepad.formatController(controller);
		_gamepad.players[index_p].connected = true;
		if(typeof _gamepad.players[index_p].proc == 'object'){
			if(typeof _gamepad.players[index_p].proc.connected == 'function') _gamepad.players[index_p].proc.connected.bind(controller_b)();
			if(_gamepad.players[index_p].proc.buttonDown===undefined) _gamepad.players[index_p].proc.buttonDown = [];
			if(_gamepad.players[index_p].proc.buttonRepeat===undefined) _gamepad.players[index_p].proc.buttonRepeat = [];
			if(_gamepad.players[index_p].proc.buttonUp===undefined) _gamepad.players[index_p].proc.buttonUp = [];
		}
	},
	formatController:	function(controller){
		var controller_b = {
			id: controller.id,
			index: controller.index,
			axes: [],
			buttons: []
		};
		for(var i=0; i<controller.axes.length; i++){
			controller_b.axes.push(controller.axes[i]);
		}
		for(var i=0; i<controller.buttons.length; i++){
			var val = controller.buttons[i];
			var pressed = (val == 1.0);
			if(typeof val == 'object') pressed = val.pressed;
			controller_b.buttons.push(pressed);
		}
		return controller_b;
	},
	updateStatus:		function(){
		_gamepad.scangamepads();
		for(var index_p in _gamepad.players){
			var controller;
			if(_gamepad.players[index_p].index==-1){
				for(var index_p2 in _gamepad.players){
					if(_gamepad.players.index==index_p) return;
				}
				for(var index_c in _gamepad.controllers){
					controller = _gamepad.controllers[index_c];
					for(var i=0; i<controller.axes.length; i++){
						if(controller.axes[i]>_gamepad.players[index_p].axis_margin||controller.axes[i]<-_gamepad.players[index_p].axis_margin){
							_gamepad.associateGamepad(index_p, index_c, controller);
							window.requestAnimationFrame(_gamepad.updateStatus);
							return;
						}
					}
					for(var i=0; i<controller.buttons.length; i++){
						var val = controller.buttons[i];
						var pressed = (val == 1.0);
						if(typeof val == 'object') pressed = val.pressed;
						if(pressed){
							_gamepad.associateGamepad(index_p, index_c, controller);
							window.requestAnimationFrame(_gamepad.updateStatus);
							return;
						}
					}
				}
			}else if(_gamepad.controllers[_gamepad.players[index_p].index]===undefined){
				if(_gamepad.players[index_p].connected){
					_gamepad.players[index_p].connected = false;
					if(typeof _gamepad.players[index_p].proc.disconnected == 'function') _gamepad.players[index_p].proc.disconnected.bind(null, index_p)();
				}
			}else{
				controller = _gamepad.controllers[_gamepad.players[index_p].index];
				var controller_b = _gamepad.formatController(controller);
				if(!_gamepad.players[index_p].connected){
					_gamepad.players[index_p].connected = true;
					if(typeof _gamepad.players[index_p].proc.connected == 'function') _gamepad.players[index_p].proc.connected.bind(controller_b)();
				}
				if(typeof _gamepad.players[index_p].proc == 'function') _gamepad.players[index_p].proc.bind(controller_b)();
				else{
					if(typeof _gamepad.players[index_p].proc.updateStatus == 'function') _gamepad.players[index_p].proc.updateStatus.bind(controller_b)();
					else{
						for(var i=0; i<controller.axes.length; i++){
							if(_gamepad.players[index_p].axes[i]===undefined) _gamepad.players[index_p].axes.push(false);
							if(controller.axes[i]>_gamepad.players[index_p].axis_margin||controller.axes[i]<-_gamepad.players[index_p].axis_margin){
								if(!_gamepad.players[index_p].axes[i]){
									if(_gamepad.players[index_p].proc.axeEnter!== undefined && typeof _gamepad.players[index_p].proc.axeEnter[i] == 'function') _gamepad.players[index_p].proc.axeEnter[i].bind(controller_b, controller.axes[i])();
									if(_gamepad.players[index_p].proc.waitForAxe!== undefined){
										_gamepad.players[index_p].proc.waitForAxe.bind(null, index_p, i)();
										delete _gamepad.players[index_p].proc.waitForAxe;
									}
									_gamepad.players[index_p].axes[i] = true;
								}else if(_gamepad.players[index_p].proc.axeMove!== undefined && typeof _gamepad.players[index_p].proc.axeMove[i] == 'function') _gamepad.players[index_p].proc.axeMove[i].bind(controller_b, controller.axes[i])();
							}else if(_gamepad.players[index_p].axes[i]){
								if(_gamepad.players[index_p].proc.axeLeave!== undefined && typeof _gamepad.players[index_p].proc.axeLeave[i] == 'function') _gamepad.players[index_p].proc.axeLeave[i].bind(controller_b)();
								_gamepad.players[index_p].axes[i] = false;
							}
						}
						for(var i=0;i<controller_b.buttons.length; i++){
							if(_gamepad.players[index_p].buttons[i]===undefined) _gamepad.players[index_p].buttons.push(false);
							if(!_gamepad.players[index_p].buttons[i]&&controller_b.buttons[i]){
								if(_gamepad.players[index_p].proc.buttonDown !== undefined && typeof _gamepad.players[index_p].proc.buttonDown[i] == 'function') _gamepad.players[index_p].proc.buttonDown[i].bind(controller_b)();
								if(_gamepad.players[index_p].proc.waitForButton!== undefined){
									console.log('return Button')
									_gamepad.players[index_p].proc.waitForButton.bind(null, index_p, i)();
									delete _gamepad.players[index_p].proc.waitForButton;
								}
								_gamepad.players[index_p].buttons[i] = true;
							}else if(_gamepad.players[index_p].buttons[i]&&controller_b.buttons[i]){
								if(_gamepad.players[index_p].proc.buttonRepeat !== undefined && typeof _gamepad.players[index_p].proc.buttonRepeat[i] == 'function') _gamepad.players[index_p].proc.buttonRepeat[i].bind(controller_b)();
							}else if(_gamepad.players[index_p].buttons[i]&&!controller_b.buttons[i]){
								if(_gamepad.players[index_p].proc.buttonUp !== undefined && typeof _gamepad.players[index_p].proc.buttonUp[i] == 'function') _gamepad.players[index_p].proc.buttonUp[i].bind(controller_b)();
								_gamepad.players[index_p].buttons[i] = false;
							}
						}
					}
				}
			}
		}
		window.requestAnimationFrame(_gamepad.updateStatus);
	}
};