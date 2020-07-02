var _ajax = function(uri, data, method, after){
	var key;
	var progress, error, success, opened, headers_received, loading, before, upload, timeout, header;
	function _ajax_create(){
		var ajaxHttp = null;
		try{
			if(window.ActiveXObject)		ajaxHttp = new ActiveXObject("Microsoft.XMLHTTP");
			else if(window.XMLHttpRequest)	ajaxHttp = new XMLHttpRequest();
		}catch(e){
			err.log(e.message);
			return null;
		} return ajaxHttp;
	}
	if(typeof uri === 'object'){
		var ouri = uri;
		for(key in ouri){
			switch(key){
				case 'uri': case 'url':		uri = ouri[key]; break;
				case 'data':				data = ouri[key]; break;
				case 'method':				method = ouri[key]; break;
				case 'after':				after = ouri[key]; break;
				case 'success':				success = ouri[key]; break;
				case 'error':				error = ouri[key]; break;
				case 'progress':			progress = ouri[key]; break;
				case 'opened':				opened = ouri[key]; break;
				case 'headers_received':	headers_received = ouri[key]; break;
				case 'loading':				loading = ouri[key]; break;
				case 'before':				before = ouri[key]; break;
				case 'upload':				upload = ouri[key]; break;
				case 'timeout':				timeout = ouri[key]; break;
				case 'header':				header = ouri[key]; break;
			}
		}
	}
	if(header===undefined) header = { 'Content-type':  'application/x-www-form-urlencoded' };
	var xhr = _ajax_create();
	if(typeof data === 'object'){
		var out = '';
		for(key in data){
			if(out!=='') out += '&';
			out += key + '=' + encodeURI(data[key]);
		}
		data = out;
	}
	if(typeof data === 'function'){
		after	= data;
		method	= 'GET';
		data	= '';
	}else if(typeof method === 'function'){
		after	= method;
		method	= 'POST';
	}
	if(uri===undefined) uri = uri.href();
	if(method===undefined&&data!==undefined) method = 'POST';
	if(method===undefined&&data===undefined) method = 'GET';
	xhr.open(method, uri, true);
	for(key in header) xhr.setRequestHeader(key, header[key]);
	if(timeout!==undefined) xhr.timeout = function(e){ timeout.bind(xhr, e)(); };
	if(upload!==undefined) xhr.upload = function(e){ upload.bind(xhr, e)(); };
	if(progress!==undefined){
		if(xhr instanceof window.XMLHttpRequest){ xhr.onprogress = function(e){ progress.bind(xhr, e)(); }; }
		if(xhr.upload){ xhr.upload.onprogress = function(e){ progress.bind(xhr, e)(); }; }
	}
	xhr.onreadystatechange = function(e){
		if(xhr.readyState == 4 && xhr.status == 200){ //SUCCESS
			if(success!==undefined) success.bind(xhr, e)();
			else if(after!==undefined) after.bind(xhr, e)();
		}else if(xhr.readyState == 4){ //ERROR
			if(error!==undefined) error.bind(xhr, e)();
			else if(after!==undefined) after.bind(xhr, e)();
		}else if(xhr.readyState == 3){ //LOADING
			if(loading!==undefined) loading.bind(xhr, e)();
		}else if(xhr.readyState == 2){ //HEADERS_RECEIVED
			if(opened!==undefined) opened.bind(xhr, e)();
		}else if(xhr.readyState == 1){ //OPENED
			if(opened!==undefined) opened.bind(xhr, e)();
		}
	};
	if(data===undefined||method=='GET') xhr.send();
	else xhr.send(data);
};
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
var _dom = function(selector, doEach, index){
	function domElementsObjects(selector, doEach, index){
		if(doEach===undefined) doEach = false;
		if(index===undefined) index = 0;
		if(selector===false||selector===null||selector===undefined){
			this.elems			= [];
		}else if(typeof selector === 'object'){
			if(Array.isArray(selector)) this.elems = selector;
			else{
				this.elems			= [];
				this.elems.push(selector);
			}
		}else this.elems		= _dom.querySelectorAllWithEq(selector, document);
		this.length				= this.elems.length;

		this.delegate			= function(eventName, handler){
			_dom.onFunctions[_dom(document).path + '.on:delegate' + eventName] = function(e){
				for(var target = e.target; target && target != this; target = target.parentNode){
					if(target.matches(selector)){
						handler.call(new domElementsObjects(target), e);
						break;
					}
				}
			};
			document.addEventListener(eventName, _dom.onFunctions[_dom(document).path + '.on:delegate' + eventName], false);
			return this;
		};
		this.delegateOff		= function(eventName){
			document.removeEventListener(eventName, _dom.onFunctions[_dom(document).path + '.on:delegate' + eventName], false);
			return this;
		};

		if(this.length!==0){
			this.elem			= this.elems[index];
			this.index			= index;
			this.each			= function(fn){
				var self = this;
				if(fn===undefined) return new domElementsObjects(selector, true);
				else this.elems.forEach(function(elem){ fn.bind(self)(); });
			};
			this.path			= function(){
				var path = this.elem.nodeName;
				var current = this.elem;
				var parent = this.elem.parentNode;
				while(parent){
					for(var child in parent.children){
						if(parent.children[child] == current) path = parent.nodeName + '[' + child + ']' + '/' + path;
					}
					current = parent;
					parent = parent.parentNode;
				}
				return path;
			};
			this.is				= function(selector){
				if(doEach){
					var ret = true;
					this.elems.forEach(function(elem){
						if(!(elem.matches || elem.matchesSelector || elem.msMatchesSelector || elem.mozMatchesSelector || elem.webkitMatchesSelector || elem.oMatchesSelector).call(elem, selector)) ret = false;
					});
					return ret;
				}else return (this.elem.matches || this.elem.matchesSelector || this.elem.msMatchesSelector || this.elem.mozMatchesSelector || this.elem.webkitMatchesSelector || this.elem.oMatchesSelector).call(this.elem, selector);
			};

			this.filter			= function(fn, each){
				var ret = [];
				for(var key in this.elems){
					if(typeof fn == 'function'){
						if(fn.bind(new domElementsObjects(this.elems[key]), key)()) ret.push(this.elems[key]);
					}else if(_dom(this.elems[key]).is(fn)) ret.push(this.elems[key]);
				}
				return new domElementsObjects(ret, each);
			};
			this.siblings		= function(selector){
				var objects = Array.prototype.filter.call(this.elem.parentNode.children, function(child){ return child !== this.elem; });
				objects = new domElementsObjects(objects, true);
				if(selector!==undefined) objects = objects.filter(selector);
				return objects;
			};

			this.first			= function(){
				return new domElementsObjects(this.elem);
			};
			this.last			= function(){
				return new domElementsObjects(this.elems[this.elems.length-1]);
			};
			this.eq				= function(id){
				return new domElementsObjects(this.elems[id]);
			};
			this.parent			= function(){
				return new domElementsObjects(this.elem.parentNode);
			};
			this.prev			= function(){
				return new domElementsObjects(this.elem.previousElementSibling);
			};
			this.next			= function(){
				return new domElementsObjects(this.elem.nextElementSibling);
			};
			this.children		= function(eq){
				if(doEach){
					var elems = [];
					this.elems.forEach(function(elem){ elems = elems.concat([].slice.call(elem.children)); });
					return new domElementsObjects(elems, true);
				}else{
					if(eq===undefined) eq = 0;
					if(eq < 0) eq = this.elem.children.length + eq;
					if(eq===true) return new domElementsObjects([].slice.call(this.elem.children), false, eq);
					else return new domElementsObjects([].slice.call(this.elem.children), true);
				}
			};
			this.find			= function(selector, each){
				if(doEach){
					var ret = [];
					this.elems.forEach(function(elem){ ret = ret.concat(_dom.querySelectorAllWithEq(selector, elem)); });
					return new domElementsObjects(ret, each);
				}else return new domElementsObjects(_dom.querySelectorAllWithEq(selector, this.elem), each);
			};

			this.clone			= function(){
				return this.elem.cloneNode(true);
			};
			this.before			= function(element){
				this.elem.insertAdjacentElement('beforebegin', element);
				return this;
			};
			this.after			= function(element){
				this.elem.insertAdjacentElement('afterend', element);
				return this;
			};
			this.remove			= function(){
				if(doEach) this.elems.forEach(function(elem){ elem.parentNode.removeChild(elem); });
				else this.elem.parentNode.removeChild(this.elem);
				return _dom();
			};

			this.empty			= function(){
				if(doEach) this.elems.forEach(function(elem){ while(elem.firstChild) elem.removeChild(elem.firstChild); });
				else{
					while(this.elem.firstChild) this.elem.removeChild(this.elem.firstChild);
				}
				return this;
			};
			this.append			= function(content){
				if(doEach) this.elems.forEach(function(elem){ elem.innerHTML += content; });
				else this.elem.innerHTML += content;
				return this;
			};
			this.prepend		= function(content){
				if(doEach) this.elems.forEach(function(elem){ elem.innerHTML = content + elem.innerHTML; });
				else this.elem.innerHTML = content + this.elem.innerHTML;
				return this;
			};
			this.html			= function(content){
				if(doEach) this.elems.forEach(function(elem){ elem.innerHTML = content; });
				else{
					if(content===undefined) return this.elem.innerHTML;
					else this.elem.innerHTML = content;
				}
				return this;
			};
			this.text			= function(content){
				if(doEach) this.elems.forEach(function(elem){ elem.textContent = content; });
				else{
					if(content===undefined) return this.elem.textContent;
					else this.elem.textContent = content;
				}
				return this;
			};
			this.outer			= function(value){
				if(doEach) this.elems.forEach(function(elem){ elem.outerHTML = value; });
				else{
					if(value===undefined) return this.elem.outerHTML;
					else this.elem.outerHTML = value;
				}
				return this;
			};

			this.attr			= function(name, value){
				if(doEach) this.elems.forEach(function(elem){ elem.setAttribute(name, value); });
				else{
					if(value===undefined) return this.elem.getAttribute(name);
					else this.elem.setAttribute(name, value);
				}
				return this;
			};
			this.data			= function(name, value){
				if(doEach) this.elems.forEach(function(elem){ elem.setAttribute('data-' + name, value); });
				else{
					if(value===undefined) return this.elem.getAttribute('data-' + name);
					else this.elem.setAttribute('data-' + name, value);
				}
				return this;
			};
			this.removeAttr		= function(name){
				if(doEach) this.elems.forEach(function(elem){ elem.removeAttr(name); });
				else this.elem.removeAttr(name);
				return this;
			};

			this.css			= function(ruleName, value){
				function domChangeCSS(elem, ruleName, value){
					if(value===undefined&&typeof ruleName === 'string'){
						return window.getComputedStyle(elem)[ruleName];
					}else{
						if(typeof ruleName === 'string') elem.style[ruleName] = value;
						else if(typeof ruleName === 'object'){
							for(var key in ruleName){
								elem.style[key] = ruleName[key];
							}
						}
					}
				}
				if(doEach) this.elems.forEach(function(elem){ domChangeCSS(elem, ruleName, value); });
				else domChangeCSS(this.elem, ruleName, value);
				return this;
			};
			this.offset			= function(){
				return this.elem.getBoundingClientRect();
			};
			this.height			= function(value){
				if(doEach) this.elems.forEach(function(elem){ elem.style.height = value + "px"; });
				else{
					if(value!==undefined) this.elem.style.height = value + "px";
					else return parseFloat(window.getComputedStyle(this.elem, null).height.replace("px", ""));
				}
				return this;
			};
			this.width			= function(value){
				if(doEach) this.elems.forEach(function(elem){ elem.style.width = value + "px"; });
				else{
					if(value!==undefined) this.elem.style.width = value + "px";
					else return parseFloat(window.getComputedStyle(this.elem, null).width.replace("px", ""));
				}
				return this;
			};

			this.on				= function(type, func){
				function domCreateOnEvent(elem, type, func){
					if(_dom.onFunctions[_dom(elem).path + '.on' + type]!==undefined) _dom(elem).off(type);
					_dom.onFunctions[_dom(elem).path + '.on' + type] = func.bind(new domElementsObjects(elem));
					if(elem.addEventListener){ elem.addEventListener(type, _dom.onFunctions[_dom(elem).path + '.on' + type], false); }
					else if(elem.attachEvent){ elem.attachEvent('on' + type, _dom.onFunctions[_dom(elem).path + '.on' + type]); }
				}
				if(doEach) this.elems.forEach(function(elem){ domCreateOnEvent(elem, type, func); });
				else domCreateOnEvent(this.elem, type, func);
				return this;
			};
			this.off			= function(type){
				function domRemoveOnEvent(elem, type){
					if(_dom.onFunctions[_dom(elem).path + '.on' + type]!==undefined){
						if(elem.removeEventListener){ elem.removeEventListener(type, _dom.onFunctions[_dom(elem).path + '.on' + type], false); }
						else if(elem.detachEvent){ elem.detachEvent('on' + type, _dom.onFunctions[_dom(elem).path + '.on' + type]); }
						_dom.onFunctions[_dom(elem).path + '.on' + type] = undefined;
					}
				}
				if(doEach) this.elems.forEach(function(elem){ domRemoveOnEvent(elem, type); });
				else domRemoveOnEvent(this.elem, type);
				return this;
			};
			this.trigger		= function(type){
				var event;
				if(document.createEvent){
					event = document.createEvent("HTMLEvents");
					event.initEvent(type, true, true);
					event.eventName = type;
				}else{
					event = document.createEventObject();
					event.eventName = type;
					event.eventType = type;
				}
				function domTriggerEvent(elem, type, event){
					if(document.createEvent) elem.dispatchEvent(event);
					else elem.fireEvent("on" + event.eventType, event);
				}
				if(doEach) this.elems.forEach(function(elem){ domTriggerEvent(elem, type, event); });
				else domTriggerEvent(this.elem, type, event);
				return this;
			};

			this.className		= function(className){
				if(doEach) this.elems.forEach(function(elem){ elem.className = className; });
				else{
					if(className===undefined) return this.elem.className;
					else this.elem.className = className;
				}
				return this;
			};
			this.hasClass		= function(className){
				if(doEach){
					var ret = true;
					this.elems.forEach(function(elem){ if(!elem.classList.contains(className)) ret = false; });
					return ret;
				}else return this.elem.classList.contains(className);
			};
			this.toggleClass	= function(className){
				if(doEach) this.elems.forEach(function(elem){ elem.classList.toggle(className); });
				else this.elem.classList.toggle(className);
				return this;
			};
			this.addClass		= function(className){
				if(doEach) this.elems.forEach(function(elem){ elem.classList.add(className); });
				else this.elem.classList.add(className);
				return this;
			};
			this.removeClass	= function(className){
				if(doEach) this.elems.forEach(function(elem){ elem.classList.remove(className); });
				else this.elem.classList.remove(className);
				return this;
			};

			this.hide			= function(){
				if(doEach) this.elems.forEach(function(elem){ elem.style.display = 'none'; });
				else this.elem.style.display = 'none';
				return this;
			};
			this.show			= function(){
				if(doEach) this.elems.forEach(function(elem){ elem.style.display = ''; });
				else this.elem.style.display = '';
				return this;
			};

			if(typeof _ajax === "function"){
				this.load			= function(uri, data, method){
					var elem = this.elem;
					var elems = this.elems;
					_ajax(uri, data, method, function(){
						var res = this.responseText;
						if(doEach) elems.forEach(function(elem){ elem.innerHTML = res; });
						else elem.innerHTML = res;
					});
					return this;
				};
			}
		}else{
			// Set all function without any code to avoid error when empty
			this.elem			= undefined;
			this.index			= null;
			this.each			= function(fn){ return this; };
			this.path			= function(){ return this; };
			this.is				= function(selector){ return this; };
			this.filter			= function(fn){ return this; };
			this.siblings		= function(selector){ return this; };
			this.first			= function(){ return this; };
			this.last			= function(){ return this; };
			this.eq				= function(id){ return this; };
			this.parent			= function(){ return this; };
			this.prev			= function(){ return this; };
			this.next			= function(){ return this; };
			this.children		= function(eq){ return this; };
			this.find			= function(selector, each){ return this; };
			this.clone			= function(){ return this; };
			this.before			= function(element){ return this; };
			this.after			= function(element){ return this; };
			this.remove			= function(){ return this; };
			this.empty			= function(){ return this; };
			this.append			= function(content){ return this; };
			this.prepend		= function(content){ return this; };
			this.html			= function(content){ return this; };
			this.text			= function(content){ return this; };
			this.outer			= function(value){ return this; };
			this.attr			= function(name, value){ return this; };
			this.data			= function(name, value){ return this; };
			this.removeAttr		= function(name){ return this; };
			this.css			= function(ruleName, value){ return this; };
			this.offset			= function(){ return this; };
			this.height			= function(value){ return this; };
			this.width			= function(value){ return this; };
			this.on				= function(params, param2){ return this; };
			this.off			= function(params){ return this; };
			this.trigger		= function(type){ return this; };
			this.className		= function(className){ return this; };
			this.hasClass		= function(className){ return this; };
			this.toggleClass	= function(className){ return this; };
			this.addClass		= function(className){ return this; };
			this.removeClass	= function(className){ return this; };
			this.hide			= function(){ return this; };
			this.show			= function(){ return this; };
			if(typeof _ajax === "function"){
				this.load			= function(uri, data, method){ return this; };
			}
		}
	}
	return new domElementsObjects(selector, doEach, index);
};

