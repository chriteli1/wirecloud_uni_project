import requests
import json
import csv
import time
import random

url = "http://localhost:1026/v2/entities/Room1/attrs"

with open('./device16-1-2021.csv', newline='') as f:
  reader = csv.reader(f)
  data = list(reader)

#print(data[1][1])

i = 1
while i < 200: 
  pm1 = float(data[i][1])
  pm10 = float(data[i][2])
  pm2_5 = float(data[i][3])
  rh = float(data[i][4])
  temp = float(data[i][5])
  i += 1



  payload = json.dumps({
    "pm1": {
      "type": "Float",
      "value": pm1
    },
    "pm10": {
      "type": "Float",
      "value": pm10
    },
    "pm2_5": {
      "type": "Float",
      "value": pm2_5
    },
    "rh": {
      "type": "Float",
      "value": rh
    },
    "temp": {
      "type": "Float",
      "value": temp
    }
  })

  headers = {
    'fiware-service': 'something',
    'fiware-servicepath': '/',
    'Content-Type': 'application/json'
  }

  response = requests.request("POST", url, headers=headers, data=payload)

  wait_time = 2*random.random()
  time.sleep(wait_time)

  print(response)
  #print(payload)

print("Done")