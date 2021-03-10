/*********************************************************************************
 *     File Name           :     model.js
 *     Created By          :     Jone Casper
 *     Creation Date       :     [2014-02-11 10:48]
 *     Last Modified       :     [2014-03-06 11:07]
 *     Description         :     Backchart model for canvasJS
 **********************************************************************************/
(function(root, name, factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define(['jquery','../backchart.base/model'], function($, base) {
			return factory($, base);
		});
	}else if(typeof module !== 'undefined' && module.exports && typeof require === 'function'){
		var $ = require("jquery"),
		base = require("../backchart.base/model");
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
					 root.backchart.base.model
				):
				(ex || {});
		}
	}
}(this, "backchart.canvasjs.model", function($, basemodel) {
	/**
	* Backbone chart CanvasJS model
	* @module canvasjs/model
	* @requires jquery
	* @requires base/model  
	* @this {Backbone.Model}
	*/ 
	var backchartCanvasJSModel = basemodel.extend(
		/** @lends module:canvasjs/model.prototype */
		{
		_setAlias: function(obj, key, alias){
			if (typeof obj[key] !== "undefined"){
				obj[alias] = obj[key];
			}
		},
		constructor: function(attributes, options){
			options = options || {};
			options.parse = this.parse;
			return basemodel.prototype.constructor.apply(this, [attributes, options]);
		},
        /**
         * The default parse function
		 *
		 * Here is some fast assignment method existed ,you can set the "x" field via declaration attribute called xField
		 * The follow example list all fast assignment attributes.
         * @example
		 * xFiled : x
		 * yField : y
		 * labelField : label
         * @param {Object} response
         * @return {Object}
         */
		parse: function(response){
			if (this.xField){
				this._setAlias(response, this.xField, 'x');
				if (this.timestamp){
					response['x'] = response['x'] * 1000;
				}
			}
			if (this.yField){
				this._setAlias(response, this.yField, 'y');
			}
			if (this.labelField){
				if (typeof this.labelField === "string"){
					this._setAlias(response, this.labelField, 'label');
				}else if (typeof this.labelField === "function"){
					this.labelField.call(response);
				}
			}
			return response;
		}
	});
	return backchartCanvasJSModel;
}));