_dom.querySelectorAllWithEq	= function(selector, baseElement){
	if(baseElement===undefined) baseElement = document;
	var remainingSelector = selector;
	var firstEqIndex = remainingSelector.indexOf(':eq(');
	while(firstEqIndex !== -1){
		var leftSelector = remainingSelector.substring(0, firstEqIndex);
		var rightBracketIndex = remainingSelector.indexOf(')', firstEqIndex);
		var eqNum = remainingSelector.substring(firstEqIndex + 4, rightBracketIndex);
		eqNum = parseInt(eqNum, 10);
		var selectedElements = baseElement.querySelectorAll(leftSelector);
		if(eqNum >= 0){
			if(eqNum >= selectedElements.length) return [];
			baseElement = selectedElements[eqNum];
		}else{
			eqNum = selectedElements.length + eqNum;
			if(eqNum >= selectedElements.length) return [];
			baseElement = selectedElements[eqNum];
		}
		remainingSelector = remainingSelector.substring(rightBracketIndex + 1).trim();
		if(remainingSelector.charAt(0) === '>') remainingSelector = remainingSelector.substring(1).trim();
		firstEqIndex = remainingSelector.indexOf(':eq(');
	}
	if(remainingSelector !== '') return Array.from(baseElement.querySelectorAll(remainingSelector));
	return [baseElement];
};
_dom.start					= [];
_dom.visibilityChange		= [];
_dom.onFunctions			= [];
_dom.isVisible				= true;
_dom.isLoaded				= false;

