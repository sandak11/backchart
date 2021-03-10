/*********************************************************************************
 *     File Name           :     parser.js
 *     Created By          :     Jone Casper(xu.chenhui@live.com)
 *     Creation Date       :     [2014-03-25 06:20]
 *     Last Modified       :     [2014-04-06 05:13]
 *     Description         :      
 **********************************************************************************/
(function(root, name, factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define(['jquery',
               "backchart.utils/codepage/cputils",
               "backchart.utils/js-csv/jquery.csv",
               "backchart.utils/js-xls/xls",
               "backchart.utils/js-xlsx/xlsx",
               "backchart.base/logger"],
               function($) {
                   return factory($, $.csv, root.XLS, root.XLSX);
               });
    }else if (typeof module !== 'undefined' && module.exports && typeof require === 'function'){
        var $ = require("jquery");
        require("backchart.utils/codepage/cputils");
        //root.JSZip = requires("./jszip/jszip.js");
        require("backchart.base/logger.js");
        require("backchart.utils/js-csv/jquery.csv.js");
        var XLS = require("backchart.utils/js-xls/xls.js");
        var XLSX = require("backchart.utils/js-xlsx/xlsx.js");
        module.exports = factory($, $.csv, XLS, XLSX);
    }else{
        var namespaces = name.split("."),
        scope = root || this;
        for (var i=0; i<namespaces.length; i++) {
            var p = namespaces[i],
            ex = scope[p];
            scope = scope[p] = (i === namespaces.length - 1) ? 
                factory(
                    (root.jQuery || window.jQuery),
                    (root.jQuery.csv || window.jQuery.csv),
                    (root.XLS || window.XLS),
                    (root.XLSX|| window.XLSX)
                ):
                (ex || {});
        }
    }
}(this, "backchart.utils.parser",function($, csv, XLS, XLSX) { 
    /**
	 * Backbone file parser 
     * 
	 * @module util/parser
	 * @requires jquery
	 * @requires codepage
	 * @requires jzip
	 * @requires jquery.csv 
	 * @requires js-xls
	 * @requires js-xlsx
     * @this {Backbone.View}
     */
    var exports = {};

    /**
     * The csv file parser 
     *
     * @memberof module:util/parser
     * @param {String} data
     * @return {Object} a josn data
     */
    var parseCSV = function(data){
        if (!$ || !$.csv){
            console.log("The csv parser not be loaded!");
            return;
        }
        return $.csv.toObjects(data);
    };

    /**
     * The TSV file parser
     *
     * @memberof module:util/parser
     * @param {String} data
     * @return {Object} a josn data
     */
    var parseTSV = function(data){
        if (!$ || !$.csv){
            console.log("The csv parser not be loaded!");
            return;
        }
        return $.csv.toObjects(data, {separator:"\t"});
    };

    function to_json(lib, workbook, sheetName){
        if (typeof sheetName === "string" || sheetName instanceof String){
            var d = workbook.Sheets[sheetName.toString()];
            if (d){
                var roa = lib.utils.sheet_to_row_object_array(d);
                return roa ? roa : [];
            }else{
                return [];
            }   
        }else{
            var index = -1;
            if (typeof sheetName === "number"){
                index = sheetName > 0 ? sheetName : 0;
            }
            var result = {},
                available = 0;
            workbook.SheetNames.forEach(function(sheetName) {
                var roa = lib.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                if (index >= 0){
                    if (available === index){
                        result = roa;
                    }
                    available += 1;
                    return;
                }
                if(roa.length > 0){
                    result[sheetName] = roa;
                }
            });
            return result;
        }
    }

    var _parseExecl = function(lib, data, options){
        //var wb = lib.read(data, $.extend({type:'binary'},options));
        var wb = lib.read(data, options);
        if (!wb){
            console.log("Parse xls/xlsx error!");
            return;
        }
        if (options.sheetName){
            return to_json(lib, wb, options.sheetName);
        }else if (typeof options.sheetIndex !== "undefined"){
            return to_json(lib, wb, options.sheetIndex);
        }else{
            return to_json(lib, wb);
        }
    };

    /**
     * The xls file parser 
     * If not set sheetName or sheetIndex in options, the process will return an object that contained all sheet's data;Otherwise, return an Array of the special sheet.
     * 
     * @memberof module:util/parser
     * @param {string} data
     * @param {object} options
     * @param {object} [options.sheetName] only return the data of this special sheet.
     * @param {object} [options.sheetIndex] only return the Nth data .
     * @return {object} a josn data
     */
    var parseXLS = function(data, options){
        return _parseExecl(XLS, data, options);
    };
    
    /**
     * The xlsx file parser
     * The behavoir same as parseXLS
     *
     * @memberof module:util/parser
     * @param {string} data
     * @param {object} options
     * @param {object} [options.sheetName] only return the data of this special sheet.
     * @param {object} [options.sheetIndex] only return the Nth data .
     * @return {object} a josn data
     */
    var parseXLSX = function(data, options){
        return _parseExecl(XLSX, data, options);
    };
    
    exports.parseCSV = parseCSV;
    exports.parseTSV = parseTSV;
    exports.parseXLS = parseXLS;
    exports.parseXLSX = parseXLSX;
    
    return exports;
}));


