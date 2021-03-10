/*********************************************************************************
*     File Name           :     collection.js
*     Created By          :     Jone Casper
*     Creation Date       :     [2014-03-05 18:37]
*     Last Modified       :     [2014-04-08 10:31]
*     Description         :     Backchart collection for amcharts
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
}(this, "backchart.amcharts.collection", function($, basecollection) {
	/**
	 * Backbchart amcharts collection 
	 *
	 * One collection will contained one or more amcharts models.When you bind one collection to an view, the renderOptions corresponding to the graphs + valueAxes(GaugeAxis) options.The categoryAxis will be set in view because one chart only have one categoryAxis!
	 * About renderOptions configuration detail, please see [amcharts/view.onCollection]{@link amcharts/view:amcharts.onCollection}
	 * @module amcharts/collection
	 * @requires jquery
	 * @requires base/collection
	 * @this {Backbone.Collection}
	 */
	var backchartAmchartsCollection = basecollection.extend(
		/** 
		* @lends module:amcharts/collection.prototype 
		*/
		{
	});
	return backchartAmchartsCollection;
}));
