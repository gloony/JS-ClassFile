var _timer = function(name){
	if(name===undefined){
		_timer.autoID++;
		name = 'auto' + _timer.autoID;
	}
	function timerObject(name){
		this.name			= name;
		this.delay			= function(fn, delay){
			if(delay===undefined) delay = 1000;
			if(_timer.dataBase[this.name]!==undefined) clearTimeout(_timer.dataBase[this.name]);
			_timer.dataBase[this.name] = setTimeout(fn.bind(timerObject(this.name)), delay);
			return this;
		};
		this.interval		= function(fn, delay){
			if(delay===undefined) delay = 1000;
			if(_timer.dataBase[this.name]!==undefined) clearTimeout(_timer.dataBase[this.name]);
			_timer.dataBase[this.name] = setInterval(fn.bind(timerObject(this.name)), delay);
			return this;
		};
		this.stop			= function(){
			clearTimeout(_timer.dataBase[this.name]);
			_timer.dataBase[this.name] = undefined;
			return this;
		};
	}
	return new timerObject(name);
};
_timer.dataBase	= [];
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