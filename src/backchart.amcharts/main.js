/*********************************************************************************
 *     File Name           :     main.js
 *     Created By          :     Jone Casper
 *     Creation Date       :     [2014-02-11 18:16]
 *     Last Modified       :     [2014-02-13 22:45]
 *     Description         :     Backchart AMD package load script
 **********************************************************************************/
define(['./model', './collection', './view'], function(model, collection, view){
	return {
		model : model,      
		collection : collection,        
		view : view,                                
		run : function(callback){                               
			return callback(model, collection, view);                               
		}                                                                                       
	};                                                                                                  
}); 
