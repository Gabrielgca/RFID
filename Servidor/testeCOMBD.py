from db_mapped_objects import *
from db_mapped_aux_objects import *
import numpy as np
from numpy import random
import json
import ttn
from flask import Flask, jsonify, request
from flask_cors import CORS
import base64
#from flask_ngrok import run_with_ngrok

#Instância para controle do banco de dados
dbRfid = DbControl()
#Instância para inserir dados no banco

dbRfid.dbInit("root:@localhost/db_rfid")


# flask namespace
app = Flask (__name__)
CORS(app)
app.config['JSON_AS_ASCII'] = True

#Variáveis Globais
global online
global available
global idrfid
global uplink

online = False
available = True
uplink = False

# ttn variables
appId = 'ibti-rfid'
accessKey = 'ttn-account-v2.b5HZHWeC3DyZCA6XqT9_VpWuhmjJDEmdMrLNd50O13o'

def uplinkCallback (msg, client):
  global online
  global idrfid
  global available
  global uplink

  online = False
  available = True
  uplink = True

  idrfid = msg.payload_raw
  idrfid = base64.b64decode(idrfid).hex().upper()
  
  #Verifica se o card lido está no banco 
  for u in dbRfid.session.query(Cartao):
    if idrfid == u.noCartao:
        online = True
        #Verifica se o card está ativo
        for k in dbRfid.session.query(CadastroCartao):
          #print(k.idCartao)
          if k.idCartao == u.idCartao:
            if k.stEstado == 'A':
              available = False
              break

        break
  '''
  if online == False:
    cartao = Cartao (noCartao = idrfid)
    dbRfid.session.add(cartao)
    dbRfid.session.commit()
    print(online)
  '''
#função que manda resposta para a aplicação
def answer (app, http_code, json):
  responseServer = app.response_class (
    response = json,
    status = http_code,
    mimetype = 'application/json'
  )
  return responseServer


def mqttClientSetup (handler):
  client = handler.data ()
  client.set_uplink_callback (uplinkCallback)
  return client

#--------------------connect to ttn iot platform---------------------#
print('PROGRAMA RODANDO...')
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

def is_available(RFID):
  global available
  available = True

  for u in dbRfid.session.query(Cartao):
    if RFID == u.noCartao:
        #Verifica se o card está ativo
        for k in dbRfid.session.query(CadastroCartao):
          #print(k.idCartao)
          if k.idCartao == u.idCartao:
            if k.stEstado == 'A':
              available = False
              break
  return available

@app.route('/teste')
def teste():
  try:
    RFID = request.args.get('RFID')
    RFID = RFID.upper()
    status = is_available(RFID)
    return str(status)
  except:
    return 'Nenhuma mensagem lida.'
  
'''
#Tag cadastrada??
@app.route ('/IDlora')
def IDlora():
    global online
    return jsonify(online)

#Cadastro de novo usuário
@app.route ('/cadastro', methods = ['GET','POST'])
def cadastro():
  if request.method == 'POST':
    try:
      data = request.get_json ()
    except (KeyError, TypeError, ValueError):
      resp = jsonify ('success = False')
      return answer (app, 204, resp)

    nome_cadastro = data['nome']
    cod_cartao = data['cartao']
    print(type(data))
    print(nome_cadastro)
    print(cod_cartao)
    #Inserindo o dado recebido no banco de dados
    cadastro = Cadastro(noUsuario = nome_cadastro, cdCartao = cod_cartao)
    dbRfid.session.add(cadastro)
    dbRfid.session.commit()          
    return jsonify(success = True)

  if request.method == 'GET':
    return 'TESTE'
'''
@app.route ('/WiFiRFID')
def WiFIRFID ():
  global uplink
  global idrfid
  global available
  try:
    idrfid = request.args.get('RFID')
    idrfid = idrfid.upper()
    available = is_available(idrfid)
    uplink = True
    return jsonify(success = True)
  except:
    uplink = False
    return jsonify (success = False)

@app.route ('/statusIdcard')
def statusIdcard():
  global uplink
  global idrfid
  global available
  cardinfo = {}

  if uplink == False:
    return '0'
  uplink = False
  cardinfo['statusCartao'] = available
  cardinfo['codigoRFIDCartao'] = idrfid
  return jsonify(cardinfo)


