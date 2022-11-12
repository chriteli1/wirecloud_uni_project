(function(){
	
	
	var unit = MashupPlatform.prefs.get('unit');
	
	var previous_value = 0;

	//Find the id of the selected entity
	var handlerEntityIdInput = function handlerEntityIdInput(map_output) {
		
		if (map_output != null){
			var entityId = map_output.id;
			//Send the chosen unit value to the operator output 
			switch (unit) {
				case "pm1":
					if(map_output.data.pm1 != previous_value){
						MashupPlatform.wiring.pushEvent("value", map_output.data.pm1);
						previous_value = map_output.data.pm1;
					}
					break;
				case "pm2_5":
					if(map_output.data.pm2_5 != previous_value){
						MashupPlatform.wiring.pushEvent("value", map_output.data.pm2_5);
						previous_value = map_output.data.pm2_5;
					}
					break;
				case "pm10":
					if(map_output.data.pm10 != previous_value){
						MashupPlatform.wiring.pushEvent("value", map_output.data.pm10);
						previous_value = map_output.data.pm10;
					}
					break;
				case "rh":
					if(map_output.data.rh != previous_value){
						MashupPlatform.wiring.pushEvent("value", map_output.data.rh);
						previous_value = map_output.data.rh;
					}
					break;
				case "temp":
					if(map_output.data.temp != previous_value){
						MashupPlatform.wiring.pushEvent("value", map_output.data.temp);
						previous_value = map_output.data.temp;
					}
					break;
				default:
					break;
			}
		}
        return entityId;
    };
		
	MashupPlatform.wiring.registerCallback("POIselected", handlerEntityIdInput);
		
})();