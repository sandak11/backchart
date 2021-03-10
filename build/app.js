/*********************************************************************************
 *     File Name           :     app.js
 *     Created By          :     Jone Casper
 *     Creation Date       :     [2014-02-11 17:52]
 *     Last Modified       :     [2014-04-09 13:17]
 *     Description         :     Build backchart main app
 **********************************************************************************/
require.config({
	baseUrl: "../src",
	packages: [
	{
		name: "backchart.base"
	},
	{
		name : "backchart.canvasjs"
	},
    {
		name : "backchart.amcharts"
    },
    {
		name : "backchart.echarts"
    },
    { 
        name: "backchart.utils"
    }],
	paths:{
		jquery : "../test/libs/jquery/jquery",
		backbone : "../test/libs/utils/backbone-min",
		underscore : "../test/libs/utils/underscore-min",
		moment : "../test/libs/utils/moment.min",
		excanvas : "../test/libs/utils/excanvas",
		CanvasJS : "../test/libs/charts/canvasjs/canvasjs",
        AmCharts : "../test/libs/charts/amcharts/amcharts",
        echarts : '../test/libs/charts/echarts/echarts'
	},
	shim:{
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		excanvas : [],
		CanvasJS :{
			deps : ['excanvas'],
			exports: 'CanvasJS'
		},
        AmCharts: {
            deps : [],
			exports: 'AmCharts'
		}
	}
});
