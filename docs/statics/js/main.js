/*********************************************************************************
*     File Name           :     main.js
*     Created By          :     Jone Casper
*     Creation Date       :     [2014-02-17 23:04]
*     Last Modified       :     [2014-02-20 01:29]
*     Description         :     document for Backbone
**********************************************************************************/
(function(window){
	var backchartModel = backchart.canvasjs.model,
	    backchartCollection = backchart.canvasjs.collection,
		backchartView = backchart.canvasjs.view;
	$(function(){
		prettyPrint();

		//The simple chart
		$("#simple-example").height($("#simple-example-code").height());
		var myView = new (backchartView.extend({
			container : document.getElementById("simple-example")
		}));
		var myCollection = new backchartCollection;
		myView.onCollection(myCollection, {
		    type: "column",
			showInLegend: true,
			legendText: "The column"
		});
		myView.onCollection(myCollection, {
			type: "line",
			showInLegend: true,
   			legendText: "The line"			
		});
		myCollection.set([
			{ x: 10, y: 97800, label: "UAE"},
			{ x: 20, y: 267017,  label: "Saudi Arabia" },
			{ x: 30, y: 116000,  label: "Russia"},
			{ x: 40, y: 297571, label: "Venezuela"},
			{ x: 50, y: 154580,  label: "Iran"},
			{ x: 60, y: 175200,  label: "Canada"},
			{ x: 70, y: 20682,  label: "US"},
			{ x: 80, y: 20350,  label: "China"}
		]);

		//The BEA example
		$("#bea-example").height($("#bea-example-code").height());
		var viewOptions = {
			legend:{
				fontSize: 13
			},
			axisX:{
				interval : 1,
				labelFontSize: 13
			},
			axisY:{
				labelFontSize: 13
			}
		};
		//Define the view inherit to backchart.canvasjs.view;
		var BEAView = new (backchartView.extend({
			container : document.getElementById("bea-example")
		}))(viewOptions);
		
		//Filter United States
		var BEAFView = new (backchartView.extend({
			container : document.getElementById("bea-example2")
		}))(viewOptions);

		//Sort in descending order
		var BEASView = new (backchartView.extend({
			container : document.getElementById("bea-example3")
		}))(viewOptions);
		
		//Pie example
		var BEAPieView = new (backchartView.extend({
			container : document.getElementById("bea-example4")
		}))(
			$.extend({}, viewOptions ,{
				toolTip:{
					content: "{label} : {y} ({percent})"
				}
			})
		);
		//Pie select2 example
		var BEAPieSelectView = new (backchartView.extend({
			container : document.getElementById("bea-example5")
		}))(
			$.extend({}, viewOptions ,{
				toolTip:{
					content: "{label} : {y} ({percent})"
				}
			})
		);


		/**
		 * Define the model to deal with each row of data
		 * You should covered each data received to your chart can accept.
		 * We used CanvasJS, so add label,legendText and y in my data
		 **/
		var BEAModel = backchartModel.extend({
			parse : function(respo){
				return {
					label : respo.GeoName,
					legendText: respo.GeoName,
					y : parseInt(respo.DataValue,10)
				}
			}
		});
		//Define collection and set the URL and the name of dataset in the result
		var BEACollection = new (backchartCollection.extend({
			model: BEAModel,
			url: "http://www.bea.gov/api/data",
			parse : function(respo){
				//remove United States average 
				return respo.BEAAPI ? respo.BEAAPI.Results.Data : [];
			}
		}));
		//Bind collection to view
		BEAView.onCollection(BEACollection, {
			type: "bar"
		});

		//do some filter after 
		BEACollection.on("sync", function(){
			var usModel = BEACollection.findWhere({label: "United States"});
			if (usModel){
				//Average example
				var usAverage = usModel.get("y");
				var aboveAvg = BEACollection.filter(function(model){
					return model.get("y") > usAverage;
				});
				var BEAFCollection = new backchartCollection(aboveAvg);
				BEAFView.onCollection(BEAFCollection, {
					type: "bar"
				},{
					renderAfterOn : true
				});

				//Sort example
				var BEASCollection = BEAFCollection.clone();
				BEASCollection.comparator = function(a, b){
					return a.get("y")-b.get("y");
				};
				BEASView.onCollection(BEASCollection, {
					type: "bar"
				},{
					renderAfterOn : true
				});

				BEASCollection.sort();

				//Pie example
				var PieBEACollection = BEACollection.clone();
				var usAverageModel = PieBEACollection.findWhere({label: "United States"});
				var usAverage = usAverageModel.get("y");
				PieBEACollection.remove(usAverageModel);

				var otherValue = 0,
				totalValue = 0;
				var modelSet = PieBEACollection.filter(function(model){
					var val = model.get("y");
					totalValue += val;
					if (val < usAverage){
						otherValue += val;
						return false;
					}
					return true;
				});
				modelSet.push(new BEAModel({GeoName:"other",DataValue:otherValue}));
				$.each(modelSet, function(index, model){
					model.set("percent", (model.get("y")/totalValue * 100).toFixed(2) + "%", {silent:true});
				});
				
				var bindID = BEAPieView.onCollection(PieBEACollection, {
					type: "bar",
					showInLegend: true
				},{
					renderAfterOn : true
				});

				//Change the type
				BEAPieView.getRenderOptions(bindID).type = "pie";
				//Add the percentage to all models attribute
				PieBEACollection.reset(modelSet);

				//Pie select2
				PieSelectBEACollection = PieBEACollection.clone();
				BEAPieSelectView.onCollection(PieSelectBEACollection , {
					type: "pie",
					showInLegend: true
				},{
					renderAfterOn : true
				});

				//init select2
				var states = (function(){
					var ret = [];
					PieSelectBEACollection.each(function(model){
						ret.push(model.get("label"));
					});
					return ret;
				})();
				$("#bea-example5-select").select2({
					multiple : true,
				    placeholder: "Select a State",
					data:(function(){
						var ret = [];
						$.each(states, function(index ,value){
							ret.push({"id" : value, "text" : value});
						});
						return ret;
					})()
				});
				$("#bea-example5-select").select2("val", states);
				$("#bea-example5-select").on("change", function(e){
					if (e.added){
						var model = PieSelectBEACollection.findWhere({"label" : e.added.id});
						PieSelectBEACollection.show(model);
					}else if(e.removed){
						var model = PieSelectBEACollection.findWhere({"label" : e.removed.id});
						PieSelectBEACollection.hide(model);
					}
				});


			}
		});

		//Fetch data
		BEACollection.fetch({
			dataType: "jsonp",
			jsonp:"jsonp",
			data: {
				UserID : "2A28DB6F-5FE7-4A05-8899-D6F4B72C5102",
				method : "GetData",
				datasetname : "RegionalData",
				KeyCode : "PCPI_CI",
				GeoFIPS : "STATE",
				Year : "2011",
				ResultFormat : "json"
			}
		});
	});
})(window)


