/*********************************************************************************
 *     File Name           :     view.js
 *     Created By          :     Jone Casper(xu.chenhui@live.com)
 *     Creation Date       :     [2014-04-08 10:40]
 *     Last Modified       :     [2014-04-10 13:34]
 *     Description         :     Backchart for Baidu Echarts
 **********************************************************************************/

(function(root, name, factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define(['jquery','backbone',"underscore", "../backchart.base/view", "echarts","../backchart.base/logger"], function($, Backbone, _, base, echarts, logger) {
            echarts = echarts || window.echarts;
            return factory($, Backbone, _, base, echarts, logger);
        });
    }else if(typeof module !== 'undefined' && module.exports && typeof require === 'function'){
        var $ = require("jquery"),
        base = require("../backchart.base/view"),
        Backbone = require("backbone"),
        _ = require("underscore"),
        echarts = require("echarts") || window.echarts;
        var logger = require("../backchart.base/logger");
        module.exports = factory($, Backbone, _, base, echarts, logger);
    }else{
        var namespaces = name.split("."),
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
            (root.echarts|| window.echarts)
            ):
                (ex || {}); 
        }
    }
}(this, "backchart.echarts.view", function($, Backbone, _, baseview, echarts) {
    /**
     * Backchart echarts view
     * @module echarts/view
     * @requires jquery
     * @requires base/view
     * @requires backbone
     * @requires echarts 
     * @this {Backbone.View}
     */
    var exports = baseview.extend(
        /**
         * @lends module:echarts/view.prototype 
         */
        {
        /**
         * Allow one or more Axes displayed in chart. Default is false and use the [defaultAxesOptions]{@link echarts/view:defaultAxesOption} if no axes configuration in collections' renderOptions which had been bound to the view and not hidden.
         * If exist axes configuration in any collection's renderOptions and multiValueAxes is false, we will use the first collection's setting when creating the options.
         * @type {boolean}
         * @default false
         */
        multiValueAxes: false,
        /**
         * The autoSymbol will be hidden if too many datas(default greater than 30) in series.If set a number variable,it will become the limit line.
         *
         */
        autoSymbol: true,

        seriesNamePrefix: "Data Source",

        constructor: function(){
            /**
             * The default chart options
             */
            this.defaultOptions = {
                calculable: false,
                animation: false,
                tooltip : {
                    trigger: 'axis'
                },
                title: {                                                                                                                                     
                    x:'center'
                },
                legend:{
                    y:'bottom'
                }
            };

            /**
             * The default render options
             */
            this.defaultRenderOptions = {
                symbol:'emptyCircle',
                smooth:true
            };

            this.defaultxAxis = {
                type: "category"
            };

            this.defaultyAxis = {
                type: "value"
            };

            this.__render = false;
            baseview.apply(this, arguments);
        },
        /**
         * initialize
         *
         * @param defaultOptions
         * @param defaultRenderOptions
         * @return {Backbone.View}
         */
        initialize: function(defaultOptions, defaultRenderOptions){
            baseview.prototype.initialize.apply(this, arguments);
            this.defaultOptions = $.extend(true, {}, this.defaultOptions, defaultOptions);
            this.defaultRenderOptions = $.extend(true, {}, this.defaultRenderOptions, defaultRenderOptions);
            return this;
        },
        /**
         * @function onCollection 
         * @memberof module:echarts/view
         * @desc inherited from [base/view:onCollection]{@link base/view:onCollection}
         * @param {(backchart.base.collection|Backbone.Collection)} collection
         * @param {Object} renderOptions render chart options which based what chart library you used.
		 * @param {Object} [renderOptions.xAxis] same as the xAxis options
		 * @param {Object} [renderOptions.yAxis] same as the yAxis options
         * @param {Object} options inherited the options on [base/collection.onCollection]{@link base/view:onCollection}
         *
         */

        /**
         * Transform the collecion and renderOptions to a series options
         *
         * @private
         * @param {Backbone.Collection} collection
         * @param {Object} renderOptions
         * @param {Object} defaultOptions
         * @param {Array} [xAxis]
         * @param {Array} [yAxis]
         * @return {Object} series options 
         */
        _transformOneCollection: function(index, collection, renderOptions, defaultOptions, xAxis){
            var me = this;
            var categoryField = renderOptions.categoryField || collection.categoryField || collection.model.prototype.categoryField;
            var valueField = renderOptions.valueField || collection.valueField || collection.model.prototype.valueField;
            var type = renderOptions.type || "line";
            var seriesConfig = renderOptions;

            var _data, _legend, _xAxisData, pushFn;
            if (!defaultOptions.legend){
                defaultOptions.legend = {};
            }
            _data = seriesConfig.data = [];
            if (!defaultOptions.legend){
                defaultOptions.legend = {};
            }
            if (!defaultOptions.legend.data){
                _legend = defaultOptions.legend.data = [];
            }else{
                _legend = defaultOptions.legend.data;
            }
            if (xAxis){
                _xAxisData = xAxis.data = xAxis.data ? xAxis.data : [];
            }

            seriesConfig.name = seriesConfig.name ? seriesConfig.name : me.seriesNamePrefix+index;

            var _tmp = {};
            switch(type){
                case "bar": 
                case "line": 
                    pushFn=function(model){
                        var d = model.get(valueField),
                        n = model.get(categoryField);
                        d = d ? d : 0;
                        _data.push(d);
                        if (_xAxisData) {_xAxisData.push(n);}
                    };
                    _legend.push(seriesConfig.name);
                    break;
                case "scatter":
                    pushFn=function(model){
                        var d = model.get(valueField),
                        n = model.get(categoryField);
                        d = d ? d : [0];
                        if (d instanceof Array){
                            _data.push(d);
                        }else{
                            _data.push([n, d]);
                        }
                    };
                    _legend.push(seriesConfig.name);
                    break;
                case "k":
                    //not implement yet;
                    break;
                case "pie": 
                    pushFn=function(model){
                        var d = model.get(valueField),
                        n = model.get(categoryField);
                        if (d instanceof Object){
                            _data.push(d);
                            _legend.push(d.name);
                        }else{
                            _data.push({
                                name:n,
                                value:d
                            });
                            _legend.push(n);
                        }
                    };
                    break;
                case "map": 
                    pushFn=function(model){
                        var d = model.get(valueField),
                            n = model.get(categoryField);
                        if (d instanceof Object){
                            _data.push(d);
                        }else{
                            _data.push({
                                name:n,
                                value:d
                            });
                        }
                    };
                    _legend.push(seriesConfig.name);
                    break;
                case "radar": 
                    if (!defaultOptions.polar){
                        defaultOptions.polar = [];
                    }
                    if (defaultOptions.polar.length === 0){
                        defaultOptions.polar.push({
                            indicator:[]
                        });
                    }
                    pushFn = function(model){
                        var d = model.get(valueField),
                            n = model.get(categoryField);
                        if (d instanceof Array){
                            //the valueField contained the key which will showed in chart.
                            $.each(d, function(index, ckey){
                                var v = model.get(ckey);
                                v = v ? v : 0;
                                _data.push(v);
                                if (!_tmp[ckey] || _tmp[ckey] < v){
                                    _tmp[ckey] = v;
                                }
                            });
                        }else{
                            //rendered all attribute to chart
                            for (var ckey in model.attributes){
                                if (ckey === n){
                                    continue;
                                }
                                var v = model.attributes[ckey];
                                v = v ? v : 0;
                                _data.push(v);
                                if (!_tmp[ckey] || _tmp[ckey] < v){
                                    _tmp[ckey] = v;
                                }
                            }
                        }
                    };
                    break;
                default:
                    break;
            }
            collection.each(function(model){
                if (collection.isVisibled(model) && pushFn){
                    pushFn(model);
                }
            });
            if (seriesConfig.type === "radar"){
                var imax = defaultOptions.polar[0].indicator;
                var nameMap = me.nameMap || renderOptions.nameMap;
                for (var maxKey in _tmp){
                    var text = nameMap ? (nameMap[maxKey]?nameMap[maxKey]:maxKey) : maxKey;
                    var val = _tmp[maxKey],inImax = false;
                    for (var i=imax.length-1; i>=0; i--){
                        var item = imax[i];
                        if (item.text === text){
                            inImax = true;
                            if (item.max < val){
                                item.max = val;
                            }
                            break;
                        }
                    }
                    if (!inImax){
                        imax.push({
                            text: text,
                            max: val
                        });
                    }
                }
            }

            if (me.autoSymbol){
                var limitSize = typeof me.autoSymbol === "number" ? limitSize : 30;
                if (seriesConfig.data.length > limitSize){
                    seriesConfig.symbolSize = 0;    
                }
            }
            return seriesConfig;
        },
        transformOptions: function(chartOptions, defaultRenderOptions){
            var me = this;
            if (!chartOptions.series){
                chartOptions.series = [];
            }

            var index = 0;
            me.eachCollection(function(uid, collection, renderOption, options){
                if (collection._silence || options.visible === false){
                    return;
                }
                //avoid empty series
                if (collection.length === 0){
                    return;
                }
                var xAxisIndex,yAxisIndex,xAxis,yAxis;
                if (!me.multiValueAxes){
                    if (!chartOptions.xAxis || chartOptions.xAxis.length === 0){
                        xAxis = $.extend(true, {}, me.defaultxAxis, defaultRenderOptions.xAxis);
                        chartOptions.xAxis = [xAxis];
                    }
                    if (!chartOptions.yAxis || chartOptions.yAxis.length === 0){
                        yAxis = $.extend(true, {}, me.defaultyAxis, defaultRenderOptions.yAxis);
                        chartOptions.yAxis = [yAxis];
                    }
                }else{
                    if (!chartOptions.xAxis){
                        chartOptions.xAxis = [];
                    }
                    if (!chartOptions.yAxis){
                        chartOptions.yAxis = [];
                    }

                    xAxis = $.extend(true, {}, me.defaultxAxis, defaultRenderOptions.xAxis);
                    xAxisIndex = chartOptions.xAxis.push(xAxis);
                    yAxis = $.extend(true, {}, me.defaultyAxis, defaultRenderOptions.yAxis);
                    yAxisIndex = chartOptions.yAxis.push(yAxis);
                }
                var rdOpt = $.extend(true, {}, defaultRenderOptions, renderOption);

                var series = me._transformOneCollection(index, collection, rdOpt, chartOptions, xAxis, yAxis);
                if (xAxisIndex){series.xAxisIndex = xAxisIndex-1;}
                if (yAxisIndex){series.yAxisIndex = yAxisIndex-1;}
                
                if (rdOpt.type === "radar"){
                    var _radarseries;
                    if (!chartOptions.series || chartOptions.series.length === 0){
                        _radarseries = {type: 'radar',data:[]};
                        chartOptions.series.push(_radarseries);
                    }else{
                        _radarseries = chartOptions.series[0];
                    }
                    if (series.data.length > 0){
                        _radarseries.name = (_radarseries.name?(_radarseries.name + " - "):"") + series.name;
                        _radarseries.data.push({
                            name: series.name,
                            value: series.data 
                        });
                        chartOptions.legend.data.push(series.name);
                    }
                }else{
                    chartOptions.series.push(series);
                }
                index++;
            });
            return chartOptions;
        },
        /**
         * The render function
         *
         * @fires module:echarts/view#beforeRender
         * @fires module:base/view#rendered
         * @return {Object} this instance
         */
        render: function(){
            var me = this;
            var rret = baseview.prototype.renderBefore.apply(me, arguments);
            if (!rret){
                return false;
            }
            if (!me.el.id){
                me.el.id = _.uniqueId(me._viewPrefix || "_bcname");
            }

            var chartOptions = $.extend(true, {}, me.defaultOptions);
            var renderOptions = me.transformOptions(chartOptions, me.defaultRenderOptions);
            this.__cOptions = renderOptions;

            if (!me.__render){
                me.$container.empty().append(me.$el.empty());
			    me.elFillParents();
            }

			me.trigger("beforeRender", me, me.el.id, renderOptions);
            me.Chart = echarts.init(me.el).setOption(renderOptions);
            me.__render = true;
			return baseview.prototype.renderAfter.apply(me, [me, me.el, me.Chart, renderOptions]);
        },
        /**
		 * Implement [getChartOptions]{@link base/view:getChartOptions}
		 */
		getChartOption: function(){
			return this.__cOptions;
		}
    });
    return exports;
}));