@app.route ('/register', methods = ['GET','POST'])
def register():

  if request.method == 'POST':

        try:
            data = request.get_json ()
        except (KeyError, TypeError, ValueError):
            resp = jsonify ('success = False')
            return answer (app, 204, resp)

        str_card = data['codigoRFIDCartao']
        str_user = data['nomeUsuario']
        str_img = data['imgPerfil']

        cartao = Cartao (noCartao = str_card)
        usuario = Cadastro (noUsuario = str_user)
        dbRfid.session.add(cartao)
        dbRfid.session.add(usuario)

        try:
          dbRfid.session.commit()
        except:
          return jsonify(success = False)

        
        id_cadastro = dbRfid.session.query(Cadastro).filter_by(noUsuario= str_user).first()
        id_cartao = dbRfid.session.query(Cartao).filter_by(noCartao= str_card).first()
        id_cadastro = id_cadastro.idCadastro
        id_cartao = id_cartao.idCartao

        card_user = CadastroCartao (idCartao = id_cartao, idCadastro = id_cadastro)
        dbRfid.session.add(card_user)
        dbRfid.session.commit()

        with open(f"C:/Users/DELL/Documents/IBTI/RFID/imagens/{id_cadastro}.png","wb") as png2:
            png2.write(base64.b64decode(str_img))

        return jsonify(success = True)

        if request.method == 'GET':
            return jsonify(get = True)

def findrooms():
  dispositivo = []
  t_pess = 0

  for i in dbRfid.session.query(Dispositivo):
      dict_disp = i.getDict()
      dict_disp.pop('noDispositivo')
      dict_disp.pop('vlAndar')
      dict_disp.pop('stAtivo')
      dict_disp['idSala'] = dict_disp.pop('idDispositivo')
      dict_disp['nomeSala'] = dict_disp.pop('noLocalizacao')
      for j in dbRfid.session.query(Ocorrencia):
          if i.idDispositivo == j.idDispositivo:
              if j.stOcorrencia == 'E':
                  t_pess += 1
              if j.stOcorrencia == 'S':
                  t_pess -= 1
          dict_disp["qtdOcupantes"] = t_pess
          
      t_pess = 0
      dispositivo.append(dict_disp)
  
  room = {}
  room['salas'] = dispositivo
  return room 

@app.route ('/rooms')
def rooms():
  room = findrooms()

  return jsonify(room)  
  '''
  print(id_disp)
  print(no_disp)
  print(local)
  print(dispositivo)
  '''

@app.route ('/roominfo', methods = ['GET', 'POST'])
def roominfo():
  if request.method == 'POST':
    try:
      data = request.get_json ()
    except (KeyError, TypeError, ValueError):
      resp = jsonify (success = False)
      return answer (app, 204, resp)
  
  id_sala = data['idSala']

  print(id_sala)
  
  room = findrooms()

  info_users = []
  users_inside = []

  #Verifica o id dos usuários dentro da 'id_sala'
  for i in dbRfid.session.query(Ocorrencia):
    if int(id_sala) == i.idDispositivo:
      if i.stOcorrencia == 'E':
        users_inside.append(i.idCadastro)
      if i.stOcorrencia == 'S':
        users_inside.remove(i.idCadastro)
  
  users_inside.sort()
  print(users_inside)
  #Verifica o nome da pessoa que está dentro da 'id_sala'
  for i in dbRfid.session.query(Cadastro):
    if i.idCadastro in users_inside:
      info_users.append(i.noUsuario)
  print(info_users)
  
  lista_ocupantes = []

  for i in range(len(users_inside)):
      try:
        with open(f"C:/Users/DELL/Documents/IBTI/RFID/imagens/{users_inside[i]}.png","rb") as image_file: 
          img_perfil = str(base64.b64encode(image_file.read()))
          img_perfil = img_perfil.replace("b'", "")
          img_perfil = img_perfil.replace("'", "")
          dict_ocupante = dict (nomeOcupante = info_users[i], idOcupante = users_inside[i], imgPerfil = img_perfil)
          lista_ocupantes.append(dict_ocupante)
          image_file.close()
      except:
        dict_ocupante = dict (nomeOcupante = info_users[i], idOcupante = users_inside[i], imgPerfil = 'NULL')
        lista_ocupantes.append(dict_ocupante)

  sala = dict( idSala = id_sala, nomeSala = room['salas'][int(id_sala)-1]['nomeSala'], imgMapaSala = 'NULL' ,ocupantes = lista_ocupantes)
  room['salaSelecionada'] = sala

  return room
  '''
  info_users = str (info_users)
  return info_users
  '''


'''
@app.route ('/get_image')
def get_image():
  return '0'

@app.route ('/setor', methods = ['GET','POST'])
def setor():
  if request.method == 'POST':
    try:
      data = request.get_json ()
    except (KeyError, TypeError, ValueError):
      resp = jsonify ('success = False')
      return util.answer (app, 204, resp)

    dbRfid.session.query(Ocorrencia)
    nome_cadastro = data['nome']
    cod_cartao = data['cartao']
  return '0'
'''
# online
if __name__ == '__main__':
  app.run ()

