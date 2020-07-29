from db_mapped_objects import *
from db_mapped_aux_objects import *
import numpy as np
from numpy import random
import json
import ttn
from flask import Flask, jsonify, request
import base64
#from flask_ngrok import run_with_ngrok

#Instância para controle do banco de dados
dbRfid = DbControl()
#Instância para inserir dados no banco

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
          
'''def answer (app, http_code, json):
  responseServer = app.response_class (
    response = json,
    status = http_code,
    mimetype = 'application/json'
  )
  return responseServer
'''

def mqttClientSetup (handler):
  client = handler.data ()
  client.set_uplink_callback (uplinkCallback)
  return client

#--------------------connect to ttn iot platform---------------------#
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
#------------------------------------------------------------------#
#rotas utilizadas
@app.route ('/IDlora')
def IDlora():
    global online
    return jsonify(online)

@app.route ('/cadastro', methods = ['GET','POST'])
def cadastro():
  if request.method == 'POST':
    try:
      data = request.get_json ()
    except (KeyError, TypeError, ValueError):
      resp = jsonify ('success = False')
      return util.answer (app, 204, resp)

    nome_cadastro = data['nome']
    cod_cartao = data['cartao']
    print(type(data))
    print(nome_cadastro)
    print(cod_cartao)
    cadastro = Cadastro(noUsuario = nome_cadastro, cdCartao = cod_cartao)
    dbRfid.session.add(cadastro)
    dbRfid.session.commit()          
    return jsonify(success = True)

  if request.method == 'GET':
    return 'TESTE'


@app.route ('/consulta')
def consulta():
  return '0'

# online
if __name__ == '__main__':
  app.run ()

