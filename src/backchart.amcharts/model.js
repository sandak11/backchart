/*********************************************************************************
*     File Name           :     model.js
*     Created By          :     Jone Casper
*     Creation Date       :     [2014-03-05 18:37]
*     Last Modified       :     [2014-04-08 09:43]
*     Description         :     Backchart model for amcharts
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
}(this, "backchart.amcharts.model", function($, basemodel) {
	/**
	* Backchart amcharts model
	*
	* One model represent for a MapData in dataProvider Array
	* You can set categoryField,valueField,labelField,colorField in model and item will be set to the default value when rendering
	* @module amcharts/model
	* @requires jquery
	* @requires base/model  
	* @this {Backbone.Model}
	*/ 
   var backchartAmchartsModel = basemodel.extend(
	   /** @lends module:amcharts/model.prototype */
	   {
	   /**
		* categoryField which defined the name of category field.
		*/
	   categoryField: null,
	   /**
		* valueField which defined the name of value field.
		*/
	   valueField: null,
	   /**
		* Color field define 
		*/
	   colorField: null,
	   /**
		*
		* Set the Date string format for categoryField
		*/
	   dataDateFormat: null
   });
   return backchartAmchartsModel;
}));

