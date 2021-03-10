/*********************************************************************************
 *     File Name           :     collection.js
 *     Created By          :     Jone Casper
 *     Creation Date       :     [2014-02-11 10:45]
 *     Last Modified       :     [2014-04-06 05:15]
 *     Description         :     Backchart basic backbone collection
 **********************************************************************************/
(function(root, name, factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'underscore', 'backbone',
               "backchart.base/loader", 
               "backchart.base/logger"], 
               function($, _,  Backbone,  loader) {
                   return factory($, _, Backbone, loader);
               });
    }else if(typeof module !== 'undefined' && module.exports && typeof require === 'function'){
        var $ = require("jquery"),
        Backbone = require("backbone"),
        _ = require("underscore");
        require("backchart.base/logger");
        var loader = require("backchart.base/loader");
        module.exports = factory($, _, Backbone, loader);
    }else{
        var namespaces = name.split("."),
        scope = root || this;
        for (var i=0; i<namespaces.length; i++) {
            var p = namespaces[i],
            ex = scope[p];
            scope = scope[p] = (i === namespaces.length - 1) ? 
                factory(
                    (root.jQuery || window.jQuery),
            (root._|| window._),
            (root.Backbone || window.Backbone),
            (root.Application || window.Application || root.Backbone || window.Backbone),
            root.backchart.base.loader
            ):
                (ex || {});
        }
    }
}(this, "backchart.base.collection",function($, _,Backbone,Application, loader) { 
    var root = this;
    /**
     * Backbone chart base collection 
     * @module base/collection
     * @requires jquery
     * @requires backbone
     * @this {Backbone.Collection}
     */
    var exports = Application.Collection.extend(
        /** 
         * @lends module:base/collection.prototype 
         */
        {
        /**
         * A significant that indicate this class is Backchart collection
         * @type {boolean}
         * @static
         */
        _backchart : true,
        constructor: function(){
            Application.Collection.apply(this, arguments);
        },

        /**
         * initialize
         * @return {Application.Collection} collection instance
         */
        initialize: function(){
            this._silence = false;
            //The model options
            this._modelOptions = {};

            return Application.Collection.prototype.initialize.apply(this, arguments);
        },
        /**
         * Set the silence flag.If you want to set lots of data to append, you can set it to true for ban the collection creating seted, removed and reseted event.If you set the flag to true, please recover the flag to false after you finished your work.
         *
         * @param {boolean} flag
         */
        setSilence : function(flag){
            this._silence = flag;
        },
        /**
         * Override collection set function and trigger seted event after processing has done.
         * When these function processing, collection will enter the "silence" model for avoiding to render chart repeatedly.
         * Please see [Backbone.Collection#set]{@link http://backbonejs.org/#Collection-set}
         *
         * @param {(Backbone.Model[]|String[])} models
         * @param {Object} options
         * @fires module:base/collection#seted
         * @return {Object} result of Backbone.Collection.prototype.set
         */
        set : function(models, options){
            var soptions = $.extend({silent:true}, options);
            if (this._silence === true){
                return Backbone.Collection.prototype.set.apply(this, [models, soptions]);
            }
            this.setSilence(true);
            var result = Backbone.Collection.prototype.set.apply(this, [models, soptions]);
            this.setSilence(false);
            this.trigger('seted', this.models, this, options);
            return result;
        },
        /**
         * A event triggered after finished to add/set/sync.
         * @event module:base/collection#seted
         * @type {object}
         * @property {boolean} models indicates all models affected.
         * @property {boolean} collection this instance
         * @property {boolean} options the options of set
         */
        /**
         * Override collection remove function and trigger removed event after processing has done.
         * When these function processing, collection will enter the "silence" model for avoiding to render chart repeatedly.
         * Please see [Backbone.Collection#remove]{@link http://backbonejs.org/#Collection-remove}
         *
         * @param {(Backbone.Model[]|String[])} models
         * @param {Object} options
         * @fires module:base/collection#removed
         * @return {Object} result of Backbone.Collection.prototype.remove
         */
        remove: function(models, options){
            var soptions = $.extend({silent:true}, options);
            if (this._silence === true){
                return Backbone.Collection.prototype.remove.apply(this, [models, soptions]);
            }
            this.setSilence(true);
            var result = Backbone.Collection.prototype.remove.apply(this, [models, soptions]);
            this.setSilence(false);

            //remove model options
            for(var i=models.length; i>=0; i--){
                var md = models[i];
                if (this._modelOptions[md]){
                    delete this._modelOptions[md];
                }
            }
            this.trigger('removed', this.models, this, options);
            return result;
        },
        /**
         * A event triggered after finished to remove.
         * @event module:base/collection#removed
         * @type {object}
         * @property {boolean} models - Indicates all models affected.
         * @property {boolean} collection - this instance
         * @property {boolean} options - the options of set
         */

        /**
         * Override collection reset function and trigger reseted event after processing has done.
         * When these function processing, collection will enter the "silence" model for avoiding to render chart repeatedly.
         * Please see [Backbone.Collection#reset]{@link http://backbonejs.org/#Collection-reset}
         *
         * @param {(Backbone.Model[]|String[])} models
         * @param {Object} options
         * @fires module:base/collection#reseted
         * @return {Object} result of Backbone.Collection.prototype.reset
         */
        reset: function(models, options){
            if (this._silence === true){
                return Backbone.Collection.prototype.reset.apply(this, arguments);
            }
            this.setSilence(true);
            var result = Backbone.Collection.prototype.reset.apply(this, arguments);
            this.setSilence(false);
            this.trigger('reseted', this, options);
            return result;
        },
        /**
         * A event triggered after finished to reset.
         * @event module:base/collection#reseted
         * @type {object}
         * @property {boolean} collection - this instance
         * @property {boolean} options - the options of set
         */
        /**
         * Get model's options 
         * A private method which can get one model bind options 
         *
         */
        getOptions: function(model){
            var me = this;
            if (model instanceof String || typeof model === "string"){
                model = me.get(model);
            }
            if (model instanceof Backbone.Model){
                for (var i=me.models.length-1; i>=0; i--){
                    var m = me.models[i];
                    if (m.cid === model.cid){
                        if (!me._modelOptions[m.cid]){
                            me._modelOptions[m.cid] = {};
                        }
                        return me._modelOptions[m.cid];
                    }
                }
            }
            return null;
        },
        _setOptions: function(model, options){
            var me = this;
            if (!!!me._modelOptions[model.cid]){
                me._modelOptions[model.cid] = $.extend({}, options);
            }else{
                me._modelOptions[model.cid] = $.extend(me._modelOptions[model.cid], options);
            }
            return me._modelOptions[model.cid];
        },
        /**
         * Set model's options
         * A private method which can set one model bind options
         *
         */
        setOptions: function(model, options){
            var me = this;
            if (model instanceof String || typeof model === "string"){
                model = me.get(model);
            }
            if (model instanceof Backbone.Model){
                for (var i=me.models.length-1; i>=0; i--){
                    var m = me.models[i];
                    if (m.cid === model.cid){
                        me._setOptions(model, options);
                    }
                }
            }
            return null;
        },
        /*
         * model in collection is visible or not
         *
         * @param model : the model instance or the id(you should set idattribute first)
         * @param visible : set true if you want to this model can display, otherwise set false
         * return the model has hidden
         */
        _setVisible: function(model, visible){
            var me = this;
            if (model instanceof String || typeof model === "string"){
                model = me.get(model);
            }
            if (model instanceof Backbone.Model){
                for (var i=me.models.length-1; i>=0; i--){
                    var m = me.models[i];
                    if (m.cid === model.cid){
                        me._setoptions(model, {"visible": visible});
                        me.trigger("change:visible", visible);
                        return model;
                    }
                }
            }
            return null;
        },
        hide: function(IdOrInstance){
            return this._setVisible(IdOrInstance, false);
        },
        show: function(IdOrInstance){
            return this._setVisible(IdOrInstance, true);
        },
        isVisibled: function(IdOrInstance){
            var options = this.getOptions(IdOrInstance);
            return options ? 
                (options.visible === false ? false : true):
                true;
        }
    });
    return exports;
}));
