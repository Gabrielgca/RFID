from db_mapped_objects import *
from db_mapped_aux_objects import *
import numpy as np
from numpy import random
import json
import ttn
from flask import Flask, jsonify, request
import base64
#from flask_ngrok import run_with_ngrok

dbRfid = DbControl()

dbRfid.dbInit("root:@localhost/db_rfid")

# flask namespace
app = Flask (__name__)
#run_with_ngrok (app)
global online
online = False
# ttn variables
appId = 'ibti-rfid'
accessKey = 'ttn-account-v2.b5HZHWeC3DyZCA6XqT9_VpWuhmjJDEmdMrLNd50O13o'

def uplinkCallback (msg, client):
  global online
  global IDhttp
  online = False
  IDhttp = msg.payload_fields
  idrfid = msg.payload_raw
  idrfid = base64.b64decode(idrfid).hex().upper()
  
  #Verifica se o card lido está no banco 
  for u in dbRfid.session.query(Cadastro):
    if idrfid == u.cdCartao:
        online = True
        break
          



def mqttClientSetup (handler):
  client = handler.data ()
  client.set_uplink_callback (uplinkCallback)
  return client

# connect to ttn iot platform
print('PROGRAMA RODANDO..')
try:
  handler = ttn.HandlerClient (appId, accessKey)
  mqttClient = mqttClientSetup (handler)
except:
  print ('Failed to mount TTN handler.')

try:
  mqttClient.connect ()
  print ('Connected to TTN.')
except:
  print ('Failed to connect to TTN.')

@app.route ('/IDlora')
def IDlora():
    global online
    return jsonify(online)


# online
if __name__ == '__main__':
  app.run ()

