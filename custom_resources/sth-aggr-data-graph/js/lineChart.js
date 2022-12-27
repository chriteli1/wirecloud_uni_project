(function(){
	
	var g_entityId;//global entity id

	/*===For testing only, comment out when not in testing===*/
	// var graph_input = {id : "Room2"};
	// window.onload = (event) => {
	// 	handlerEntityIdInput(graph_input);
	//   };
	/*=======================================================*/
	
	// var aggr_method = "sum"; //For testing only
	// var aggr_period = "hour"; //For testing only
	// var proxy_url = "http://65.109.137.229:5000/" //For testing only
	var aggr_method = MashupPlatform.prefs.get('aggr_method'); //Comment out when testing outside wirecloud
	var aggr_period = MashupPlatform.prefs.get('aggr_period'); //Comment out when testing outside wirecloud
	var proxy_url = MashupPlatform.prefs.get('proxy_url'); //Comment out when testing outside wirecloud
			


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
	



	var g_attr_names = []; //Global attributes' names
	function loadData(callback) {

		
		var data_total = "";
		// var data_temp = "";
		var num_of_attrs = 0;
		var orion_data;
		var req_cntr = 1;
		var orion_req = $.ajax({
			method: 'GET',
			url: proxy_url + g_entityId,
			// headers: headers,
			success: function(response) {
				// console.log("orion response: ", response);
				var data = response.replace(/'/g, "\"");
				// console.log(data);
				var data_json = JSON.parse(data);
				num_of_attrs = Object.keys(data_json).length;
				
				orion_data = data_json;
				// console.log(orion_data); 

			}
		});
		var req_cntr = 1;
		$.when(orion_req).done(function create_data() {
			// while(req_cntr < num_of_attrs){
			var attr_name = Object.keys(orion_data)[req_cntr];
			g_attr_names.push(attr_name);
			comet_req(attr_name, proxy_url).then(
				function(data){
					// console.log("data: ", data);
					req_cntr++;
					// console.log(req_cntr);
					if(req_cntr < num_of_attrs) {
						data_total += data + ", ";
						create_data();
					}
					else {
						data_total = "[" + data_total;
						data_total += data + "]";
						data_total = data_total.replace(/'/g, '"');
						// console.log(data_total);
						// console.log("Total: ", JSON.parse(data_total));

						callback(JSON.parse(data_total));
					}
				}
			);
		});
		
	}
	
	async function comet_req(attr_name, proxy_url){
		var data_temp;
		return $.ajax({
			method: 'GET',
			url: proxy_url + g_entityId + "/" + attr_name + "/" + aggr_method + "/" + aggr_period,
			success: function(response){
				data_temp = JSON.stringify(response);
				data_temp = data_temp.slice(1, -1);
				// data_total += data_temp; 
				// console.log("data_temp: ", data_temp);
				return data_temp
			}
		});
		
	}
	

	function parseSamples(values, origin) {
		return values.map(function(point) {
			var keys = Object.keys(point); //Find the keys of input object
			var value_name = keys[2]; //Find which key to use based on the aggregation method chosen by the user

			var value = point[keys[2]]; 
			// console.log("value: ", typeof(value));
			var time_point = Date.parse(origin); //Timestamp of the origin of the aggregated values
			switch (aggr_period){
				case "minute":
					//Add the offset (aggregation method=minutes so (time*60seconds)*1000milliseconds))
					time_point += point.offset*60000;
					break;
				case "hour":
					//Add the offset (aggregation method=minutes so (time*60seconds*60minutes)*1000milliseconds))
					time_point += point.offset*60000*60;
					break;
				case "day":
					//Add the offset (aggregation method=minutes so (time*60seconds*60min*24hours)*1000milliseconds))
					time_point += point.offset*60000*60*24;
					break;
				default:
					break;
			}
			// console.log(time_point);

			return {
				x: new Date(time_point),
				y: value = value_name == "sum" ? value/point.samples : value
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
				.rotateLabels(45)
				.axisLabel('↓ Focus/Zoom ↓');
			
				
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
			var values = [], attrName = [], origin;
			var samples_values_temp = [], samples = [];
			attrName = ["PM1", "PM2.5", "PM10", "RH", "Temperature"];
			for (let i=0; i < data.length; i++){
				for(let j=0; j < data[i].value.length; j++){
					values = data[i].value[j].points;
					origin = data[i].value[j]._id.origin;
					samples_values_temp = j > 0 ? samples_values_temp.concat(parseSamples(values, origin)) : parseSamples(values, origin);
					
				}

				samples[i] = {
					key: g_attr_names[i],
					values: samples_values_temp
				};
			}

			
			loadGraph(samples);
		
		});
	}

})();
