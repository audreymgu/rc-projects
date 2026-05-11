import requests
import json

chimes = [
    "G01 X700 Y-1100 Z1000",
    "G01 X1600 Y-1100 Z1000",
    "G01 X1000 Y1000 Z1000"
]

dict = {
    "commands" : chimes
}

json_chimes = json.dumps(dict)

response = requests.post('http://localhost:3000/tell', json = dict)

print(response.status_code)

