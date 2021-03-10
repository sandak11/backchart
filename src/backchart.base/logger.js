/*********************************************************************************
*     File Name           :     log.js
*     Created By          :     Jone Casper(xu.chenhui@live.com)
*     Creation Date       :     [2014-03-24 23:16]
*     Last Modified       :     [2014-04-06 05:17]
*     Description         :     logger for backchart
**********************************************************************************/
(function(root, name, factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return factory();
		});
	}else if (typeof module !== 'undefined' && module.exports && typeof require === 'function'){
		module.exports = factory();
	}else{
		var namespaces = name.split("."),
		scope = root || this;
		for (var i=0; i<namespaces.length; i++) {
			var p = namespaces[i],
				ex = scope[p];
			scope = scope[p] = (i === namespaces.length - 1) ?
				factory():
				(ex || {});
		}
	}
}(this, "backchart.base.logger", function() {
    if (!window.console){
        var f = function(msg){
            window.alert(msg);
        };
        window.console = {
            log: f,
            info: f,
            warn: f,
            debug: f,
            error: f
        };
    }
    return window.console;
}));
