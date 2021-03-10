/*********************************************************************************
*     File Name           :     view.js
*     Created By          :     Jone Casper
*     Creation Date       :     [2014-03-05 18:36]
*     Last Modified       :     [2014-04-09 02:27]
*     Description         :     Backchart view for amcharts
**********************************************************************************/
(function(root, name, factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define(['jquery','../backchart.base/view','backbone',"underscore","AmCharts","../backchart.base/logger"], function($, base, Backbone, _, amcharts, logger) {
			amcharts = amcharts || window.AmCharts;
			return factory($, Backbone, _, base, amcharts, logger);
		});
	}else if(typeof module !== 'undefined' && module.exports && typeof require === 'function'){
		var $ = require("jquery"),
		base = require("../backchart.base/view"),
		Backbone = require("backbone"),
		_ = require("underscore"),
		amcharts = require("AmCharts") || window.AmCharts;
		var logger = require("../backchart.base/logger");
		module.exports = factory($, Backbone, _, base, amcharts, logger);
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
					(root.amcharts|| window.AmCharts)
				):
				(ex || {}); 
		}
	}
}(this, "backchart.amcharts.view", function($, Backbone, _, baseview, AmCharts) {
	/**
	 * Backchart amcharts view
	 * @module amcharts/view
	 * @requires jquery
	 * @requires base/view
	 * @requires backbone
	 * @requires AmCharts 
     * @this {Backbone.View}
     */
	var backchartAmchartsView = baseview.extend(
		/**
		 * @lends module:amcharts/view.prototype 
		 */
		{
		graphsFieldsForConflictTest:["valueField", "alphaField", "bulletField", "bulletSizeField", "colorField", "fillColorsField", "labelColorField", "lineColorField"],
        /**
         * Merge collection ways
         *
         * simple : default, use index to merge
         * category : use category as key to merge data
         */
        mergeData : "simple",
        /**
         * Key field in all kinds of charts' data
         * These field will be attached to main configuration of chart
         */
        keyFields :{
            "serial" :["categoryField"],
            "pie" :["titleField","valueField"]
        },
		constructor: function() {
			/**
			 * The default Graphs Options for all collections
			 * You renderOptions have the high priority and can cover the default configuration
			 * @type {object}
			 * @property {string} balloonText default balloonText
			 * @property {string} valueField default value field
             * @default {balloonText: "<b>[[category]]: [[value]]</b>",valueField: "value"}
			 */
			this.defaultGraphsOptions = {
				balloonText: "<b>[[category]]: [[value]]</b>",
				valueField: "value"
			};
			/**
			 * Allow one or more Axes displayed in chart. Default is false and use the [defaultAxesOptions]{@link amcharts/view:defaultAxesOption} if no axes configuration in collections' renderOptions which had been bound to the view and not hidden.
			 * If exist axes configuration in any collection's renderOptions and multiValueAxes is false, we will use the first collection's setting when creating the options.
			 * @type {boolean}
             * @default false
			 */
			this.multiValueAxes = false;
			/**
			 * The default Axes Options for all collections
			 * @type {object}
			 */
            this.defaultAxesOptions = {
            };
            /**
             * The default categoryAxis when the type of value is Date
             * @type {object}
             * @default {equalSpacing: true}
             */
            this.defaultDateAxesOptions = {
                equalSpacing: true
            };
			 /**
			  * The default make chart Options, value is "serial"
			  * @type {object}
              * @default {type:"serial"}
			  */
			this.defaultOptions = {
				 type:"serial"
			 };

			 baseview.apply(this, arguments);
		},
        /**
         * initialize
         *
         * @param defaultOptions
         * @param defaultGraphsOptions
         * @param defaultAxesOptions
         * @return {Backbone.View}
         */
		initialize: function(defaultOptions, defaultGraphsOptions, defaultAxesOptions){
			baseview.prototype.initialize.apply(this, arguments);
			this.defaultOptions = $.extend(true, {}, this.defaultOptions, defaultOptions);
			this.defaultGraphsOptions = $.extend(true, {}, this.defaultGraphsOptions, defaultGraphsOptions);
			this.defaultAxesOptions = $.extend(true, {}, this.defaultAxesOptions, defaultAxesOptions);
			this.__rendered = false;
			return this;
		},
		/**
		 * @function onCollection 
		 * @memberof module:amcharts/view
         * @desc inherited from [base/view:onCollection]{@link base/view:onCollection} and defined a special fixed formated renderOptions
		 * @param {(backchart.base.collection|Backbone.Collection)} collection
		 * @param {Object} renderOptions render chart options which based what chart library you used.
		 * @param {Object} [renderOptions.graph] same as the AmGraph configration.If you set valueField 
		 * @param {Object} [renderOptions.axes] same as the ValueAxis or GaugeAxis configration
		 * @example
		 * 	   var chart = new AmCharts.AmSerialChart();
		 * 	   var graph = new AmCharts.AmGraph();
		 * 	   graph.type = 'column';
		 * 	   graph.fillAlphas = 1;
		 *
		 *     //you renderOptions
		 *     var renderOptions = {
		 *         graph : {
		 *			   type : 'column',
		 *			   fillAlphas : 1
		 *		   }
		 *	   }
		 * @param {Object} options inherited the options on [base/collection.onCollection]{@link base/view:onCollection}
		 *
		 */

		__mergeToDataProvider: function(key, data, dataProvider, graphFields){
			var me = this;
    
            var conflicts = {};
			for(var k=data.length-1; k>=0; k--){
				var d = data[k],
                    pindex = -1;
                if (me.mergeData === "simple"){
                    pindex = k;
                }else if (me.mergeData === "category"){
				    for (var i=dataProvider.length-1; i>=0; i--){
					    if (
                            (dataProvider[i][key] instanceof Date && d[key] instanceof Date && dataProvider[i][key].valueOf() === d[key].valueOf()) ||
                            dataProvider[i][key] === d[key]
                        ){
                            pindex = i;
                            break;
                        }
                    }
                }
                if (pindex>=0 && d){
                    //clone a new object and resolve conflicts
                    for (var gk in graphFields){
                        var thisField = graphFields[gk];
                        if (d[thisField] && typeof dataProvider[pindex][thisField] !== "undefined"){
                            var resolveName = conflicts[thisField];
                            if (!resolveName){
                                resolveName = _.uniqueId(thisField);
                                conflicts[thisField] = resolveName;
                            }
                            d[resolveName] = d[thisField];
                            delete d[thisField];
                        }   
                    }
                    dataProvider[pindex] = $.extend(dataProvider[pindex], d);
                }else{
                    dataProvider.push(d);        
                }
            }
            for (var ck in conflicts){
                for (var gh in graphFields){
                    if (graphFields[gh] === ck){
                        graphFields[gh] = conflicts[ck];
                    }
                }
            }
			return graphFields;
		},
		_createGraph: function(renderOptions){
			var me = this;
			var graphs = [],
			    valueAxes = [],
				dataProvider = [];

            if (!renderOptions.type){
                renderOptions.type = "serial";
            }

            //get default key filed in data
            var keyFields = me.keyFields[renderOptions.type] || [];
            var defaultKeyFieldsName = {};
            for (var k=0; k<keyFields.length; k++){
                defaultKeyFieldsName[keyFields[k]] = renderOptions[keyFields[k]] || ("_" + keyFields[k]);
            }

			me.eachCollection(function(uid, collection, renderOption){
				var _data = [],
				    _gph = $.extend(true ,{}, me.defaultGraphsOptions, renderOption.graph);

                var testModel = collection.model ? new collection.model() : null,
				    graphFields = {},
                    keyFieldAttrMap = {};

                //get fileds for testing confliction
				for (var f=me.graphsFieldsForConflictTest.length-1; f>=0; f--){
					var testField = me.graphsFieldsForConflictTest[f];
                    var definedFD = collection[testField] || (testModel ? testModel[testField] : null);
				    if (definedFD){
				   		graphFields[testField] = definedFD;
					}
				}
                for (var k=0; k<keyFields.length; k++){
                    var kf = keyFields[k];
                    var thisFiledAttrName = testModel[kf] || collection[kf] || renderOptions[kf];
                    if (thisFiledAttrName){
                        keyFieldAttrMap[kf] = thisFiledAttrName;
                        renderOptions[kf] = defaultKeyFieldsName[kf];
                    }
                }

				collection.each(function(model){
					if (collection.isVisibled(model)){
						var _d = _.clone(model.attributes);

                        for (var kf in defaultKeyFieldsName){
                            var attrname = keyFieldAttrMap[kf];
                            if (attrname){
                                _d[defaultKeyFieldsName[kf]] = model.get(attrname);
                            }   
                        }
                        
				    	_data.push(_d);
					}
				});

				//merge data to dataProvider configuration
                if (!!!dataProvider.length){
                    dataProvider = _data;
                }else{
                    graphFields = me.__mergeToDataProvider(keyFields[0], _data, dataProvider, graphFields);
                }
                _gph = $.extend(_gph, graphFields);

				if (renderOption.axes){
					if (me.multiValueAxes === true){
						var newValueAxes = $.extend(true, {}, me.defaultAxesOptions, renderOption.axes);
						newValueAxes.id = _.uniqueId("_axes");
						valueAxes.push(newValueAxes);
						_gph.valueAxis = newValueAxes.id;
					}else if (!!!valueAxes.length){
						valueAxes.push($.extend(true, {}, me.defaultAxesOptions, renderOption.axes));
					}else{
						console.info("We has ignored one valueAxes configuration because the multiValueAxes option is false.");
					}
				}
				graphs.push(_gph);
			});

			renderOptions.dataProvider = dataProvider;
			renderOptions.valueAxes = valueAxes;
			renderOptions.graphs = graphs;
			return renderOptions;
		},
        /**
		 * The collection options transform and push
         *
         * @param {Object} renderOptions the render options
         * @return {Object} options 
         */
		transformOptions: function(renderOptions){
			var me = this;
			//create dataProvider and unified the valueFiled 
			renderOptions = me._createGraph(renderOptions);
			return renderOptions;
		},
		/**
		 * The render function
		 *
		 * @fires module:amcharts/view#beforeValidateData
		 * @fires module:amcharts/view#beforeRender
		 * @fires module:base/view#rendered
		 * @return {Object} this instance
		 */
		render: function(force){
			var me = this;
			var rret = baseview.prototype.renderBefore.apply(me, arguments);
			if (!rret){
				return false;
			}
			if (!me.el.id){
				me.el.id = _.uniqueId(me._viewPrefix || "_bcname");
			}
			var renderOptions = _.clone(me.defaultOptions);
		    renderOptions = me.transformOptions(renderOptions);
			
			me.__cOptions = renderOptions;
            if (me.Chart && !force){
			    me.trigger("beforeValidateData", me, me.el.id, renderOptions.dataProvider);
                me.Chart.dataProvider = renderOptions.dataProvider;
                me.Chart.validateData();
                return;
            }else{
			    me.trigger("beforeRender", me, me.el.id, renderOptions);
			    me.$container.empty().append(me.$el.empty());
			    me.elFillParents();
				if (me.Chart) {
					// Clear previous chart before overriding the reference
					me.Chart.clear();
				}
			    me.Chart = AmCharts.makeChart(me.el.id, $.extend(true, {}, renderOptions));
                me.Chart.write(me.el.id);
			    return baseview.prototype.renderAfter.apply(me, [me, me.el, me.Chart, renderOptions]);
            }
		},
		/**
		 * A event triggered before render chart.
		 * @event module:amcharts/view#beforeRender
		 * @type {object}
		 * @property {Backbone.View} view view instance
		 * @property {string} elId Element's ID
		 * @property {object} renderOptions options for rendering
		 */
        /**
		 * A event triggered before chart data change.
		 * @event module:amcharts/view#beforeValidateData
		 * @type {object}
		 * @property {Backbone.View} view view instance
		 * @property {string} elId Element's ID
		 * @property {object} dataProvider dataProvider options
		 */


		/**
		 * Implement [getChartOptions]{@link base/view:getChartOptions}
		 */
		getChartOption: function(){
			return this.__cOptions;
		}

	});
	return backchartAmchartsView;
}));
		

