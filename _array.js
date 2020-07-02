var _array = function(obj){
	function arrayObject(obj){
		this.object		= obj;
		this.dump		= function(){
			var out = '';
			for(var i in this.object) out += i + ": " + this.object[i] + "\n";
			return out;
		};
		this.each		= function(fn){
			this.object.forEach(function(item){
				fn.bind(item)();
			});
		};
		this.indexOf	= function(item){
			for(var i = 0; i < obj.length; i++){
				if(obj[i] === item) return i;
			}
			return -1;
		};
		this.unique		= function(){
			var a = obj.concat();
			for(var i=0; i<a.length; ++i){
				for(var j=i+1; j<a.length; ++j){
					if(a[i] === a[j]) a.splice(j--, 1);
				}
			}
			return a;
		};
	}
	return new arrayObject(obj);
};