_dom.onLoad					= function(){
	for(var i = 0; i < _dom.start.length; i++) _dom.start[i]();
	_dom.isLoaded = true;
	_dom.isPrivateProc(function(isPrivateMode){ _dom.isPrivate = isPrivateMode; });
};
_dom.onVisibilityChange		= function(callback){
	var visible = true;
	if (!callback) throw new Error('no callback given');
	function focused(){ if(!visible) callback(visible = true); }
	function unfocused(){ if(visible) callback(visible = false); }
	if('hidden' in document)		document.addEventListener('visibilitychange', function(){ (document.hidden ? unfocused : focused)(); });
	if('mozHidden' in document)		document.addEventListener('mozvisibilitychange', function(){ (document.mozHidden ? unfocused : focused)(); });
	if('webkitHidden' in document)	document.addEventListener('webkitvisibilitychange', function(){ (document.webkitHidden ? unfocused : focused)(); });
	if('msHidden' in document)		document.addEventListener('msvisibilitychange', function(){ (document.msHidden ? unfocused : focused)(); });
	if('onfocusin' in document){
		document.onfocusin	= focused;
		document.onfocusout	= unfocused;
	}
	window.onpageshow = window.onfocus	= focused;
	window.onpagehide = window.onblur	= unfocused;
};
_dom.isPrivateProc			= function(cb){
	var db, on = cb.bind(null, true), off = cb.bind(null, false)
	function tryls(){
		try { localStorage.length ? off() : (localStorage.x = 1, localStorage.removeItem("x"), off()); }
		catch (e){ navigator.cookieEnabled ? on() : off(); }
	}
	window.webkitRequestFileSystem ? webkitRequestFileSystem(0, 0, off, on) // Blink (chrome & opera)
	: "MozAppearance" in document.documentElement.style ? (db = indexedDB.open("test"), db.onerror = on, db.onsuccess = off) // FF
	: /constructor/i.test(window.HTMLElement) || window.safari ? tryls() // Safari
	: !window.indexedDB && (window.PointerEvent || window.MSPointerEvent) ? on() // IE10+ & edge
	: off() // Rest
};

