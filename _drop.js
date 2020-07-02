// TODO: Remove event to desactivate it
var _drop = function(elem, proc, params){
	function uploadObject(elem, proc, params){
		if(typeof elem == 'function'){
			proc = elem;
			elem = document;
		}
		if(elem===undefined) this.elem = document;
		else this.elem = elem;
		this.files;
		this.index = 0;
		this.proc = proc;
		this.params = params;
		var self = this;
		// TODO: replace on by delegate // retrive option by data
		_dom(this.elem).on('dragover',	function(e){
			if(self.proc.dragover!==undefined) self.proc.dragover.bind(self, e)();
			e.preventDefault(); e.stopPropagation();
			return false;
		});
		_dom(this.elem).on('dragenter',	function(e){
			if(self.proc.dragenter!==undefined) self.proc.dragenter.bind(self, e)();
			e.preventDefault(); e.stopPropagation();
			return false;
		});
		_dom(this.elem).on('dragleave',	function(e){
			if(self.proc.dragleave!==undefined) self.proc.dragleave.bind(self, e)();
			e.preventDefault(); e.stopPropagation();
			return false;
		});
		_dom(this.elem).on('drop',		function(e){
			if(self.proc.drop!==undefined) self.proc.drop.bind(self, e)();
			e.preventDefault(); e.stopPropagation();
			if(e.dataTransfer){
				if(e.dataTransfer.files.length){
					e.preventDefault(); e.stopPropagation();
					self.files = e.dataTransfer.files;
					self.load();
				}
			} return false;
		});
		this.load		= function(index){
			if(index===undefined) index = 0;
			var f = this.files[index];
			var reader = new FileReader();
			var folder = '';
			reader.readAsDataURL(f);
			reader.onerror = function(e){
				if(self.proc.error!==undefined) self.proc.error.bind(self, e)();
				else self.next();
			};
			reader.onprogress = function(e){
				if(self.proc.progress!==undefined) self.proc.progress.bind(self, e)();
			};
			reader.onload = function(e){
				e.strfile = e.target.result.split(',')[1];
				if(self.proc.load!==undefined) self.proc.load.bind(self, e)();
				else if(typeof proc == 'function') self.proc.bind(self, e)();
			};
		};
		this.next		= function(){
			if(this.files.length>this.index+1){
				this.index ++;
				this.load(this.index);
			}else{
				this.index = 0;
				this.files = undefined;
				if(self.proc.end!==undefined) self.proc.end.bind(self)();
			}
		};
	}
	return new uploadObject(elem, proc, params);
};
_drop.onFunctions = [];