var _timer = function(name){
	if(name===undefined){
		_timer.autoID++;
		name = 'auto' + _timer.autoID;
	}
	function timerObject(name){
		this.name				= name;
		if(_timer.db[this.name]!==undefined){
			this.pid			= undefined;
			if(_timer.db[this.name].pid!==undefined) this.pid = _timer.db[this.name].pid;
			this.proc			= _timer.db[this.name].proc;
			this.type			= _timer.db[this.name].type;
			this.seconds		= _timer.db[this.name].seconds;
		}else{
			this.pid			= undefined;
			this.proc			= undefined;
			this.type			= undefined;
			this.seconds		= 1;
		}
		this.destroy		= function(){
			this.stop();
			delete(_timer.db[this.name]);
		};
		this.delay			= function(fn, delay){
			if(delay===undefined){
				if(_timer.db[this.name]!==undefined&&_timer.db[this.name].seconds!==undefined) delay = _timer.db[this.name].seconds;
				else delay = 1;
			}
			this.stop();
			var self = this;
			_timer.db[this.name] = {
				type: 'delay',
				proc: fn,
				seconds: delay
			};
			this.proc			= _timer.db[this.name].proc;
			this.type			= _timer.db[this.name].type;
			this.seconds		= _timer.db[this.name].seconds;
			_timer.db[this.name].pid = setTimeout(function(){
				delete(_timer.db[self.name].pid);
				_timer.db[self.name].proc.bind(_timer(self.name))();
				}, delay * 1000);
			return this;
		};
		this.interval		= function(fn, delay){
			if(delay===undefined){
				if(_timer.db[this.name]!==undefined&&_timer.db[this.name].seconds!==undefined) delay = _timer.db[this.name].seconds;
				else delay = 1;
			}
			this.stop();
			var self = this;
			_timer.db[this.name] = {
				type: 'interval',
				proc: fn,
				seconds: delay
			};
			this.proc			= _timer.db[this.name].proc;
			this.type			= _timer.db[this.name].type;
			this.seconds		= _timer.db[this.name].seconds;
			_timer.db[this.name].pid = setInterval(_timer.db[self.name].proc.bind(timerObject(self.name)), delay * 1000);
			return this;
		};
		this.start			= function(){
			this.stop();
			var self = this;
			if(_timer.db[this.name].type=='delay'){
				_timer.db[self.name].pid = setTimeout(function(){
					delete(_timer.db[self.name].pid);
					_timer.db[self.name].proc.bind(_timer(self.name))();
					}, _timer.db[self.name].seconds * 1000);
			}else if(_timer.db[this.name].type=='interval'){
				_timer.db[this.name].pid = setInterval(_timer.db[self.name].proc.bind(timerObject(self.name)), _timer.db[self.name].seconds * 1000);
			}
			return this;
		};
		this.stop			= function(){
			if(_timer.db[this.name]!==undefined&&_timer.db[this.name].pid!==undefined){
                if(_timer.db[this.name].type=='delay') clearTimeout(_timer.db[this.name].pid);
                else if(_timer.db[this.name].type=='interval') clearInterval(_timer.db[this.name].pid);
            }
			delete(_timer.db[this.name].pid);
			return this;
		};
	}
	return new timerObject(name);
};
_timer.db 		= {};
_timer.autoID	= -1;
_timer.delay	= function(fn, delay){ return _timer().delay(fn, delay); };
_timer.interval	= function(fn, delay){ return _timer().interval(fn, delay); };
_timer.sleep	= function(delay){
	if(delay===undefined) delay = 10;
	var start = new Date().getTime();
	while(new Date().getTime() < start + delay);
	return this;
};
_timer.stop		= function(){
	for(var key in _timer.dataBase){
		clearTimeout(_timer.dataBase[key]);
		_timer.dataBase[key] = undefined;
	}
};
_timer.now		= function(){ return new Date().getTime(); };