_dom.isPrivate				= false;
_dom.isMobile				= /Mobi/.test(navigator.userAgent);
_dom.framed					= false;

_dom.ready					= function(fn){
	if(_dom.isLoaded) fn();
	else _dom.start.push(fn);
	return _dom;
};
_dom.visibility				= function(fn){
	_dom.visibilityChange.push(fn);
	return _dom;
};
_dom.on						= function(event, fn){
	switch(event.toUpperCase()){
		case 'READY': _dom.ready(fn); break;
		case 'VISIBILITY': _dom.visibility(fn); break;
	}
	return _dom;
};

_dom.addScript				= function(url, fn){
	if(typeof url == 'object'){
		url.forEach(function(item){ _dom.addScript(item); });
		return _dom;
	}else{
		var scriptTag = document.createElement('script');
		scriptTag.src = url;
		if(fn!==undefined){
			scriptTag.onload = fn;
			scriptTag.onreadystatechange = fn;
		}
		document.head.appendChild(scriptTag);
		return _dom;
	}
};
_dom.addCss					= function(url){
	if(typeof url == 'object'){
		url.forEach(function(item){ _dom.addCss(item); });
		return _dom;
	}else{
		var link	= document.createElement('link');
		link.rel	= 'stylesheet';
		link.href	= url;
		document.head.appendChild(link);
		return _dom;
	}
};
_dom.removeCss				= function(url){
	if(typeof url == 'object'){
		url.forEach(function(item){ _dom.removeCss(item); });
		return _dom;
	}else{
		_dom('link[rel="stylesheet"]').each(function(){
			if(this.href.indexOf(identifier) !== -1){
				this.parentNode.removeChild(el);
				return;
			}
		});
		return _dom;
	}
};
_dom.replaceCss				= function(identifier, uri){
	_dom('link[rel="stylesheet"]').each(function(){
		if(this.href.indexOf(identifier) !== -1){
			this.href = uri;
			return;
		}
	});
	return _dom;
};
_dom.reloadCss				= function(identifier){
	if(typeof url == 'object'){
		url.forEach(function(item){ _dom.reloadCss(item); });
		return _dom;
	}else{
		_dom('link[rel="stylesheet"]').each(function(){
			if(identifier!==undefined){
				if(this.href.indexOf(identifier) !== -1){
					this.href = this.href;
					return;
				}
			}else this.href = this.href;
		});
		return _dom;
	}
};

