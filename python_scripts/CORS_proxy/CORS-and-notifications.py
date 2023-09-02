# v1.0
from crypt import methods
import mimetypes
from urllib import response
from wsgiref.headers import Headers
from flask import Flask, request, make_response, Response, jsonify
import requests
import json
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

post_flag = False
alerts = []
alerts_index = 1

# ==========Handle inoming noifications from Orion========
@app.route('/notifications', methods=['POST', 'GET'])
def receive_notification():
    global alerts, alerts_index
    if request.method == 'POST':
        notification = request.json
        # print(notification)
        alerts.extend(notification["data"])
        # print(type(alerts))
        # print(alerts)
        return notification 
    if request.method == 'GET':
        alerts_data = "data: " + str(alerts) + "\n\n"
        # print(alerts_data)
        resp = make_response(alerts_data)
        h = resp.headers
        h["Content-Type"] = "text/event-stream"
        # h["Access-Control-Allow-Origin"] = "*"
        alerts = []
        # alerts_index = 1
        return resp
# ================================================================

# =========Send data from Comet when requested from a widget=========
@app.route('/<string:entity_id>/<string:attr>/', methods=['GET'])
def send_data_to_wirecloud(entity_id, attr):
    lastN = "300"
    url = "http://localhost:8666/STH/v2/entities/" + entity_id + "/attrs/" + attr + "?type=room&lastN=" + lastN
    
    payload = {}
    headers = {
    'Content-Type': 'application/json',
    'Fiware-Service': 'something',
    'Fiware-Servicepath': '/'
    }

    response = requests.request("GET", url, headers=headers, data=payload)
        
    #print(response1.text)
    output = json.loads(response.text)
    #print(output)
    return str(output)

# ====================================================================

# ===========Send aggregated data from Comet when requested from a widget========
@app.route('/<string:entity_id>/<string:attr>/<string:method>/<string:period>', methods=['GET'])
def send_aggr_data_to_wirecloud(entity_id, attr, method, period):


    # datetime object containing current date and time
    now = datetime.now() 
    now_str = str(now).replace(" ", "T") + "Z"
    # print(now_str)

    url = "http://localhost:8666/STH/v2/entities/" + entity_id + "/attrs/" + attr + "?type=room&aggrMethod=" + method + "&aggrPeriod=" + period + "&dateFrom=2022-10-20T15:30:00.000Z&dateTo=" + now_str
    
    payload = {}
    headers = {
    'Content-Type': 'application/json',
    'Fiware-Service': 'something',
    'Fiware-Servicepath': '/'
    }

    response = requests.request("GET", url, headers=headers, data=payload)
    output = json.loads(response.text)
    return str(output)

# ================================================================================

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
