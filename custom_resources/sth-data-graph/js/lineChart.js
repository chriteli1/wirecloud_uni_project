
(function(){
	
	var g_entityId;//global entity id
	var pause_flag = false;
	console.log("Start");
	document.getElementById("pause").addEventListener("click", Pause_Live);
	function Pause_Live(){
		pause_flag = !pause_flag;
		document.getElementById("pause").innerHTML = pause_flag ? "Go Live" : "Pause Feed";
		console.log("pause inside function: ", pause_flag);
	}

	/*===For testing only, comment out when not in testing===*/
	// var graph_input = {id : "Room2"};
	// window.onload = (event) => {
	// 	handlerEntityIdInput(graph_input);
	//   };
	/*=======================================================*/
	
	//Find the id of the selected entity
	var handlerEntityIdInput = function handlerEntityIdInput(graph_input) {
		// console.log("Hidden: ", document.visibilityState);
		
		if (graph_input != null && graph_input.id != null && document.hasFocus()){
			// console.log("not hidden");
			if(!pause_flag){
				var entityId = graph_input.id;
				g_entityId = entityId;
				document.getElementById("entityId").innerHTML = entityId;
				init();
			}
			else{
				if(graph_input.id != g_entityId){
					var entityId = graph_input.id;
					g_entityId = entityId;
					document.getElementById("entityId").innerHTML = entityId;
					init();
				}
			}
			
			
			
		}
		
	};
		
	// Remove comment bellow when not in testing
	MashupPlatform.wiring.registerCallback("POIselected", handlerEntityIdInput); 
	

	function loadData(callback) {

		console.log("ID:", g_entityId);
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

			return $.ajax({
				method: 'GET',
				//Change this URL if you want to use your own sth-comet
				//url: 'http://localhost:8666/STH/v1/contextEntities/type/room/id/Room2/attributes/temp',
				url: 'http://localhost:5000/' + g_entityId,
				//data: urlParams,
				//headers: headers,
				//dataType: 'str',
				success: function(data) {
					data = data.replace(/'/g, '"');
					data = data.replace(/False/g, 'false');
					json_data = JSON.parse(data); 
					console.log(json_data);
					return callback(json_data);
				}
			});
		}
	}

	function parseSamples(values) {
		return values.map(function(point) {
			return {
				x: new Date(point.recvTime),
				y: point.attrValue
			}
		});
	}

	// var units = "pm"; // Comment out when not in testing
	var units = MashupPlatform.prefs.get('units'); // Remove comment when not in testing
	console.log("Units: ", units, ", ", typeof units);
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
				//.tickFormat(d3.time.format('%x %X'));
				.tickFormat(function(d) {
					return d3.time.format('%d/%m/%Y %X')(new Date(d))
				})
				.rotateLabels(45);

			if(units == "pm"){
				chart.yAxis
					.tickFormat(d3.format(',.2f'))
					.axisLabel('PM(ug/m^3)');
			}
			else{
				chart.yAxis
				.tickFormat(d3.format(',.2f'))
				.axisLabel('RH(%)/Temperatue(C)');
			}
			
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
			var values = [], attrName = [];
			if (units == "pm"){
				
				values[2] = data[data.length - 3].contextResponses[0].contextElement.attributes[0].values;
				attrName[2] = data[data.length - 3].contextResponses[0].contextElement.attributes[0].name;
				values[3] = data[data.length - 4].contextResponses[0].contextElement.attributes[0].values;
				attrName[3] = data[data.length - 4].contextResponses[0].contextElement.attributes[0].name;
				values[4] = data[data.length - 5].contextResponses[0].contextElement.attributes[0].values;
				attrName[4] = data[data.length - 5].contextResponses[0].contextElement.attributes[0].name;

				var samples = [
					{
						key: attrName[2],
						values: parseSamples(values[2])
					},
					{
						key: attrName[3],
						values: parseSamples(values[3])
					},
					{
						key: attrName[4],
						values: parseSamples(values[4])
					}
				];
				
				loadGraph(samples);
			}
			else{
				values[0] = data[data.length - 1].contextResponses[0].contextElement.attributes[0].values;
				attrName[0] = data[data.length - 1].contextResponses[0].contextElement.attributes[0].name;
				values[1] = data[data.length - 2].contextResponses[0].contextElement.attributes[0].values;
				attrName[1] = data[data.length - 2].contextResponses[0].contextElement.attributes[0].name;
				
				var samples = [
					{
						key: attrName[0],
						values: parseSamples(values[0])
					},
					{
						key: attrName[1],
						values: parseSamples(values[1])
					}
				];
				
				loadGraph(samples);
			}
		});
	}

})();
