
window.onload = (event) => {
    //console.log('page is fully loaded');
    loadData();
  };

function loadData() {
    // var url = MashupPlatform.prefs.get('Proxy_url');
    var url = "http://localhost:5000/notifications";
    var requested_attribute = "temp"; // Choose which attribute you want to receive alerts about
    var i = 0;
    var is_empty = true;
    var connection_established = false;
    var connection_tries = 0;
    var alerts_source = new EventSource(url);
    // console.log("Trying to connect to server...");
    alerts_source.onmessage = (e) => {
        if (e.data.length != 0){

            /* Modify data to be JSON ready */
            alert_data = e.data.substring(1,e.data.length-1);
            alert_data = alert_data.replace(/'/g, '"');
            alert_data_json = JSON.parse(alert_data);
            /*==============================*/

            id = alert_data_json.id;

            // Function to get attribute value by json index (so the name of attribute doesn't matter) */
            Object.prototype.getByIndex = function(index) {
                return this[Object.keys(this)[index]];
            };

            /*Get attribute name and value*/
            attribute = Object.keys(alert_data_json)[2];
            attr_value = alert_data_json.getByIndex(2).value;
            // console.log(attribute, ": ", attr_value);
            /*=============================/

            /* Get the timestamp of the notification */
            var today = new Date();
            var time = today.getHours() <= 9 ? '0' + today.getHours() + ":" : today.getHours() + ":";
            time += today.getMinutes() <= 9 ? '0' + today.getMinutes() + ":" : today.getMinutes() + ":";
            time += today.getSeconds() <= 9 ? '0' + today.getSeconds() : today.getSeconds();
            /*=======================================*/

            // If it's the first time this entity has a notification 
            if(!document.getElementById(id)){
                i = 0;
                // Create the alert box for this specific entity
                var node_details = document.createElement('details');
                node_details.setAttribute("id", id);
                var node_summary = document.createElement('summary');
                node_summary.innerHTML += id;
                var node_ul = document.createElement('ul');
                node_ul.setAttribute("class", "submenu");
                node_ul.setAttribute("id", id);
                node_details.appendChild(node_summary);
                node_details.appendChild(node_ul);
                document.querySelector("#alerts").appendChild(node_details);

                /* Remove "No alerts" message */
                if(is_empty) {
                    document.getElementById("no_alerts").remove();
                    is_empty = false;
                }
                /* ========================= */
                
            }

            /* Create the actual alert */
            if (attribute == "temp"){
                var node = document.createElement('li');
                node.setAttribute("class", id);
                i++;
                node.innerHTML += "<span>⚠</span>";
                node.appendChild(document.createTextNode(" " + attribute + " reached " + attr_value + " (" + time + ")"));
                document.querySelector('ul#' + id).appendChild(node);
                var current_entity = document.querySelector("ul.submenu#" + id);
                var child_numb = current_entity.childElementCount;
                if (child_numb > 5){
                    current_entity.removeChild(current_entity.firstChild);
                }
            }
            /*======================================================*/
        }
        
    };

    /* Check if the connection is established. If not, after 5 tries, stop trying and throw error. */
    alerts_source.onopen = (event) => { connection_established = true; };

    alerts_source.onerror = (event) => {        
        if(!connection_established){
            if(connection_tries>6){
                alerts_source.close();
                // console.log("Connection to proxy server lost, try again later.");
                // MashupPlatform.widget.log("Connection to proxy server lost, try again later.", MashupPlatform.log.ERROR);
            }
            else connection_tries++;
        }
        connection_established = false;
    };
    /*============================================================================================*/
    return 0
       
}

