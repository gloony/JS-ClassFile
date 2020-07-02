var _object		= function(obj){
	function objectObject(obj){
		this.obj			= obj;
		this.extend			= function(){
			var out = obj || {};
			for (var i = 1; i < arguments.length; i++) {
				if(!arguments[i]) continue;
				for(var key in arguments[i]){
					if(arguments[i].hasOwnProperty(key)) out[key] = arguments[i][key];
				}
			}
			return out;
		};
		this.deepExtend		= function(){
			var out = obj || {};
			for(var i = 0; i < arguments.length; i++){
				var obj = arguments[i];
				if(!obj) continue;
				for(var key in obj){
					if(obj.hasOwnProperty(key)){
						if(typeof obj[key] === 'object'){
							if(obj[key] instanceof Array == true) out[key] = obj[key].slice(0);
							else out[key] = deepExtend(out[key], obj[key]);
						}
						else out[key] = obj[key];
					}
				}
			}
			return out;
		};
		this.type			= Object.prototype.toString.call(obj).replace(/^\[object (.+)\]$/, '$1').toLowerCase();
	}
	return new objectObject(obj);
}