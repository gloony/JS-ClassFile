var _string = function(source){
	function strObject(source){
		this.iLeftLast	= _string.iLeftLast;
		this.iRightLast	= _string.iRightLast;
		this.capitalize = function(){
			return source.replace(/\w\S*/g, function(txt){
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		}
		this.count			= function(search){
			return source.split(search).length - 1;
		};
		this.find			= function(search){
			return source.indexOf(search) !== -1;
		};
		this.iLeft			= function(search){
			var bool = source.indexOf(search) === 0;
			if(bool)	_string.iLeftLast = source.substr(search.lenght);
			else		_string.iLeftLast = null;
			return bool;
		};
		this.iRight			= function(search){
			var bool = source.indexOf(search, source.length - search.length) !== -1;
			if(bool)	_string.iRightLast = source.substr(0, source.length - search.length);
			else		_string.iRightLast = null;
			return bool;
		};
		this.basename		= function(extension){
			if(extension===undefined) extension = true;
			var base = source.substring(source.lastIndexOf('/') + 1);
			if(!extension && base.lastIndexOf(".")!=-1) base = base.substring(0, base.lastIndexOf("."));
			return base;
		};
		this.trim			= function(){
			return source.replace(/^\s+|\s+$/g, '');
		};
		this.getContrast	= function(){
			var hexcolor = source.replace("#", "");
			var r = parseInt(hexcolor.substr(0,2),16);
			var g = parseInt(hexcolor.substr(2,2),16);
			var b = parseInt(hexcolor.substr(4,2),16);
			var yiq = ((r*299)+(g*587)+(b*114))/1000;
			return (yiq >= 128) ? 'black' : 'white';
		}
	}
	return new strObject(source);
};
_string.iLeftLast	= null;
_string.iRightLast	= null;
