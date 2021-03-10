/*********************************************************************************
 *     File Name           :     collection.js
 *     Created By          :     Jone Casper
 *     Creation Date       :     [2014-02-11 10:46]
 *     Last Modified       :     [2014-03-09 19:18]
 *     Description         :     Backchart collection for canvasJS
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
		//scope = (root.jQuery || root.ender || root.$ || root || this),
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
}(this, "backchart.canvasjs.collection", function($, basecollection) {
	/**
	 * Backbone chart CanvasJS collection 
	 * @module canvasjs/collection
	 * @requires jquery
	 * @requires base/backbone
	 * @this {Backbone.Collection}
	 */
	var backchartCanvasJSCollection = basecollection.extend(
		/** 
		* @lends module:canvasjs/collection.prototype 
		*/
		{});
	return backchartCanvasJSCollection;
}));
