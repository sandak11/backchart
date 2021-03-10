/*********************************************************************************
*     File Name           :     collection.js
*     Created By          :     Jone Casper(xu.chenhui@live.com)
*     Creation Date       :     [2014-04-08 10:19]
*     Last Modified       :     [2014-04-09 06:50]
*     Description         :     Backchart collection for Baidu Echarts
**********************************************************************************/

(function(root, name, factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define(['jquery','../backchart.base/collection'], function($, base) {
			return factory($, base);
		});
	}else if(typeof module !== 'undefined' && module.exports && typeof require === 'function'){
		var $ = require("jquery"),
		base = require("../backchart.base/collection");
		module.exports = factory($, base);
	}else{
		var namespaces = name.split("."),
		scope = root || this;
		for (var i=0; i<namespaces.length; i++) {
			var p = namespaces[i],
				ex = scope[p];
			scope = scope[p] = (i === namespaces.length - 1) ?
				factory(
					(root.jQuery || window.jQuery),
					root.backchart.base.collection
				):
				(ex || {});
		}
	}
}(this, "backchart.echarts.collection", function($, basecollection) {
    /**
     * Backchart Echarts collection
     * One collection represent for one series and the data in series will be created by the models in this collection
     * You can set the attribute in new the Object or in renderOptions when bind to view.
     *
	 * @module echarts/collection
	 * @requires jquery
	 * @requires base/collection
	 * @this {Backbone.Collection}
     */
    var exports = basecollection.extend(
	   /** @lends module:echarts/model.prototype */
       {
            constructor: function(options){
                this._options = $.extend(true, {}, options);

			    basecollection.apply(this, arguments);
            }
    });
    return exports;
}));

