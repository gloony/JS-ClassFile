var _clipboard = {
	mode: null,
	available: {
		api: false,
		clipboardData: false,
		execCommand: false
	},
	init: function(){
		if(window.clipboardData&&window.clipboardData.setData) _clipboard.available.clipboardData = true;
		else if(document.queryCommandSupported('copy')) _clipboard.available.execCommand = true;
		_clipboard.setMode();
		if(_clipboard.mode!='clipboardData'){
			try{
				if(typeof navigator.clipboard.readText!==undefined){
					navigator.permissions.query({name: 'clipboard-read'}).then(function(permissionStatus){
						if(permissionStatus.state=='granted') _clipboard.available.api = true;
						else if(permissionStatus.state=='denied') _clipboard.available.api = false;
						_clipboard.setMode();
						permissionStatus.onchange = function(){
							if(permissionStatus.state=='granted') _clipboard.available.api = true;
							else if(permissionStatus.state=='denied') _clipboard.available.api = false;
							_clipboard.setMode();
						};
					});
				}
			}catch(e){}
		}
	},
	setMode: function(mode){
		if(mode===undefined){
			if(_clipboard.available.api) _clipboard.mode = 'api';
			else if(_clipboard.available.clipboardData) _clipboard.mode = 'clipboardData';
			else if(_clipboard.available.execCommand) _clipboard.mode = 'execCommand';
			else _clipboard.mode = 'prompt';
		}else this.mode = mode;
	},
	text: function(text){
		if(text===undefined){
			switch(this.mode){
				case 'api': err.log('_clipboard.text in mode api is available only async, use _clipboard.read(func) instead'); break;
				case 'clipboardData': text = clipboardData.getData('Text'); break;
				case 'execCommand':
					var textarea = document.createElement('textarea');
					textarea.style.position = 'fixed';
					document.body.appendChild(textarea); textarea.focus();
					try{ document.execCommand('paste'); text = textarea.value; }
					catch(ex){ prompt('_clipboard.text failed, ctrl+v now for paste manually', ''); }
					finally{ document.body.removeChild(textarea); }
					break;
				case 'prompt': prompt('ctrl+v now for paste manually', ''); break;
			} return text;
		}else{
			switch(this.mode){
				case 'api': navigator.clipboard.writeText(text); break;
				case 'clipboardData': clipboardData.setData('Text', text); break;
				case 'execCommand':
					var textarea = document.createElement('textarea');
					textarea.textContent = text; document.body.appendChild(textarea); textarea.select();
					try{ document.execCommand('copy'); }
					catch(ex){ prompt('clipboard.text failed, ctrl+c or ctrl+x now for copy manually', text); }
					finally{ document.body.removeChild(textarea); }
					break;
				case 'prompt': prompt('ctrl+c or ctrl+x now for copy manually', text); break;
			}
		}
	},
	read: function(callback){
		if(this.mode=='api') navigator.clipboard.readText().then(function(text){ callback(text); });
		else{
			var text = _clipboard.text();
			callback(text);
		}
	},
	write: function(text){ _clipboard.text(text); }
};

_clipboard.init();