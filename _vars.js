var _vars = function(name, value){
	if(name===undefined){
		if(typeof localStorage!=='undefined')						return localStorage;
		else														return _vars.internalVar;
	}else{
		if(value===undefined){
			if(typeof localStorage!=='undefined')					return localStorage.getItem(name);
			else if(_vars.internalVar[name]!==undefined)			return _vars.internalVar[name];
			else													return null;
		}else{
			if(typeof localStorage!=='undefined')					return localStorage.setItem(name, value);
			else													_vars.internalVar[name] = value;
		}
	}
};
_vars.internalVar = [];