_dom.parse					= function(str){
	var tmp = document.implementation.createHTMLDocument();
	tmp.body.innerHTML = str;
	return tmp.body.children;
};

try{ _dom.framed = (window.self !== window.top); }
catch(e){ _dom.framed = true; }

_dom.onVisibilityChange(function(visible){
	_dom.isVisible = visible;
	for(var i = 0; i < _dom.visibilityChange.length; i++) _dom.visibilityChange[i](visible);
});
if(window.attachEvent){ window.attachEvent('onload', dom.onLoad); }
else{
	if(window.onload){
		var curronload = window.onload;
		var newonload = function(evt) {
			curronload(evt);
			_dom.onLoad(evt);
		};
		window.onload = newonload;
	}else{ window.onload = _dom.onLoad; }
}
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
var _gamepad = {
	controllers:		[],
	axis_margin:		0.4,
	activated:			false,
	players:			[],
	addplayer:			function(func, index, axis_margin){
		if(typeof func === 'object'){
			if(func.axis_margin!==undefined){
				axis_margin = func.axis_margin;
				delete func.axis_margin;
			}
			if(func.index!==undefined){
				index = func.index;
				delete func.index;
			}
		}
		if(index===undefined) index = -1;
		if(axis_margin===undefined) axis_margin = _gamepad.axis_margin;
		_gamepad.activate();
		_gamepad.scangamepads();
		_gamepad.players.push({ index: index, connected: false, proc: func, buttons: [], axes: [], axis_margin: axis_margin });
		return _gamepad.players.length - 1;
	},
	haveEvents:			'GamepadEvent' in window,
	activate:			function(){
		if(_gamepad.activated) return;
		if(_gamepad.haveEvents){
			window.addEventListener("gamepadconnected", _gamepad.connecthandler);
			window.addEventListener("gamepaddisconnected", _gamepad.disconnecthandler);
		}else setInterval(_gamepad.scangamepads, 500);
		window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		window.requestAnimationFrame(_gamepad.updateStatus);
		_gamepad.scangamepads();
		_gamepad.activated = true;
	},
	scangamepads:		function(){
		var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
		for(var i = 0; i < gamepads.length; i++){
			if(gamepads[i]){
				if(!(gamepads[i].index in _gamepad.controllers)) _gamepad.addgamepad(gamepads[i]);
				else _gamepad.controllers[gamepads[i].index] = gamepads[i];
			}
		}
	},
	addgamepad:			function(gamepad){
		_gamepad.controllers[gamepad.index] = gamepad;
		window.requestAnimationFrame(_gamepad.updateStatus);
	},
	connecthandler:		function(e){ _gamepad.addgamepad(e.gamepad); },
	disconnecthandler:	function(e){ delete _gamepad.controllers[e.gamepad.index]; },
	associateGamepad:	function(index_p, index_c, controller){
		_gamepad.players[index_p].index = index_c;
		var controller_b = _gamepad.formatController(controller);
		_gamepad.players[index_p].connected = true;
		if(typeof _gamepad.players[index_p].proc == 'object'){
			if(typeof _gamepad.players[index_p].proc.connected == 'function') _gamepad.players[index_p].proc.connected.bind(controller_b)();
			if(_gamepad.players[index_p].proc.buttonDown===undefined) _gamepad.players[index_p].proc.buttonDown = [];
			if(_gamepad.players[index_p].proc.buttonRepeat===undefined) _gamepad.players[index_p].proc.buttonRepeat = [];
			if(_gamepad.players[index_p].proc.buttonUp===undefined) _gamepad.players[index_p].proc.buttonUp = [];
		}
	},
	formatController:	function(controller){
		var controller_b = {
			id: controller.id,
			index: controller.index,
			axes: [],
			buttons: []
		};
		for(var i=0; i<controller.axes.length; i++){
			controller_b.axes.push(controller.axes[i]);
		}
		for(var i=0; i<controller.buttons.length; i++){
			var val = controller.buttons[i];
			var pressed = (val == 1.0);
			if(typeof val == 'object') pressed = val.pressed;
			controller_b.buttons.push(pressed);
		}
		return controller_b;
	},
	updateStatus:		function(){
		_gamepad.scangamepads();
		for(var index_p in _gamepad.players){
			var controller;
			if(_gamepad.players[index_p].index==-1){
				for(var index_p2 in _gamepad.players){
					if(_gamepad.players.index==index_p) return;
				}
				for(var index_c in _gamepad.controllers){
					controller = _gamepad.controllers[index_c];
					for(var i=0; i<controller.axes.length; i++){
						if(controller.axes[i]>_gamepad.players[index_p].axis_margin||controller.axes[i]<-_gamepad.players[index_p].axis_margin){
							_gamepad.associateGamepad(index_p, index_c, controller);
							window.requestAnimationFrame(_gamepad.updateStatus);
							return;
						}
					}
					for(var i=0; i<controller.buttons.length; i++){
						var val = controller.buttons[i];
						var pressed = (val == 1.0);
						if(typeof val == 'object') pressed = val.pressed;
						if(pressed){
							_gamepad.associateGamepad(index_p, index_c, controller);
							window.requestAnimationFrame(_gamepad.updateStatus);
							return;
						}
					}
				}
			}else if(_gamepad.controllers[_gamepad.players[index_p].index]===undefined){
				if(_gamepad.players[index_p].connected){
					_gamepad.players[index_p].connected = false;
					if(typeof _gamepad.players[index_p].proc.disconnected == 'function') _gamepad.players[index_p].proc.disconnected.bind(null, index_p)();
				}
			}else{
				controller = _gamepad.controllers[_gamepad.players[index_p].index];
				var controller_b = _gamepad.formatController(controller);
				if(!_gamepad.players[index_p].connected){
					_gamepad.players[index_p].connected = true;
					if(typeof _gamepad.players[index_p].proc.connected == 'function') _gamepad.players[index_p].proc.connected.bind(controller_b)();
				}
				if(typeof _gamepad.players[index_p].proc == 'function') _gamepad.players[index_p].proc.bind(controller_b)();
				else{
					if(typeof _gamepad.players[index_p].proc.updateStatus == 'function') _gamepad.players[index_p].proc.updateStatus.bind(controller_b)();
					else{
						for(var i=0; i<controller.axes.length; i++){
							if(_gamepad.players[index_p].axes[i]===undefined) _gamepad.players[index_p].axes.push(false);
							if(controller.axes[i]>_gamepad.players[index_p].axis_margin||controller.axes[i]<-_gamepad.players[index_p].axis_margin){
								if(!_gamepad.players[index_p].axes[i]){
									if(_gamepad.players[index_p].proc.axeEnter!== undefined && typeof _gamepad.players[index_p].proc.axeEnter[i] == 'function') _gamepad.players[index_p].proc.axeEnter[i].bind(controller_b, controller.axes[i])();
									if(_gamepad.players[index_p].proc.waitForAxe!== undefined){
										_gamepad.players[index_p].proc.waitForAxe.bind(null, index_p, i)();
										delete _gamepad.players[index_p].proc.waitForAxe;
									}
									_gamepad.players[index_p].axes[i] = true;
								}else if(_gamepad.players[index_p].proc.axeMove!== undefined && typeof _gamepad.players[index_p].proc.axeMove[i] == 'function') _gamepad.players[index_p].proc.axeMove[i].bind(controller_b, controller.axes[i])();
							}else if(_gamepad.players[index_p].axes[i]){
								if(_gamepad.players[index_p].proc.axeLeave!== undefined && typeof _gamepad.players[index_p].proc.axeLeave[i] == 'function') _gamepad.players[index_p].proc.axeLeave[i].bind(controller_b)();
								_gamepad.players[index_p].axes[i] = false;
							}
						}
						for(var i=0;i<controller_b.buttons.length; i++){
							if(_gamepad.players[index_p].buttons[i]===undefined) _gamepad.players[index_p].buttons.push(false);
							if(!_gamepad.players[index_p].buttons[i]&&controller_b.buttons[i]){
								if(_gamepad.players[index_p].proc.buttonDown !== undefined && typeof _gamepad.players[index_p].proc.buttonDown[i] == 'function') _gamepad.players[index_p].proc.buttonDown[i].bind(controller_b)();
								if(_gamepad.players[index_p].proc.waitForButton!== undefined){
									console.log('return Button')
									_gamepad.players[index_p].proc.waitForButton.bind(null, index_p, i)();
									delete _gamepad.players[index_p].proc.waitForButton;
								}
								_gamepad.players[index_p].buttons[i] = true;
							}else if(_gamepad.players[index_p].buttons[i]&&controller_b.buttons[i]){
								if(_gamepad.players[index_p].proc.buttonRepeat !== undefined && typeof _gamepad.players[index_p].proc.buttonRepeat[i] == 'function') _gamepad.players[index_p].proc.buttonRepeat[i].bind(controller_b)();
							}else if(_gamepad.players[index_p].buttons[i]&&!controller_b.buttons[i]){
								if(_gamepad.players[index_p].proc.buttonUp !== undefined && typeof _gamepad.players[index_p].proc.buttonUp[i] == 'function') _gamepad.players[index_p].proc.buttonUp[i].bind(controller_b)();
								_gamepad.players[index_p].buttons[i] = false;
							}
						}
					}
				}
			}
		}
		window.requestAnimationFrame(_gamepad.updateStatus);
	}
};
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
			if(bool)	_string.iRightLast = source.substr(0, source.lenght - search.lenght);
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
var _url = {
	root: window.location.protocol + '//' + window.location.hostname + window.location.pathname,
	host: window.location.hostname,
	href: function(url, withTitle){
		if(url===undefined) return document.location.href;
		if(url=="/") url = "";
		if(withTitle!==null&&withTitle) document.title = this.domain.substring(0, 1) + '/' + url; // ⚛
		try{ if(window.history) history.pushState("data", "", this.root + url); }catch(e){}
	},
	GET: function(name, url){
		if(url===undefined) url = document.location.href;
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(url);
		return results === null ? null : results[1];
	}
};
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
