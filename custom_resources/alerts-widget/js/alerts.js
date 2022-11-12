
window.onload = (event) => {
    //console.log('page is fully loaded');
    loadData();
  };

function loadData() {
    var url = MashupPlatform.prefs.get('Proxy_url');
    // var url = "http://localhost:5000/notifications";
    var i = 0;
    var is_empty = true;
    var connection_established = false;
    var connection_tries = 0;
    var alerts_source = new EventSource(url);
    // console.log("Trying to connect to server...");
    alerts_source.onmessage = (e) => {
        if (e.data.length != 0){
            alert_data = e.data.substring(1,e.data.length-1);
            alert_data = alert_data.replace(/'/g, '"');
            alert_data_json = JSON.parse(alert_data);
            id = alert_data_json.id;
            temp = alert_data_json.temp.value;
            var today = new Date();
            var time = today.getHours() + ":" + today.getMinutes() + ":";
            time += today.getSeconds() <= 9 ? '0' + today.getSeconds() : today.getSeconds();
            if(!document.getElementById(id)){
                i = 0;
                // Create the alert box for this specific entity
                var node_div = document.createElement('div');
                var node_input = document.createElement('input');
                node_input.setAttribute("id", id);
                node_input.setAttribute("type", "checkbox");
                var node_label = document.createElement('label');
                node_label.setAttribute("for", id);
                node_label.innerHTML += id;
                var node_ul = document.createElement('ul');
                node_ul.setAttribute("class", "submenu");
                node_ul.setAttribute("id", id);
                node_div.appendChild(node_input);
                node_div.appendChild(node_label);
                node_div.appendChild(node_ul);
                document.querySelector("#alerts").appendChild(node_div);
                
                // Create the actual alert
                var node = document.createElement('li');
                node.setAttribute("class", id);
                node.setAttribute("id", "li" + i);
                i++;
                node.innerHTML += "<span>🔥</span>";
                node.appendChild(document.createTextNode(" " + id + " reached " + temp + " Celcius!(" + time + ")"));
                if(is_empty) {
                    document.getElementById("no_alerts").remove();
                    is_empty = false;
                }
                document.querySelector('ul#' + id).appendChild(node);
                
            }
            else{
                var node = document.createElement('li');
                node.setAttribute("class", id);
                node.setAttribute("id", "li" + i);
                i++;
                node.innerHTML += "<span>🔥</span>";
                node.appendChild(document.createTextNode(" " + id + " reached " + temp + " Celcius!(" + time + ")"));
                if(is_empty) {
                    document.getElementById("no_alerts").remove();
                    is_empty = false;
                }
                document.querySelector('ul#' + id).appendChild(node);
                var current_entity = document.querySelector("ul.submenu#" + id);
                var child_numb = current_entity.childElementCount;
                if (child_numb > 5){
                    current_entity.removeChild(current_entity.firstChild);
                }
            }
        }
        
    };

    alerts_source.onopen = (event) => { connection_established = true; };

    alerts_source.onerror = (event) => {        
        if(!connection_established){
            if(connection_tries>6){
                alerts_source.close();
                // console.log("Connection to proxy server lost, try again later.");
                MashupPlatform.widget.log("Connection to proxy server lost, try again later.", MashupPlatform.log.ERROR);
            }
            else connection_tries++;
        }
        connection_established = false;
     };

    return 0
       
}

