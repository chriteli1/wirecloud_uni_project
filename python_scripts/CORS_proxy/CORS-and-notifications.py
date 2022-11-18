from crypt import methods
import mimetypes
from urllib import response
from wsgiref.headers import Headers
from flask import Flask, request, make_response, Response, jsonify
import requests
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

post_flag = False
alerts = ""
@app.route('/notifications', methods=['POST', 'GET'])
def receive_notification():
    global alerts
    if request.method == 'POST':
        notification = request.json
        alerts = notification["data"]
        print(alerts)
        return notification 
    if request.method == 'GET':
        alerts_data = "data: " + str(alerts) + "\n\n"
        # print(alerts_data)
        resp = make_response(alerts_data)
        h = resp.headers
        h["Content-Type"] = "text/event-stream"
        # h["Access-Control-Allow-Origin"] = "*"
        alerts = ""
        return resp
    

@app.route('/<string:entity_id>', methods=['GET'])
def send_data_to_wirecloud(entity_id):
    url1 = "http://localhost:8666/STH/v1/contextEntities/type/room/id/" + entity_id + "/attributes/pm1?lastN=300"
    url2 = "http://localhost:8666/STH/v1/contextEntities/type/room/id/" + entity_id + "/attributes/pm10?lastN=300"
    url3 = "http://localhost:8666/STH/v1/contextEntities/type/room/id/" + entity_id + "/attributes/pm2_5?lastN=300"
    url4 = "http://localhost:8666/STH/v1/contextEntities/type/room/id/" + entity_id + "/attributes/rh?lastN=300"
    url5 = "http://localhost:8666/STH/v1/contextEntities/type/room/id/" + entity_id + "/attributes/temp?lastN=300"

    payload = {}
    headers = {
    'Content-Type': 'application/json',
    'Fiware-Service': 'something',
    'Fiware-Servicepath': '/'
    }

    # response = []
    response1 = requests.request("GET", url1, headers=headers, data=payload)
    response2 = requests.request("GET", url2, headers=headers, data=payload)
    response3 = requests.request("GET", url3, headers=headers, data=payload)
    response4 = requests.request("GET", url4, headers=headers, data=payload)
    response5 = requests.request("GET", url5, headers=headers, data=payload)
    # response.append(response1.text)
    # response.append(response2.text)
    response_total = f"[{response1.text}, {response2.text}, {response3.text}, {response4.text}, {response5.text}]"
    #print(response1.text)
    output = json.loads(response_total)
    #print(output)
    return str(output)



if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
