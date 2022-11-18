import requests
import json
import csv
import time
import random

entity1 = "Room1" # Enter here the entity you want to update
entity2 = "Room2" # Enter here the entity you want to update

orion_ip = "localhost:1026" # Enter here Orion's IP

url1 = "http://" + orion_ip + "/v2/entities/" + entity1 + "/attrs" # Complete url for http request
url2 = "http://" + orion_ip + "/v2/entities/" + entity2 + "/attrs" # Complete url for http request

csv_filename = "./device16-1-2021.csv" # Enter here the csv path

with open(csv_filename, newline='') as f:
  reader = csv.reader(f)
  data = list(reader)


i = 1
num_of_samples = 1000 # Enter here how many samples (values of the units) you want to send
while i <= num_of_samples: 
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
    'fiware-service': 'something', # Set the correct service
    'fiware-servicepath': '/', # Set the correct path
    'Content-Type': 'application/json'
  }

  response1 = requests.request("POST", url1, headers=headers, data=payload)
  response2 = requests.request("POST", url2, headers=headers, data=payload)


  wait_time = 2*random.random() # Random time to wait until next send (between 0 and 2 seconds)
  time.sleep(wait_time)

  print(response1, ", ", response2)

print("Done")