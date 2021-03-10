/*********************************************************************************
 *     File Name           :     main.js
 *     Created By          :     Jone Casper
 *     Creation Date       :     [2014-02-11 18:16]
 *     Last Modified       :     [2014-04-06 05:18]
 *     Description         :     Backchart AMD package load script
 **********************************************************************************/
define(['./model', './collection', './view', "./loader", "./logger"], function(model, collection, view, loader){
    return {
        loader: loader,
        model: model,      
        collection: collection,        
        view: view,                                
        run: function(callback){                               
            return callback(model, collection, view);                               
        }                                                                                       
    };                                                                                                  
}); 
