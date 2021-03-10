/*********************************************************************************
*     File Name           :     model.js
*     Created By          :     Jone Casper
*     Creation Date       :     [2014-03-05 18:37]
*     Last Modified       :     [2014-04-09 21:57]
*     Description         :     Backchart model for Baidu Echarts 
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
}(this, "backchart.echarts.model", function($, basemodel) {
	/**
	* Backbone model for Baidu Echarts
	*
	* One model represent for one data in Echarts's series.
    * The categoryField attribute will be summarized and fill to the legend data for representing the category in Pie or xAxis in Line or Bar
    * The valueField attribute will be filled to the series's data.If it's null or undefined, it will be set zero.
    *
	* @module echarts/model
	* @requires jquery
	* @requires base/model  
	* @this {Backbone.Model}
	*/ 
   var exports = basemodel.extend(
	   /** @lends module:amcharts/model.prototype */
	   {
	   /**
		* categoryField which defined the name of category field.
		*/
	   categoryField: null,
	   /**
		* valueField which defined the name of value field.
		*/
	   valueField: null
   });
   return exports;
}));

