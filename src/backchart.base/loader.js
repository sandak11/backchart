/*********************************************************************************
 *     File Name           :     loader.js
 *     Created By          :     Jone Casper(xu.chenhui@live.com)
 *     Creation Date       :     [2014-03-25 22:14]
 *     Last Modified       :     [2014-04-06 05:17]
 *     Description         :     A loader for loading module
 **********************************************************************************/

(function(root, name, factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define(function(){
            return factory();
        });
    }else if (typeof module !== 'undefined' && module.exports && typeof require === 'function'){
        module.exports = factory();
    }else{
        var namespaces = name.split("."),
        scope = root || this;
        for (var i=0; i<namespaces.length; i++) {
            var p = namespaces[i],
            ex = scope[p];
            scope = scope[p] = (i === namespaces.length - 1) ? 
                factory():
                (ex || {});
        }
    }
}(this, "backchart.base.loader",function(){
    var root = this;
    var exports = function(name, callback){
        var args = [];
        if (typeof define === 'function' && define.amd) {
            require(name instanceof Array ? name : [name], callback);
        }else if (typeof module !== 'undefined' && module.exports && typeof require === 'function'){
            if (name instanceof Array){
                for (var i=0; i<name.length ; i++){
                    args.push(require(name[i]));
                }
                callback.apply(this, args);
            }else{
		        callback.call(this, require(name));
            }
        }else{
            if (typeof name === "string" || name instanceof String){
                name = [name];
            }
            for (var n=0; n<name.length; n++){
                var namespaces = name[n],
                    scope = root;
                namespaces = namespaces.replace("/",".").split(".");
                for (var j=0; j<namespaces.length; j++) {
                    var p = namespaces[j],
                    ex = scope[p];
                    if (!ex) {
                        args.push(null);
                        break;
                        //callback.call(this, null);
                    }    
                    if (j === namespaces.length -1){
                        args.push(ex);
                        //callback.call(this, ex);
                    }
                    scope = ex;
                }
            }
            callback.apply(this, args);
        }
    };
    return exports;
}));
