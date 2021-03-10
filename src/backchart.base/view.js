/*********************************************************************************
 *     File Name           :     view.js
 *     Created By          :     Jone Casper
 *     Creation Date       :     [2014-02-01 10:39]
 *     Last Modified       :     [2014-04-09 07:17]
 *     Description         :     Backchart basic backbone view
 **********************************************************************************/
(function(root, name, factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define(['jquery','backbone',"underscore"], function($, Backbone, _) {
			return factory($, Backbone, _);
		});
	}else if (typeof module !== 'undefined' && module.exports && typeof require === 'function'){
		var $ = require("jquery"),
		_ = require("underscore"),
		Backbone = require("backbone");
		module.exports = factory($, Backbone, _);
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
					(root._ || window._),
                                        (root.Application || window.Application || root.Backbone || window.Backbone)
				):
				(ex || {});
		}
	}
}(this, "backchart.base.view", function($, Backbone, _, Application) {
    /**
	 * Backbone chart base view
	 * @module base/view
	 * @requires jquery
	 * @requires backbone
     * @this {Backbone.View}
     */
	var chartBaseView = Application.View.extend(
		/** 
		* @lends module:base/view.prototype 
		*/
		{
		tagName: "div",
		/**
		* The element default class name
		* @type {string}
		*/ 
		className: "backchart",
		/**
		* The collection bind ID prefix
		* @type {string}
		* @protected
		*/
		_collectionPrefix: "_bcname",
		/**
		 * The view's element ID prefix
		 */
		_viewPrefix: "_bcview",
		/**
		 * The element which the view's element append to.
		 * @type {element}
		 */
		container: null,
		/**
		 * To define the callback of event which has listened to collection
		 * @type {Object}
		 * @example Appoint to the callback of set event
		 * eventCallback :{
		 *   "set" : "setCallback"
		 * }
		 */
		eventCallback: {
			"default" : "render"
		},
        /**
		 * Return the callback event from eventCallback
		 *
		 * @private
         * @param {string} eventName
         * @return {function} callback function
         */
		_getEventCallback: function(eventName){
			var callbackName = this.eventCallback[eventName] || this.eventCallback["default"];
			return callbackName ? this[callbackName] : this.render;
		},
		/**
		 * The silence flag which can suspend responding events from all bind collections when be set to true.
		 * It can be used when you refresh or set lots of data to avoid to draw repeatedly.
		 * Normally ,chart will be rendered many times because sync/set function will create many add/remove events in backbone when batch processing. You can set it to true for closing auto-redraw in view.
		 * If you set the flag personally ,you should remember recover it to default after all operation has done.
		 *
		 * @param {boolean} flag
		 */
		setSilence: function(flag){
			this._silence = flag;
		},
		/**
		 * Collection is visible or not
		 *
		 * @private
		 * @param  {(string|backchart.base.collection|Application.Collection)} bindIdOrCollection
		 *    If it's a string ,will hide the graph that the bind ID correspond with.
		 *    If it's a Collection instance, will hide all graphs rendered by this data source.
		 * @return {backchart.base.view} this instance
		 */
		_setVisible: function(bindIdOrCollection, visible){
			var me = this;
			if (typeof bindIdOrCollection === "string" || bindIdOrCollection instanceof String){
				var bc = me._collectionOptions[bindIdOrCollection];
				if (bc){
					bc.visible = visible;
				}
			}else if (bindIdOrCollection instanceof Application.Collection){
				me.eachCollection(function(uid, collection, rdOptions, options){
					if (collection === bindIdOrCollection){
						options.visible = visible;
					}
				});
			}
			me.render();
			return me;
		},
		/**
		 * Hide a set of data graph
		 * @param  {(string|backchart.base.collection|Application.Collection)} bindIdOrCollection
		 * @return {backchart.base.view} this instance
		 */
		hide: function(bindIdOrCollection){
			return this._setVisible(bindIdOrCollection, false);
		},
		/**
		 * Show a set of data points
		 * @param  {(string|backchart.base.collection|Application.Collection)} bindIdOrCollection
		 * @return {backchart.base.view} this instance
		 */
		show: function(bindIdOrCollection){
			return this._setVisible(bindIdOrCollection, true);
		},
		/**
		 * Check a graph visible status
		 * @param  {(string|backchart.base.collection|Application.Collection)} bindIdOrCollection
		 * @return {boolean}
		 */
		isVisibled: function(bindIdOrCollection){
			var me = this;
			if (typeof bindIdOrCollection=== "string" || bindIdOrCollection instanceof String){
				var bc = me._collectionOptions[bindIdOrCollection];
				return bc ? bc.visible : false;
			}else if (bindIdOrCollection instanceof Application.Collection){
				var Options = {};
				me.eachCollection(function(uid, collection, renderOption, options){
					if (collection === bindIdOrCollection){
						Options[uid] = options ? options.visible : false;
					}
				});
				return Options;
			}
		},
		/**
		 * initialize
         * @return {Backbone.View}
		 */
		initialize: function(){
			var me = this;
			me._silence = false;
			Backbone.View.prototype.initialize.apply(this, arguments);

			//initialize collections
			me.collections = {};
			me._collectionOptions = {};
			me._collectionRenderOptions = {};

			//bind on and off events
			this.on("collection.on", function(unid, collection, renderOpt, options){
				if (options.renderAfterOn === true){
					me.render(true);
				}
			});
			this.on("collection.off", function(){
				me.render(true);
			});

			// When a custom event named "destroyed" is fired, clear the collection and chart
			this.on("destroyed", function () {
				me.clearCollection();

				if (me.Chart) {
					me.Chart.clear();
				}
			});
		},
		__bce: function(unid, evearr, collection){
			var me = this;
			_.each(evearr, function(eve){
				me.listenTo(collection, eve, me._getEventCallback(eve));
				//collection.on(eve+":"+unid, me._getEventCallback(eve));
				//collection.on(eve, me._getEventCallback(eve));
			});
		},
		__ubce: function(unid, evearr, collection){
			var me = this;
			_.each(evearr, function(eve){
				//collection.off(eve+":"+unid, me._getEventCallback(eve));
				collection.off(eve, me._getEventCallback(eve));
			});
		},
		_getBindEvents:function(collection){
			var listenEvents = ['set','add','change','destroy','reset','sort'];
			if (typeof collection._backchart !== "undefined"){
				listenEvents = ['seted','removed','change','destroy','reseted','sort',"change:visible"];
			}
			return listenEvents;
		},
        /**
		 * Listen to one collection events
         *
		 * @protected
         * @param {string} unid
		 * @param  {(backchart.base.collection|Application.Collection)} collection
         * @param {Object} options
         */
		_bindCollectionEvent: function(unid, collection, options){
			if (options.silence === true){
				return;
			}
			this.__bce(unid, 
					   this._getBindEvents(collection),
					   collection);
		},
		/**
		 * Remove listener on one collection
         *
		 * @protected
         * @param {string} unid
		 * @param  {(backchart.base.collection|Application.Collection)} collection
         */
		_unbindColletionEvent: function(unid, collection){
			this.__ubce(unid, 
						this._getBindEvents(collection),
						collection);
		},
        /**
         * Determine whether an collection has be listened to
         *
		 * @param  {(backchart.base.collection|Application.Collection)} collection
         * @return {boolean}
         */
		_collectionHasBind: function(collection){
			for(var uid in this.collections){
				if (this.collections[uid] === collection){
					return true;
				}
			}
			return false;
		},
		/**
		 * Bind one collection to this view
		 * The collection will be listened to the following events if it's inherit from backchart.base.collection.
		 * 'seted','removed','change','destroy','reseted','sort','change:visible'
		 * Otherwise, the following events will be listend to.
		 * 'set','add','change','destroy','reset','sort'
		 *
		 * @param {(backchart.base.collection|Application.Collection)} collection
		 * @param {Object} renderOptions render chart options which based what chart library you used.
		 * @param {Object} options
		 * @param {string} [options.bid] a unique id as the bind ID
		 * @param {boolean} [options.silence=false] not responded to any event from this collection
		 * @param {boolean} [options.visible=true] Display or not, you can use hide/show function to dynamic control.
		 * @param {boolean} [options.renderAfterOn=false] redraw the chart after finished to bind.
		 * @return {string} a bind ID
		 */
		onCollection: function(collection, renderOptions, options){
			renderOptions = renderOptions || {};
			options = options || {};
			var me = this,
			unid =	options.bid || _.uniqueId(me._collectionPrefix);

			if (!collection instanceof Application.Collection){
				return;
			}	    
			//bind collection
			if (!me._collectionHasBind(collection)){
				me._bindCollectionEvent(unid, collection, options);
				me.trigger("collection.bindEvent", collection);
			}
			//add collection to my collections
			me.collections[unid] = collection;

			//set render options
			var _rdOptions = _.clone(renderOptions);
			me._collectionOptions[unid] = options;
			me._collectionRenderOptions[unid] = _rdOptions;
			//trigger collection.add event
			me.trigger("collection.on", unid, collection, _rdOptions, options);
			return unid;
		},
		/**
		 * Bind one or more collections
         *
		 * @param {(backchart.base.collection[]|Application.Collection[])} collections
         * @param {Object} renderOptions same as onCollection
         * @param {Object} options same as onCollection
		 * @return {Object} The key of this return is the collection instance and the value is the bind ID assigned.
         */
		onCollections: function(collections, renderOptions, options){
			var me = this;
			if (!collections instanceof Array){
				collections = [collections];
			}
			var bid = {};
			_.each(collections, function(collection){
				bid[collection] = me.onCollection(collection, renderOptions, options);
			});
			return bid;
		},
		/**
		 * Remove one collection from the view
		 * @param {(string|backchart.base.collection|Application.Collection)} unid pass the bind ID or collection instance in here.If convey a collection instance to, we will remove all bind configure about this collection.
		 * @return {(backchart.base.collection|Application.Collection)} the collection instance or null
		 */
		unCollection: function(unid){
			var me = this,
			collection = null;
			if (typeof unid === "string" || unid instanceof String){
				collection = me.collections[unid];
				if (collection){
					delete me.collections[unid];
					var _rdOptions = me._collectionRenderOptions[unid];
					var _options = me._collectionOptions[unid];
					delete me._collectionRenderOptions[unid];
					delete me._collectionOptions[unid];
					/*
					 * If collection not exist in this
					 */
					if (!me._collectionHasBind(collection)){
						me._unbindColletionEvent(unid, collection);
						me.trigger("collection.unbindEvent", collection);
					}
					me.trigger("collection.off", unid, collection, _rdOptions, _options);
				}
				return collection;
			}else if (unid instanceof Application.Collection){
				var removeUnids = [];
				collection = unid;
				for(var uid in me.collections){
					if (me.collections[uid] === collection){
						removeUnids.push(uid);
					}
				}
				_.each(removeUnids, function(unid){
					me.unCollection(unid);
				});
				return collection;
			}
		},
		/**
		 * Remove all collections has binded to the view
		 *
         * @return {backchart.base.view} this instance
		 */
		clearCollection: function(){
			var me = this;
			var unids = _.keys(this.collections);
			_.each(unids, function(unid){
				me.unCollection(unid);
			});
			return this;
		},
		/**
		 * A generic iterator function, which can be used to seamlessly iterate collection has binded in this view
		 * This function same as the [jQuery.each]{@link https://api.jquery.com/jQuery.each/} function.The callback is passed an bind ID, the instance of collection, the render options and the config options.The this always as an collection currently in callback function.
		 * @param {eachCallback} eachcb - The callback that handles the response.
		 */
		eachCollection: function(fn){
			var me = this;
			for(var uid in me.collections){
				fn.call(me.collections[uid], uid, me.collections[uid], me._collectionRenderOptions[uid], me._collectionOptions[uid]);
			}
		},
		/**
		* The callback of eachCollection
		* @callback eachCallback
		* @param {string} bid the bind ID
		* @param {(backchart.base.collection|Application.Collection)} collection the collection instance
		* @param {Object} renderOptions same as onCollection
        * @param {Object} options same as onCollection
		*/

		/**
		 * Get collections by bind ID or get bind IDs by collection
		 *   If it's Boolean type and false, will return a Array contained all collections binded in this view
		 *   If it's String type ,will return the representative collection.
		 *   If it's a instance of Application.Collection, will return a Array contained all bind IDs
		 *   else return a map ,key is collections ,values is uid array corresponded
		 * @param {(boolean|string|backchart.base.collection|Application.Collection)} bindIDOrCollection 
		 * @return {(backchart.base.collection[]|Application.Collection[]|backchart.base.collection|Application.Collection|string[]|Object)}
		 */
		getCollection: function(getBindID){
			var me = this;
			if (typeof getBindID === "boolean" && getBindID === false){
				return _.uniq(_.values(me.collections));
			}else if (typeof getBindID === "string" || getBindID instanceof String){
				return me.collections[getBindID];
			}else if (getBindID instanceof Application.Collection){
				var uids = [];
				me.eachCollection(function(uid){
					if (this === getBindID){
						uids.push(uid);
					}
				});
				return uids;
			}else{
				var cols = {};
				me.eachCollection(function(uid){
					if (typeof cols[this] === "undefined"){
						cols[this] = [];
					}
					cols[this].push(uid);
				});
				return cols;
			}
		},
		/**
		 * Get collection's option by bind ID or collection instance
		 *   If it's String type ,will return the representative collection's options.
		 *   If it's a instance of Application.Collection, will return a Array contained all options
		 *   else return a map ,key is collection instance ,values is its options
		 * @param {(string|backchart.base.collection|Application.Collection)} bindIDOrCollection 
		 * @return {(Object[]|Object)}
		 */

		getOptions: function(getBindID){
			var me = this,
			Options = null;
			if (typeof getBindID === "string" || getBindID instanceof String){
				return me._collectionOptions[getBindID];
			}else if (getBindID instanceof Application.Collection){
				Options = [];
				me.eachCollection(function(uid, collection, renderOption, options){
					if (collection === getBindID){
						Options.push(options);
					}
				});
				return Options;
			}else{
				Options = {};
				me.eachCollection(function(uid, collection, renderOption, options){
					if (typeof Options[this] === "undefined"){
						Options[this] = [];
					}
					Options[this].push(options);
				});
				return Options;
			}
		},
		/**
		 * Get collection's renderOptions by bind ID or collection instance
		 *   If it's String type ,will return the representative collection's options.
		 *   If it's a instance of Application.Collection, will return a Array contained all options
		 *   else return a map ,key is collection instance ,values is its options
		 * @param {(string|backchart.base.collection|Application.Collection)} bindIDOrCollection 
		 * @return {(Object[]|Object)}
		 */
		getRenderOptions : function(getBindID){
			var me = this,
			renderOptions = [];
			if (typeof getBindID === "string" || getBindID instanceof String){
				return me._collectionRenderOptions[getBindID];
			}else if (getBindID instanceof Application.Collection){
				renderOptions = [];
				me.eachCollection(function(uid, collection, renderOption){
					if (collection === getBindID){
						renderOptions.push(renderOption);
					}
				});
				return renderOptions;
			}else{
				renderOptions = {};
				me.eachCollection(function(uid, collection, renderOption){
					if (typeof renderOptions[this] === "undefined"){
						renderOptions[this] = [];
					}
					renderOptions[this].push(renderOption);
				});
				return renderOptions;
			}

		},
		/**
		 * The default function should be invoke before rendered.All View class inherited MUST call this function before call the render.
		 * If the function return false, you should give up the rendering process immediately.
		 * Here is a example:
		 * @example
		 *   baseview.extend({
		 *    ...
		 *    render : function(){
		 *       var baserender = baseview.prototype.renderBefore.apply(me, arguments);
		 *       if (!baserender){
		 *           return false;
		 *       }
		 *    }
		 *    ...
		 *  });
		 *                                           }
		 */
		renderBefore : function(){
			var me = this;
			//initialization container
			if (!me.container) {
				return;
			}
			me.$container = $(me.container);
			if (me.$container.is(":hidden")){
				return false;
			}
			if (me._silence === true){
				return false;
			}
			return true;
		},
		/**
		 * All inherit render function should send the unity of event after rendered chart.
		 * Here is a example:
		 * @example
		 *  baseview.extend({
		 *    ...
		 *    render : function(){
		 *    	//implement rendered
		 *    	return baseview.prototype.renderAfter.apply(this, [this, this.el, chart object, renderOptions]);
		 *		...
		 *    }
		 *    ...
		 *  });
		 */   
		renderAfter : function(){
            this.trigger.apply(this, ["rendered"].concat(Array.prototype.slice.call(arguments, 0)));
			$(this.container).trigger("backchart.rendered",arguments);
			return this;
		},
		/**
		 * A event triggered after rendered a chart.
		 * @event module:base/view#rendered
		 * @type {object}
		 * @property {Backbone.View} view view instance 
		 * @property {string} elId Element's ID 
		 * @property {Object} chart the chart object
		 * @property {object} renderOptions options for rendering
		 */
		elFillParents : function(){
			this.$el.css({
                width: this.width ? (this.width + "px") : "100%",
                height:this.height ? (this.height+ "px") :"100%"
			});
		},
		/**
		 * An interface that can obtain the third-party chart's render options currently
		 */
		getChartOptions : function(){
			return null;
		}
//       __logAlert: function(msg){
//		    window.alert(msg);
//	    },
		/**
		 * Log function
		 */
//		_log: function(){
//			if (window.console){
//				return window.console;
//			}else{
//				var f = this.__logAlert;
//				return {log:f, info:f, warn:f, debug:f, error:f};
//			}
//		}
	});
	return chartBaseView;
}));
