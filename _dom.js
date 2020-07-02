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