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