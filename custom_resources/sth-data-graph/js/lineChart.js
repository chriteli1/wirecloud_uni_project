(function(){
	
	var g_entityId;//global entity id
	var pause_flag = false;
	// console.log("Start");
	document.getElementById("pause").addEventListener("click", Pause_Live);
	
	function Pause_Live(){
		pause_flag = !pause_flag;
		document.getElementById("pause").innerHTML = pause_flag ? "Go Live" : "Pause Feed";
		// console.log("pause inside function: ", pause_flag);
	}

	var title = document.getElementById("entityId"); // This is needed to check if widget is visible atm

	var refresh_cntr = 0;


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
		refresh_cntr++ ;
		if (graph_input != null && graph_input.id != null){
			// console.log("not hidden");
			
			if(!pause_flag && !$(title).is(":hidden") && refresh_cntr > 25){
				refresh_cntr = 0;
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
	
	var g_attr_names = []; //Global attributes' names
	function loadData(callback) {

		// var proxy_url = "http://65.109.137.229:5000/"
		var proxy_url = MashupPlatform.prefs.get('proxy_url'); // Remove comment when not in testing
		// headers = {
		// 	'Fiware-Service': 'something',
		// 	'Fiware-ServicePath': '/'
		// 	// 'X-Auth-Token': 'XXXXXXX'
		// };
		// console.log("ID:", g_entityId);

		// var data1, data2, data3, data4, data5 = "";
		
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
			url: proxy_url + g_entityId + "/" + attr_name,
			success: function(response){
				data_temp = JSON.stringify(response);
				data_temp = data_temp.slice(1, -1);
				// data_total += data_temp; 
				// console.log("data_temp: ", data_temp);
				return data_temp
			}
		});
		
	}

	function parseSamples(values) {
		return values.map(function(point) {
			return {
				x: new Date(point.recvTime),
				y: point.attrValue
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
				//.tickFormat(d3.time.format('%x %X'));
				.tickFormat(function(d) {
					return d3.time.format('%d/%m/%Y %X')(new Date(d))
				})
				.rotateLabels(45);

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
			var values = [], attrName = [];
			var samples = [];
			for(var i=0;i<data.length;i++){
				// values[i] = data[i].value;
				// attrName[i] = g_attr_names[i];
				samples[i] = {
								key: g_attr_names[i],
								values: parseSamples(data[i].value)
							};
			}

			loadGraph(samples);
			
		});
	}

})();
