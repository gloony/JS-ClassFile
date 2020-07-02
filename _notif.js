var _notif = {
	internalVar: [],
	vars:		function(name, value){
		if(name===undefined){
			if(typeof localStorage!=='undefined')						return localStorage;
			else														return _notif.internalVar;
		}else{
			if(value===undefined){
				if(typeof localStorage!=='undefined')					return localStorage.getItem(name);
				else if(_notif.internalVar[name]!==undefined)			return _notif.internalVar[name];
				else													return null;
			}else{
				if(typeof localStorage!=='undefined')					return localStorage.setItem(name, value);
				else													_notif.internalVar[name] = value;
			}
		}
	},
	show:		function(params){
		if(!("Notification" in window)) return;
		var title, name;
		if(typeof params === 'object') title = params.title;
		else{
			title = params;
			params = {};
		}
		if(params.name===undefined) name = title;
		else name = params.name;
		if(params.counter!==undefined){
			if(_notif.vars('_notify_Last_' + name)===null)			_notif.vars('_notify_Last_' + name, 0);
			if(_notif.vars('_notify_' + name)===null)				_notif.vars('_notify_' + name, 0);
			if(_notif.vars('_notify_Last_' + name)==params.counter)	return;
			_notif.vars('_notify_Last_' + name, params.counter);
			if(_notif.vars('_notify_' + name)<params.counter){
				localStorage.setItem('_notify_' + name, params.counter);
			}else if(_notif.vars('_notify_' + name)>params.counter){
				_notif.vars('_notify_Last_' + name, params.counter);
				_notif.vars('_notify_' + name, params.counter);
				return;
			}
		}
		if(Notification.permission === "granted"){
			var notification = new Notification(title, params);
			notification.onclick = function(){ window.focus(); this.close(); };
		}else Notification.requestPermission();
	}
};