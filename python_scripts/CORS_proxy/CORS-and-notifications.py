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
@app.route('/notifications', methods=['POST', 'GET'])
def receive_notification():
    global alerts, alerts_index
    if request.method == 'POST':
        notification = request.json
        # print(notification)
        alerts.extend(notification["data"])
        # alerts_index += 1
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
    

@app.route('/<string:entity_id>/<string:attr>/', methods=['GET'])
def send_data_to_wirecloud(entity_id, attr):
    lastN = "300"
    url = "http://localhost:8666/STH/v2/entities/" + entity_id + "/attrs/" + attr + "?type=room&lastN=" + lastN
    # url2 = "http://localhost:8666/STH/v1/contextEntities/type/room/id/" + entity_id + "/attributes/pm10?lastN=300"
    # url3 = "http://localhost:8666/STH/v1/contextEntities/type/room/id/" + entity_id + "/attributes/pm2_5?lastN=300"
    # url4 = "http://localhost:8666/STH/v1/contextEntities/type/room/id/" + entity_id + "/attributes/rh?lastN=300"
    # url5 = "http://localhost:8666/STH/v1/contextEntities/type/room/id/" + entity_id + "/attributes/temp?lastN=300"

    payload = {}
    headers = {
    'Content-Type': 'application/json',
    'Fiware-Service': 'something',
    'Fiware-Servicepath': '/'
    }

    # response = []
    response = requests.request("GET", url, headers=headers, data=payload)
    # response2 = requests.request("GET", url2, headers=headers, data=payload)
    # response3 = requests.request("GET", url3, headers=headers, data=payload)
    # response4 = requests.request("GET", url4, headers=headers, data=payload)
    # response5 = requests.request("GET", url5, headers=headers, data=payload)
    # response.append(response1.text)
    # response.append(response2.text)
    # response_total = f"[{response1.text}, {response2.text}, {response3.text}, {response4.text}, {response5.text}]"
    
    #print(response1.text)
    output = json.loads(response.text)
    #print(output)
    return str(output)

@app.route('/<string:entity_id>/<string:attr>/<string:method>', methods=['GET'])
def send_aggr_data_to_wirecloud(entity_id, attr, method):


    # # datetime object containing current date and time
    # now = datetime.now()
    # print(type(now)) 

    url = "http://localhost:8666/STH/v2/entities/" + entity_id + "/attrs/" + attr + "?type=room&aggrMethod=" + method + "&aggrPeriod=minute&dateFrom=2022-11-25T12:29:27.229Z&dateTo=2022-11-25T15:30:00.000Z"
    
    payload = {}
    headers = {
    'Content-Type': 'application/json',
    'Fiware-Service': 'something',
    'Fiware-Servicepath': '/'
    }

    response = requests.request("GET", url, headers=headers, data=payload)
    output = json.loads(response.text)
    return str(output)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
