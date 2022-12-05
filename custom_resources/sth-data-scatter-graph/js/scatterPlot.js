(function(){
	
	var g_entityId;//global entity id
	var refresh_flag = false;
	// console.log("Start");
	// document.getElementById("refresh").addEventListener("click", function(){refresh_flag = true;});
	
	var title = document.getElementById("entityId"); // This is needed to check if widget is visible atm


	/*===For testing only, comment out when not in testing===*/
	// var graph_input = {id : "Room2"};
	// window.onload = (event) => {
	// 	handlerEntityIdInput(graph_input);
	//   };
	/*=======================================================*/
	
	//Find the id of the selected entity
	var handlerEntityIdInput = function handlerEntityIdInput(graph_input) {
		// console.log("Hidden: ", document.visibilityState);
		//console.log("Title hidden: ", $(title).is(":hidden"));
		
		if (graph_input != null && graph_input.id != null){
			// console.log("not hidden");
			
			
			// if(!$(title).is(":hidden") && refresh_flag){
			// 	refresh_flag = false;
			// 	var entityId = graph_input.id;
			// 	g_entityId = entityId;
			// 	document.getElementById("entityId").innerHTML = entityId;
			// 	init();
			// }
			// else{
				if(graph_input.id != g_entityId){
					var entityId = graph_input.id;
					g_entityId = entityId;
					document.getElementById("entityId").innerHTML = entityId;
					init();
				}
			// }
			
			
			
		}
		
	};
		
	// Remove comment bellow when not in testing
	MashupPlatform.wiring.registerCallback("POIselected", handlerEntityIdInput); 
	

	function loadData(callback) {

		// var proxy_url = "http://65.109.137.229:5000/" // Only for testing outside of Wirecloud
		var proxy_url = MashupPlatform.prefs.get('proxy_url'); // Remove comment when not in testing
		// console.log("ID:", g_entityId);
		var loadLocalData = false,     //change this if you want to perform a request to a real instance of sth-comet
		//change the urlParams and headers if you want to query your own entity data.
			urlParams = {
				dateFrom: '2015-11-26T00:00:00.000Z',
				dateTo: '2015-11-26T23:00:00.000Z',
				lastN: 2000
			},
			headers = {
				//'Fiware-Service': 'something',
				//'Fiware-ServicePath': '/'
				//'X-Auth-Token': 'XXXXXXX'
			};

		if (loadLocalData) {
			return callback(rawTemperatureSamples); //return samples from samples.js
		} else {
			var data1, data2, data3, data4, data5 = "";
			
			var data = "";
			var req1 = $.ajax({
				method: 'GET',
				// dataType: "string",
				url: proxy_url + g_entityId + "/pm1",
				success: function(response) {
					data1 = JSON.stringify(response);
					data1 = data1.slice(1, -1);
					data1 = "[" + data1 + ", ";
					// data = data1;
				}
			});
			var req2 = $.ajax({
				method: 'GET',
				// dataType: "string",
				url: proxy_url + g_entityId + "/pm2_5",
				success: function(response) {
					data2 =  JSON.stringify(response);
					data2 = data2.slice(1, -1);
					data2 = data2 + ", ";
					// data += data1;
				}
			});
			var req3 = $.ajax({
				method: 'GET',
				// dataType: "string",
				url: proxy_url + g_entityId + "/pm10",
				success: function(response) {
					data3 =  JSON.stringify(response);
					data3 = data3.slice(1, -1);
					data3 = data3 + ", ";
					// data += data1;
				}
			});
			var req4 = $.ajax({
				method: 'GET',
				// dataType: "string",
				url: proxy_url + g_entityId + "/rh",
				success: function(response) {
					data4 =  JSON.stringify(response);
					data4 = data4.slice(1, -1);
					data4 = data4 + ", ";
					// data += data1;
				}
			});
			var req5 = $.ajax({
				method: 'GET',
				// dataType: "string",
				url: proxy_url + g_entityId + "/temp",
				success: function(response) {
					data5 =  JSON.stringify(response);
					data5 = data5.slice(1, -1);
					data5 = data5 + "]";
					// data += data1;
				}
			});
			$.when(req1, req2, req3, req4, req5).done(function(){
				data = data1 + data2 + data3 + data4 + data5;
				data = data.replace(/'/g, '"');
				var json_data = JSON.parse(data);
				// console.log(json_data);
				// console.log(data);
				return callback(json_data);
			});
			// return $.ajax({
			// 	method: 'GET',
			// 	url: 'http://localhost:5000/' + g_entityId + "/temp",
			// 	success: function(data) {
			// 		data = data.replace(/'/g, '"');
			// 		data = data.replace(/False/g, 'false');
			// 		json_data = JSON.parse(data); 
			// 		console.log(json_data);
			// 		// return callback(json_data);
			// 	}
			// });
		}
	}

	// function parseSamples(values1, values2) { 
	// 		return {
	// 			x: values1.map(function(point) {return point.attrValue}),
	// 			y: values2.map(function(point) {return point.attrValue})
	// 		}
	// }

	function parseSamples(values1, values2) {
		return values1.map(function(point, index) {
			return {
				x: point.attrValue,
				y: values2[index].attrValue
			}
		});
	}



	/**
	 * draw data. This may be part of a controller code in MVC
	 */
	function loadGraph(data) {

		nv.addGraph(function() {
			var chart = nv.models.scatterChart()
            .showDistX(true)
            .showDistY(true)
            .duration(300)
            .color(d3.scale.category10().range());

			chart.margin({
				top: 30,
				right: 90,
				bottom: 100,
				left: 60
			});


			chart.xAxis.tickFormat(d3.format('.02f'));
        	chart.yAxis.tickFormat(d3.format('.02f'));

			// chart.xAxis
			// 	//.tickFormat(d3.time.format('%x %X'));
			// 	.tickFormat(function(d) {
			// 		return d3.time.format('%d/%m/%Y %X')(new Date(d))
			// 	})
			// 	.rotateLabels(45);

			// if(units == "pm"){
			// 	chart.yAxis
			// 		.tickFormat(d3.format(',.2f'))
			// 		.axisLabel('PM(ug/m^3)');
			// }
			// else{
			// 	chart.yAxis
			// 	.tickFormat(d3.format(',.2f'))
			// 	.axisLabel('RH(%)/Temperatue(C)');
			// }
			
			// chart.y2Axis
            // 	.tickFormat(() => "");

        	// chart.x2Axis
            // 	.tickFormat(() => "");

			//Remove previous tooltip
			// d3.selectAll(".nvtooltip.xy-tooltip").remove();



			d3.select('#chart svg')
				.datum(data)
				.transition().duration(500)
				.call(chart);

			nv.utils.windowResize(chart.update);

			return chart;
		});
	}

	function sum(obj){
		return obj.reduce((a, b) => a + b, 0)
	}

	function findSlope(values){
		var N = values.length;
		var product_xy = values.map(function(points, index){
			return points.x*points.y
		});
		// console.log("product_xy: ", sum(product_xy));
		var sqr_x = values.map(function(points){
			return points.x^2
		});

		function product_of_sums(){
			var result_x = 0;
			var result_y = 0;
			var final_result = 0;
			values.map(function(points, index) {
				result_x += points.x;
				result_y += points.y;
			});
			final_result = result_x*result_y;
			// console.log("X*Y: ", final_result);
			return final_result
		};

		function sum_of_x(){
			var sum_result = 0;
			values.map(function(points){
				sum_result += points.x;
			});
			// console.log("sum_of_x: ", sum_result);
			return sum_result
		};
		

		// console.log(product_xy, sum(product_xy));
		var slope1 = (N*sum(product_xy) - product_of_sums());
		var slope2 = (N*sum(sqr_x)-sum_of_x()^2);
		// console.log("Slope1: ", slope1, "Slope2: ", slope2);
		return slope1/slope2
	}

	function findIntercept(values){
		var add_result = 0;
		values.map(function(points){
			add_result += points.y;
		});
		var intercept = add_result/values.length;
		return intercept
	}

	function init() {

		return loadData(function(data) {
			var values = [], attrName = [];

			values[0] = data[0].value;
			attrName[0] = "PM1";

			values[1] = data[1].value;
			attrName[1] = "PM2.5";

			values[2] = data[2].value;
			attrName[2] = "PM10";

			values[3] = data[3].value;
			// console.log("RH: ", values[3]);

			

			var samples = [
				{
					key: attrName[0],
					values: parseSamples(values[3], values[0]),
					slope: Math.random() - .01,
					intercept: 2
				},
				{
					key: attrName[1],
					values: parseSamples(values[3], values[1]),
					slope: Math.random() - .01,
					intercept: 4
				},
				{
					key: attrName[2],
					values: parseSamples(values[3], values[2]),
					slope: Math.random() - .01,
					intercept: 8
				}
			];
			// console.log("Samples: ", samples);
			samples[0].slope = findSlope(samples[0].values); 
			samples[1].slope = findSlope(samples[1].values); 
			samples[2].slope = findSlope(samples[2].values); 

			samples[0].intercept = findIntercept(samples[0].values); 
			samples[1].intercept = findIntercept(samples[1].values); 
			samples[2].intercept = findIntercept(samples[2].values); 
			// console.log("Samples: ", samples);
			loadGraph(samples);
		
			// else{
			// 	values[0] = data[3].value;
			// 	// attrName[0] = data[data.length - 1].contextResponses[0].contextElement.attributes[0].name;
			// 	attrName[0]= "RH";
			// 	values[1] = data[4].value;
			// 	// attrName[1] = data[data.length - 2].contextResponses[0].contextElement.attributes[0].name;
			// 	attrName[1] = "Temperature";

			// 	var samples = [
			// 		{
			// 			key: attrName[0],
			// 			values: parseSamples(values[0])
			// 		},
			// 		{
			// 			key: attrName[1],
			// 			values: parseSamples(values[1])
			// 		}
			// 	];
				
			// 	loadGraph(samples);
			// }
		});
	}

})();
