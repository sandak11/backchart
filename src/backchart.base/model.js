/*********************************************************************************
 *     File Name           :     model.js
 *     Created By          :     Jone Casper
 *     Creation Date       :     [2014-02-11 10:42]
 *     Last Modified       :     [2014-02-24 00:56]
 *     Description         :     Backchart basic backbone model
 **********************************************************************************/
(function(root, name, factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define(['jquery','backbone'], function($, Backbone) {
			return factory($, Backbone);
		});
	}else if(typeof module !== 'undefined' && module.exports && typeof require === 'function'){
		var $ = require("jquery"),
		Backbone = require("backbone");
		module.exports = factory($, Backbone);
	}else{
		var namespaces = name.split("."),
		//scope = (root.jQuery || root.ender || root.$ || root || this);
		scope = root || this;
		for (var i=0; i<namespaces.length; i++) {
			var p = namespaces[i],
				ex = scope[p];
			scope = scope[p] = (i === namespaces.length - 1) ?
				factory(
					(root.jQuery || window.jQuery), 
				    (root.Backbone || window.Backbone),
                                    (root.Application || window.Application || root.Backbone || window.Backbone)
				):
				(ex || {});
		}
	}
}(this, "backchart.base.model", function($, Backbone, Application) {
	/**
	* Backbone chart base model
	* @module base/model
	* @requires jquery
	* @requires backbone
	* @this {Backbone.Model}
	*/                     
	var chartBaseModel = Application.Model.extend(
		/** @lends module:base/model.prototype */
		{});
	return chartBaseModel;
}));
