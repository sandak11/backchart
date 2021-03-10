/*********************************************************************************
 *     File Name           :     view.js
 *     Created By          :     Jone Casper
 *     Creation Date       :     [2014-02-11 10:50]
 *     Last Modified       :     [2014-04-09 00:56]
 *     Description         :     Backchart view for canvasJS
 **********************************************************************************/
(function(root, name, factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define(['jquery','../backchart.base/view','backbone',"underscore","CanvasJS"], function($, base, Backbone, _, canvasjs) {
			canvasjs = canvasjs || window.CanvasJS;
			return factory($, Backbone, _, base, canvasjs);
		});
	}else if(typeof module !== 'undefined' && module.exports && typeof require === 'function'){
		var $ = require("jquery"),
		base = require("../backchart.base/view"),
		Backbone = require("backbone"),
		_ = require("underscore"),
		canvasjs = require("CanvasJS") || window.CanvasJS;
		module.exports = factory($, Backbone, _, base, canvasjs);
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
					(root.Backbone|| window.Backbone),
					(root._ || window._),
					root.backchart.base.view,
					(root.CanvasJS || window.CanvasJS)
				):
				(ex || {}); 
		}
	}
}(this, "backchart.canvasjs.view", function($, Backbone, _, baseview, CanvasJS) {
	/**
	 * Backbone chart CanvasJS view
	 * @module canvasjs/view
	 * @requires jquery
	 * @requires base/view
	 * @requires backbone
	 * @requires CanvasJS 
     * @this {Backbone.View}
     */
	var backchartCanvasJSView = baseview.extend(
		/** 
		* @lends module:canvasjs/view.prototype 
		*/
		{
		/**
		 * The default render options
		 * @static
		 */
		defaultRenderOptions :{
			type: "column"
		},
		/**
		 * initialize
         * @return {Backbone.View}
		 */
		initialize: function(defaultOptions, defaultRenderOptions) {
			baseview.prototype.initialize.apply(this, arguments);
			this.defaultOptions = $.extend(true, {}, this.defaultOptions, defaultOptions);
			this.defaultRenderOptions = $.extend(true, {}, this.defaultRenderOptions, defaultRenderOptions);
			return this;
		},
		/**
		 * Transform the renderOptions to the options of CanvasJS
         *
		 * @param {(backchart.base.collection|Backbone.Collection)} collection
         * @param {Object} renderOptions
         * @return {Object} the options that can be accepted by CanvasJS library
         */
		transformData: function(collection, renderOptions){
			var me = this,
			dataPoints = [],
			ro = $.extend(true, {}, me.defaultRenderOptions, renderOptions);
			collection.each(function(model) {
				if (collection.isVisibled(model)){
					var dataPoint = _.clone(model.attributes);
					dataPoints.push(dataPoint);
				}
			});
			ro.dataPoints = dataPoints;
			return ro;
		},
        /**
         * The render function
         *
		 * @fires module:canvasjs/view#beforeRender
		 * @fires module:base/view#rendered
         * @return {Object} this instance
         */
		render: function(){
			var me = this;
			var rret = baseview.prototype.renderBefore.apply(me, arguments);
			if (!rret){
				return false;
			}
			//initialization el id 
			if (!me.el.id){
				me.el.id = _.uniqueId(me._viewPrefix || "_bcname");
			}
			var renderOptions = _.clone(me.defaultOptions);
			renderOptions.data = [];
			me.eachCollection(function(uid, collection, renderOption, options){
				if (collection._silence || options.visible === false){
					return;
				}
				renderOptions.data.push(me.transformData(collection, renderOption));
			});

			//trigger beforeRender event
			me.trigger("beforeRender", me, me.el.id, renderOptions);

			me.$container.empty().append(me.$el.empty());
			me.elFillParents();
			me.Chart = new CanvasJS.Chart(me.el.id, renderOptions);
			me.__cOptions = renderOptions;
			me.Chart.render();

			return baseview.prototype.renderAfter.apply(me, [me, me.el, me.Chart, renderOptions]);
		},
		/**
		 * A event triggered before render chart.
		 * @event module:canvasjs/view#beforeRender
		 * @type {object}
		 * @property {Backbone.View} view view instance
		 * @property {string} elId Element's ID
		 * @property {object} renderOptions options for rendering
		 */

		/**
		 * Implement [getChartOptions]{@link base/view:getChartOptions}
		 */
		getChartOption: function(){
			return this.__cOptions;
		}
	});
	return backchartCanvasJSView;
}));
