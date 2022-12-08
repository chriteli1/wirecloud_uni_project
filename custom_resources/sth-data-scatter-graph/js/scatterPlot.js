(function(){
	
	var g_entityId;//global entity id
	// var refresh_flag = false;
	// console.log("Start");
	// document.getElementById("refresh").addEventListener("click", function(){refresh_flag = true;});
	

	

	var title = document.getElementById("entityId"); // This is needed to check if widget is visible atm


	/*===For testing only, comment out when not in testing===*/
	var graph_input = {id : "Room2"};
	window.onload = (event) => {
		handlerEntityIdInput(graph_input);
	  };
	/*=======================================================*/
	


	/*=============== Testing ==================*/
	// const xAxisMeasurement = "rh"; //For testing only
	// const yAxisMeasurement = "pm1,temp,pm2_5"; //For testing only
	// var aggr_method = "sum"; //For testing only
	// var aggr_period = "hour"; //For testing only
	// var proxy_url = "http://65.109.137.229:5000/" //For testing only
	/* ======================================== */

	/*=================================== Wirecloud =================================*/
	var aggr_method = MashupPlatform.prefs.get('aggr_method'); //Comment out when testing outside wirecloud
	var aggr_period = MashupPlatform.prefs.get('aggr_period'); //Comment out when testing outside wirecloud
	var proxy_url = MashupPlatform.prefs.get('proxy_url'); //Comment out when testing outside wirecloud
	var xAxisMeasurement = MashupPlatform.prefs.get('x_measurement'); //Comment out when testing outside wirecloud
	var yAxisMeasurement = MashupPlatform.prefs.get('y_measurements').split(","); //Comment out when testing outside wirecloud
	/*===============================================================================*/



	var xAxisIndex = 0; 
	var yAxisIndex = []; 
	
	


	//Find the id of the selected entity
	var handlerEntityIdInput = function handlerEntityIdInput(graph_input) {
		// console.log("Hidden: ", document.visibilityState);
		//console.log("Title hidden: ", $(title).is(":hidden"));
		
		if (graph_input != null && graph_input.id != null && !$(title).is(":hidden")){
			
			if(graph_input.id != g_entityId){
				var entityId = graph_input.id;
				g_entityId = entityId;
				document.getElementById("entityId").innerHTML = entityId;
				console.log("OK");
				init();
			}		
		
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

			if(yAxisMeasurement.includes(attr_name)) yAxisIndex.push(req_cntr-1);
			if(xAxisMeasurement == attr_name) xAxisIndex = req_cntr-1;

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


	function parseSamples(values1, values2) {
		return values1.map(function(point, index) {
			var keys1 = Object.keys(point); //Find the keys of input object
			var value_name1 = keys1[2]; //Find the name of aggregation method chosen by the user
			var value1 = point[keys1[2]]; //Find the value to be plotted

			var keys2 = Object.keys(values2[index]); //Find the keys of input object
			var value_name2 = keys2[2]; //Find the name of aggregation method chosen by the user
			var value2 = values2[index][keys2[2]]; //Find the value to be plotted

			return {
				x: value2 = value_name2 == "sum" ? value2/values2[index].samples : value2,
				y: value1 = value_name1 == "sum" ? value1/point.samples : value1
			}
		});
	}



	/**
	 * draw data. This may be part of a controller code in MVC
	 */
	function loadGraph(data) {

		nv.addGraph(function() {
			var chart = nv.models.scatterChart()
            .showDistX(false)
            .showDistY(false)
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

	function findIntercept(values, slope){
		var max_y = values[0].y;
		var min_y = values[0].y;
		var min_x = values[0].x;
		values.map(function(points){
			max_y = points.y > max_y ? points.y : max_y;
			min_y = points.y < min_y ? points.y : min_y;
			min_x = points.x < min_x ? points.x : min_x;
		});
		var extra_y =  slope*min_x;
		var intercept = (max_y+min_y)/2 - extra_y;
		return intercept
	}

	function init() {

		return loadData(function(data) {
			
			var values = [];
			var samples_values_total = [];
			var samples = [];
			// attrName = ["PM1", "PM2.5", "PM10", "RH", "Temperature"];
			for (let i=0; i < data.length; i++){
				for(let j=0; j < data[i].value.length; j++){
					values = j > 0 ? values.concat(data[i].value[j].points) : data[i].value[j].points;		
				}

				samples_values_total[i] = values;
				console.log(samples_values_total);

				
			}
			console.log("Y axis: ", yAxisIndex);
			console.log("Y axis: ", xAxisIndex);
			for (let i=0; i < data.length; i++){
				if (yAxisIndex.includes(i)){
					samples[i] =
							{	
								key: g_attr_names[i],
								values: parseSamples(samples_values_total[i], samples_values_total[xAxisIndex]),
							};
					samples[i].slope = findSlope(samples[i].values); 

					samples[i].intercept = findIntercept(samples[i].values, samples[i].slope); 
				}
			}
			samples = $.grep(samples, n => n == 0 || n);
			console.log("Samples: ", samples);

			
			loadGraph(samples);
		
		});
	}

})();
