
(function(){
	
	var g_entityId;//global entity id
	// var pause_flag = false;
	// console.log("Start");
	// document.getElementById("pause").addEventListener("click", Pause_Live);
	// function Pause_Live(){
	// 	pause_flag = !pause_flag;
	// 	document.getElementById("pause").innerHTML = pause_flag ? "Go Live" : "Pause Feed";
	// 	console.log("pause inside function: ", pause_flag);
	// }

	/*===For testing only, comment out when not in testing===*/
	// var graph_input = {id : "Room2"};
	// window.onload = (event) => {
	// 	handlerEntityIdInput(graph_input);
	//   };
	/*=======================================================*/
	
	//Find the id of the selected entity
	var handlerEntityIdInput = function handlerEntityIdInput(graph_input) {
		// console.log("Hidden: ", document.visibilityState);
		
		if (graph_input != null && graph_input.id != null){
			// console.log("not hidden");
			// if(!pause_flag){
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

			// var aggr_method = "sum"; //For testing only

			var aggr_method = MashupPlatform.prefs.get('aggr_method'); //Comment out when testing outside wirecloud
			var data1, data2, data3, data4, data5 = "";

			var data = "";
			var req1 = $.ajax({
				method: 'GET',
				// dataType: "string",
				url: 'http://localhost:5000/' + g_entityId + "/pm1/" + aggr_method,
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
				url: 'http://localhost:5000/' + g_entityId + "/pm2_5/" + aggr_method,
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
				url: 'http://localhost:5000/' + g_entityId + "/pm10/" + aggr_method,
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
				url: 'http://localhost:5000/' + g_entityId + "/rh/" + aggr_method,
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
				url: 'http://localhost:5000/' + g_entityId + "/temp/" + aggr_method,
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
				json_data = JSON.parse(data);
				// console.log(json_data);
				// console.log(data);
				return callback(json_data);
			});
			// return $.ajax({
			// 	method: 'GET',
			// 	//Change this URL if you want to use your own sth-comet
			// 	//url: 'http://localhost:8666/STH/v1/contextEntities/type/room/id/Room2/attributes/temp',
			// 	url: 'http://localhost:5000/' + g_entityId + "/",
			// 	//data: urlParams,
			// 	//headers: headers,
			// 	//dataType: 'str',
			// 	success: function(data) {
			// 		data = data.replace(/'/g, '"');
			// 		data = data.replace(/False/g, 'false');
			// 		json_data = JSON.parse(data); 
			// 		console.log(json_data);
			// 		return callback(json_data);
			// 	}
			// });
		}
	}

	function parseSamples(values, origin) {
		return values.map(function(point) {
			var keys = Object.keys(point); //Find the keys of input object
			var value = point[keys[2]]; //Find which key to use based on the aggregation method chosen by the user
			
			var time_point = Date.parse(origin); //Timestamp of the origin of the aggregated values
			time_point += point.offset*60000; //Add the offset (aggregation method=minutes so (time*60seconds)*1000milliseconds))
			// console.log(time_point);

			return {
				x: new Date(time_point),
				y: value = "sum" ? value/point.samples : value
			}
		});
	}

	/**
	 * draw data. This may be part of a controller code in MVC
	 */
	function loadGraph(data) {

		nv.addGraph(function() {
			var chart = nv.models.lineWithFocusChart();
			chart.margin({
				top: 30,
				right: 90,
				bottom: 100,
				left: 60
			});
			chart.xAxis
				// .tickFormat(d3.time.format('%x %X'))
				.tickFormat(function(d) {
					return d3.time.format('%d/%m/%Y %X')(new Date(d))
				})
				.rotateLabels(45);

			
				
			chart.yAxis
			.tickFormat(d3.format(',.2f'))
			.axisLabel('Units');
			
			
			chart.y2Axis
            	.tickFormat(() => "");

        	chart.x2Axis
            	.tickFormat(() => "");

			//Remove previous tooltip
			d3.selectAll(".nvtooltip.xy-tooltip").remove();



			d3.select('#chart svg')
				.datum(data)
				.transition().duration(500)
				.call(chart);

			nv.utils.windowResize(chart.update);

			return chart;
		});
	}


	
	function init() {

		return loadData(function(data) {
			var values = [], attrName = [], origin = [];

			values[0] = data[0].value[0].points;
			// attrName[2] = data[data.length - 3].contextResponses[0].contextElement.attributes[0].name;
			attrName[0] = "PM1";
			origin[0] = data[0].value[0]._id.origin;

			values[1] = data[1].value[0].points;
			// attrName[3] = data[data.length - 4].contextResponses[0].contextElement.attributes[0].name;
			attrName[1] = "PM2.5";
			origin[1] = data[1].value[0]._id.origin;

			values[2] = data[2].value[0].points;
			// attrName[4] = data[data.length - 5].contextResponses[0].contextElement.attributes[0].name;
			attrName[2] = "PM10";
			origin[2] = data[2].value[0]._id.origin;


			// var samples = [
			// 	{
			// 		key: attrName[2],
			// 		values: parseSamples(values[2])
			// 	},
			// 	{
			// 		key: attrName[3],
			// 		values: parseSamples(values[3])
			// 	},
			// 	{
			// 		key: attrName[4],
			// 		values: parseSamples(values[4])
			// 	}
			// ];
			
			// loadGraph(samples);
		
		
			values[3] = data[3].value[0].points;
			// attrName[0] = data[data.length - 1].contextResponses[0].contextElement.attributes[0].name;
			attrName[3]= "RH";
			origin[3] = data[3].value[0]._id.origin;

			values[4] = data[4].value[0].points;
			// attrName[1] = data[data.length - 2].contextResponses[0].contextElement.attributes[0].name;
			attrName[4] = "Temperature";
			origin[4] = data[4].value[0]._id.origin;

			var samples = [
				{
					key: attrName[0],
					values: parseSamples(values[0], origin[0])
				},
				{
					key: attrName[1],
					values: parseSamples(values[1], origin[1])
				},
				{
					key: attrName[2],
					values: parseSamples(values[2], origin[2])
				},
				{
					key: attrName[3],
					values: parseSamples(values[3], origin[3])
				},
				{
					key: attrName[4],
					values: parseSamples(values[4], origin[4])
				}
			];
			
			loadGraph(samples);
		
		});
	}

})();
