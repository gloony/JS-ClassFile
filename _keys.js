var _keys = {
	funcHnd: [],
	disabled: false,
	initDown: false, initUp: false,
	fnDown: [], fnUp: [], history: '',
	// TODO: More layout, if this software will interested by other people
	mapFromKey: function(modifiers, keyCode){ // 1 = Ctrl, 2 = Shift, 4 = Alt
		switch(keyCode){
			case 8: case 46:
			case 9: case 13: case 16: case 17: case 18: case 20: case 27: case 45:
			case 33: case 34: case 35: case 36: case 37: case 38: case 39: case 40:
			case 91: case 92: return keyCode;
		}
		var characterMap = { //QWERTZ - fr_CH
			32: " ",
			191: "§", 49: "1", 50: "2", 51: "3", 52: "4", 53: "5", 54: "6", 55: "7", 56: "8", 57: "9", 48: "0", 219: "'", 221: "^",
			186: "è", 192: "¨",
			222: "é", 220: "à", 223: "$",
			226: "<", 188: ",", 190: ".", 189: "-",
			111: "/", 106: "*", 109: "-", 107: "+", 110: "."
		};
		var characterMapShift = { //QWERTZ - fr_CH
			32: " ",
			191: "°", 49: "+", 50: '"', 51: "*", 52: "ç", 53: "%", 54: "&", 55: "/", 56: "(", 57: ")", 48: "=", 219: "?", 221: "`",
			186: "ü", 192: "!",
			222: "ö", 220: "ä", 223: "£",
			226: ">", 188: ";", 190: ":", 189: "_"
		};
		var characterMapAltGr = { //QWERTZ - fr_CH
			191: "", 49: "¦", 50: "@", 51: "#", 52: "°", 53: "§", 54: "¬", 55: "|", 56: "¢", 57: "", 48: "", 219: "´", 221: "~",
			186: "[", 192: "]",
			222: "", 220: "{", 223: "}",
			226: "\\", 188: "", 190: "", 189: ""
		};
		var character = "";
		if(modifiers==0){
			if(keyCode>=65&&keyCode<=90) character = String.fromCharCode(keyCode).toLowerCase();
			else if(keyCode>=96&&keyCode<=105) character = (keyCode - 96) + "";
			else if(characterMap[keyCode]!==undefined) character = characterMap[keyCode];
			else character = String.fromCharCode(keyCode);
		}else if(modifiers==2){
			if(keyCode>=65&&keyCode<=90) character = String.fromCharCode(keyCode).toUpperCase();
			else if(characterMapShift[keyCode]!==undefined) character = characterMapShift[keyCode];
			else character = keyCode;
		}else if(modifiers==5){
			if(keyCode>=65&&keyCode<=90) character = "";
			else if(characterMapAltGr[keyCode]!==undefined) character = characterMapAltGr[keyCode];
			else character = keyCode;
		}else character = keyCode;
		return character;
	},
	modifier:	function(name){
		switch(name.toUpperCase()){
			case 'CTRL':			case 'CONTROL':
				return 1;
			case 'SHIFT':
				return 2;
			case 'CTRLSHIFT':		case 'CONTROLSHIFT':
			case 'SHIFTCONTROL':	case 'SHIFTCONTROL':
				return 3;
			case 'ALT':
				return 4;
			case 'CTRLALT':			case 'CONTROLSALT':
			case 'ALTCONTROL':		case 'ALTCONTROL':
				return 5;
			case 'SHIFTALT':		case 'ALTSHIFT':
				return 6;
			case 'CTRLSHIFTALT':	case 'CTRLALTSHIFT':	case 'SHIFTCTRLALT':	case 'SHIFTALTCTRL':	case 'ALTCTRLSHIFT':	case 'ALTSHIFTCTRL':
			case 'CONTROLSHIFTALT':	case 'CONTROLALTSHIFT':	case 'SHIFTCONTROLALT':	case 'SHIFTALTCONTROL':	case 'ALTCONTROLSHIFT':	case 'ALTSHIFTCONTROL':
				return 7;
		}
	},
	code:		function(name){
		switch(name.toUpperCase()){
			case 'BACKSPACE':				return 8;
			case 'TAB':						return 9;
			case 'ENTER':					return 13;
			case 'SHIFT':					return 16;
			case 'CONTROL': case 'CTRL':	return 17;
			case 'ALT':						return 18;
			case 'PAUSE': case 'BREAK':		return 19;
			case 'SHIFTLOCK':				return 20;
			case 'ESC':						return 27;
			case 'SPACE':					return 32;
			case 'PAGEUP':					return 33;
			case 'PAGEDOWN':				return 34;
			case 'END':						return 35;
			case 'HOME':					return 36;
			case 'LEFT':					return 37;
			case 'UP':						return 38;
			case 'RIGHT':					return 39;
			case 'DOWN':					return 40;
			case 'INSERT':					return 45;
			case 'DEL':						return 46;
			case '0':						return 48;
			case '1':						return 49;
			case '2':						return 50;
			case '3':						return 51;
			case '4':						return 52;
			case '5':						return 53;
			case '6':						return 54;
			case '7':						return 55;
			case '8':						return 56;
			case '9':						return 57;
			case 'A':						return 65;
			case 'B':						return 66;
			case 'C':						return 67;
			case 'D':						return 68;
			case 'E':						return 69;
			case 'F':						return 70;
			case 'G':						return 71;
			case 'H':						return 72;
			case 'I':						return 73;
			case 'J':						return 74;
			case 'K':						return 75;
			case 'L':						return 76;
			case 'M':						return 77;
			case 'N':						return 78;
			case 'O':						return 79;
			case 'P':						return 80;
			case 'Q':						return 81;
			case 'R':						return 82;
			case 'S':						return 83;
			case 'T':						return 84;
			case 'U':						return 85;
			case 'V':						return 86;
			case 'W':						return 87;
			case 'X':						return 88;
			case 'Y':						return 89;
			case 'Z':						return 90;
			case 'WINDOWS':					return 91;
			case 'MENU':					return 93;
			case 'NUMPAD0':					return 96;
			case 'NUMPAD1':					return 97;
			case 'NUMPAD2':					return 98;
			case 'NUMPAD3':					return 99;
			case 'NUMPAD4':					return 100;
			case 'NUMPAD5':					return 101;
			case 'NUMPAD6':					return 102;
			case 'NUMPAD7':					return 103;
			case 'NUMPAD8':					return 104;
			case 'NUMPAD9':					return 105;
			case 'NUMPAD*':					return 106;
			case 'NUMPAD+':					return 107;
			case 'NUMPAD-':					return 109;
			case 'NUMPAD.':					return 110;
			case 'NUMPAD/':					return 111;
			case 'F1':						return 112;
			case 'F2':						return 113;
			case 'F3':						return 114;
			case 'F4':						return 115;
			case 'F5':						return 116;
			case 'F6':						return 117;
			case 'F7':						return 118;
			case 'F8':						return 119;
			case 'F9':						return 120;
			case 'F10':						return 121;
			case 'F11':						return 122;
			case 'F12':						return 123;
			case 'NUMLOCK':					return 144;
			case 'SCROLLLOCK':				return 145;
			case 'È':						return 186;
			case ',':						return 188;
			case '-':						return 189;
			case '.':						return 190;
			case '¨':						return 192;
			case '\\':						return 191;
			case '\'':						return 219;
			case 'À':						return 220;
			case '^':						return 221;
			case 'É':						return 222;
			case '$':						return 223;
			default:					return -1;
		}
	},
	enable:		function(){
		if(!_keys.disabled) return false;
		if(_keys.initDown){
			_keys.addEvent('keydown', function(event){ _keys.eventProc(event, 'down'); });
			_keys.initDown = true;
		}
		if(_keys.initUp){
			_keys.addEvent('keyup', function(event){ _keys.eventProc(event, 'up'); });
			_keys.initUp = true;
		}
		_keys.disabled = false;
	},
	disable:	function(){
		for(var k in _keys.funcHnd) _keys.removeEvent(k, _keys.funcHnd[k]);
		_keys.funcHnd = [];
		_keys.disabled = true;
	},
	add:		function(object, fn){
		if(typeof object === 'string')	object = {keycode: object};
		if(object.modifier===undefined)	object.modifier	= 0;
		if(object.block===undefined)	object.block	= false;
		if(object.bubble===undefined)	object.bubble	= false;
		if(object.on===undefined)		object.on		= 'down';
		if(object.callback===undefined)	object.callback	= fn;
		if(isNaN(object.modifier))		object.modifier	= _keys.modifier(object.modifier);
		var key = '';
		if(isNaN(object.keycode)){
			if(object.keycode.indexOf(',')!==-1){
				var arr = object.keycode.split(',');
				arr.forEach(function(item){
					key += _keys.code(item) + 'x' + object.modifier + ',';
				});
			}else{
				object.keycode	= _keys.code(object.keycode);
				key = object.keycode + 'x' + object.modifier;
			}
		}else key = object.keycode + 'x' + object.modifier;
		if(object.on==='down'){
			if(!_keys.initDown){
				_keys.addEvent('keydown', function(event){ _keys.eventProc(event, 'down'); });
				_keys.initDown = true;
			}
			_keys.fnDown[key]	= object;
		}else if(object.on==='up'){
			if(!_keys.initUp){
				_keys.addEvent('keyup', function(event){ _keys.eventProc(event, 'up'); });
				_keys.initUp = true;
			}
			_keys.fnUp[key]		= object;
			if(object.block) _keys.add({keycode: object.keycode, modifier: object.modifier, block: true})
		}
	},
	addEvent:	function(on, func){
		var elem = document.body;
		_keys.funcHnd[on] = func.bind(elem);
		if(elem.addEventListener){ elem.addEventListener(on, _keys.funcHnd[on], false); }
		else if(elem.attachEvent){ elem.attachEvent('on' + on, _keys.funcHnd[on]); }
	},
	removeEvent:	function(on, func){
		var elem = document.body;
		if(elem.addEventListener){ elem.removeEventListener(on, _keys.funcHnd[on], false); }
		else if(elem.attachEvent){ elem.detachEvent('on' + on, _keys.funcHnd[on]); }
	},
	eventProc:	function(event, on){
		var el				= document.activeElement, OnElement = 'none';
		if(el&&((el.tagName.toLowerCase()=='input'&&el.type=='text')||el.tagName.toLowerCase()=='textarea')) OnElement = el.tagName.toLowerCase();
		if(OnElement=='none'){
			var chCode			= ('charCode' in event) ? event.charCode : event.keyCode;
			chCode				= event.which ? event.which : event.keyCode ? event.keyCode : 0;
			event.chCode		= chCode;
			event.modifier		= 0;
			if(event.ctrlKey)	event.modifier += 1;
			if(event.altKey)	event.modifier += 2;
			if(event.shiftKey)	event.modifier += 4;
			if(_keys.history.split(',').length<=16){
				var hobj = undefined;
				if(on==='down'){
					_keys.history += event.chCode + 'x' + event.modifier + ',';
					hobj = _keys.fnDown[_keys.history];
				}else if(on==='up')	hobj = _keys.fnUp[_keys.history];
				if(hobj!==undefined && typeof hobj.callback === 'function') hobj.callback(event);
			}
			_keys.resetHistory();
			var kobj = undefined;
			if(on==='down')		kobj = _keys.fnDown[event.chCode + 'x' + event.modifier];
			else if(on==='up')	kobj = _keys.fnUp[event.chCode + 'x' + event.modifier];
			if(kobj!==undefined){
				if(typeof kobj.callback === 'function') kobj.callback(event);
				if(kobj.bubble){
					event.cancelBubble = true;
					if(event.stopPropagation) event.stopPropagation();
				}
				if(kobj.block){
					event.preventDefault();
					return false;
				}else return true;
			}
		}
	},
	resetHistoryHnd: null,
	resetHistory(){
		if(_keys.resetHistoryHnd!==null) clearTimeout(_keys.resetHistoryHnd);
		_keys.resetHistoryHnd = setInterval(function(){ _keys.history = ''; }, 1500);
	}
};