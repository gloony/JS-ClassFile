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