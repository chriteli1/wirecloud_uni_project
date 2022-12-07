(function(){
	
	
	var measurement = MashupPlatform.prefs.get('measurement');
	
	var previous_value = 0;

	//Find the id of the selected entity
	var handlerEntityIdInput = function handlerEntityIdInput(map_output) {
		
		if (map_output != null){
			
			//Send the chosen unit value to the operator output
			if(map_output.data.measurement != previous_value){
				MashupPlatform.wiring.pushEvent("value", map_output.data[measurement]);
				previous_value = map_output.data[measurement];
			}
		}
    };
		
	MashupPlatform.wiring.registerCallback("POIselected", handlerEntityIdInput);
		
})();