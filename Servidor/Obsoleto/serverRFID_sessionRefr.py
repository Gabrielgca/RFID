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

dbRfid.dbInit("root:#IBTI@2019@localhost/db_rfid")


# flask namespace
app = Flask (__name__)
CORS(app)
#run_with_ngrok (app)
app.config['JSON_AS_ASCII'] = True

#Variáveis Globais
global available, idrfid, uplink, Fregister

available = True
uplink = False
Fregister = False

# ttn variables
appId = 'ibti-rfid'
accessKey = 'ttn-account-v2.b5HZHWeC3DyZCA6XqT9_VpWuhmjJDEmdMrLNd50O13o'

def uplinkCallback (msg, client):
  global idrfid, available, uplink, noDevice


  available = True
  uplink = True

  noDevice = msg.dev_id
  idrfid = msg.payload_raw
  idrfid = base64.b64decode(idrfid).hex().upper()
  
  #Verifica se o card lido está no banco 
  with dbRfid.sessionQueryScope() as session:
      for u in session.query(Cartao):
        if idrfid == u.noCartao:
            #Verifica se o card está ativo
            for k in session.query(CadastroCartao):
              #print(k.idCartao)
              if k.idCartao == u.idCartao:
                if k.stEstado == 'A':
                  available = False
                  break

            break

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

  with dbRfid.sessionQueryScope() as session:
      for u in session.query(Cartao):
        if RFID == u.noCartao:
            #Verifica se o card está ativo
            for k in session.query(CadastroCartao):
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

@app.route ('/WiFiRFID')
def WiFiRFID ():
  global uplink
  global idrfid
  global available

  try:
    idrfid = request.args.get('RFID')
    iddisp = int(request.args.get('LOC'))

    idrfid = idrfid.upper()
    available = is_available(idrfid)
    print(idrfid)
    print(available)

    if not available:


      with dbRfid.sessionQueryScope() as session:
        cardid_idrfid = session.query(Cartao).filter_by(noCartao = idrfid).first()
        cardid_idrfid = cardid_idrfid.idCartao
        userid_idrfid = session.query(CadastroCartao).filter_by(idCartao = int(cardid_idrfid), stEstado = 'A').first()
        userid_idrfid = userid_idrfid.idCadastro
        last_ocorr = session.query(Ocorrencia).filter_by(idCadastro = userid_idrfid).order_by(Ocorrencia.idOcorrencia.desc(), Ocorrencia.hrOcorrencia.desc()).first()

        
        #print (userid_idrfid)
        print(last_ocorr)
        
      # Força Saída da última entrada do usuário caso ele esteja como entrada
      if not last_ocorr == None:
        if last_ocorr.idDispositivo == iddisp:
          if last_ocorr.stOcorrencia == 'E':
            s_ocorr = Ocorrencia (idDispositivo = last_ocorr.idDispositivo,
                  idCadastro = int(userid_idrfid),
                  dtOcorrencia = func.current_date(),
                  hrOcorrencia = func.current_time(),
                  stOcorrencia = 'S')
            print('Entrei Aqui! - 1')
          else:
            s_ocorr = Ocorrencia (idDispositivo = last_ocorr.idDispositivo,
                  idCadastro = int(userid_idrfid),
                  dtOcorrencia = func.current_date(),
                  hrOcorrencia = func.current_time(),
                  stOcorrencia = 'E')
            print('Entrei Aqui! - 2')
          with dbRfid.sessionTransactionScope() as session:
              session.add(s_ocorr)
        else:
          if last_ocorr.stOcorrencia == 'E':
            v_ocorr = Ocorrencia (idDispositivo = last_ocorr.idDispositivo,
                  idCadastro = int(userid_idrfid),
                  dtOcorrencia = func.current_date(),
                  hrOcorrencia = func.current_time(),
                  stOcorrencia = 'S')
        
            with dbRfid.sessionTransactionScope() as session:
              session.add(v_ocorr)
            print('Entrei Aqui! - 3')
            
          n_ocorr = Ocorrencia (idDispositivo = iddisp,
                idCadastro = int(userid_idrfid),
                dtOcorrencia = func.current_date(),
                hrOcorrencia = func.current_time(),
                stOcorrencia = 'E')
          with dbRfid.sessionTransactionScope() as session:
            session.add(n_ocorr)
          
          print('Entrei Aqui! - 4')
      else:
        n_ocorr = Ocorrencia (idDispositivo = iddisp,
                  idCadastro = int(userid_idrfid),
                  dtOcorrencia = func.current_date(),
                  hrOcorrencia = func.current_time(),
                  stOcorrencia = 'E')
        with dbRfid.sessionTransactionScope() as session:
          session.add(n_ocorr)
          print(print('Entrei Aqui! - 5'))
      
      return jsonify (success = True)
    else:
      uplink = True
      return jsonify (success = False)

  except:
    print('Verifique as variáveis de envio!')
    return jsonify(answer = 'cannot read any ID or LOC')


@app.route ('/statusIdcard')
def statusIdcard():
  global uplink
  global idrfid
  global available
  cardinfo = {}

  if uplink == False: #or not noDevice == 'teste2':
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


        try:
          with dbRfid.sessionTransactionScope() as session:
              session.add(cartao)
              session.add(usuario)
        except:
          return jsonify(success = False)

        
        with dbRfid.sessionQueryScope() as session:
            id_cadastro = session.query(Cadastro).filter_by(noUsuario= str_user).order_by (Cadastro.idCadastro.desc()).first()
            id_cartao = session.query(Cartao).filter_by(noCartao= str_card).first()
        id_cadastro = id_cadastro.idCadastro
        id_cartao = id_cartao.idCartao

        card_user = CadastroCartao (idCartao = id_cartao, idCadastro = id_cadastro)
        
        try:
            with dbRfid.sessionTransactionScope() as session:
                session.add(card_user)
        except:
            return jsonify(success = False)
            
        #VERIFICAR CAMINHO NA RASP
        with open(f"/home/pi/Documents/imagensRFID/{id_cadastro}.png","wb") as png2:
            png2.write(base64.b64decode(str_img))

        return jsonify(success = True)

        
        if request.method == 'GET':
            return jsonify(get = True)

def findrooms():
  dispositivo = []
  t_pess = 0

  with dbRfid.sessionQueryScope() as session:
      for i in session.query(Dispositivo):
          dict_disp = i.getDict()
          dict_disp.pop('noDispositivo')
          dict_disp.pop('vlAndar')
          dict_disp.pop('stAtivo')
          dict_disp['idSala'] = dict_disp.pop('idDispositivo')
          dict_disp['nomeSala'] = dict_disp.pop('noLocalizacao')
          #FILTRAR O ENVIO PELO DIA
          #for j in session.query(Ocorrencia).filter_by(Ocorrencia.dtOcorrencia)
          for j in session.query(Ocorrencia):
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
  with dbRfid.sessionQueryScope() as session:
      for i in session.query(Ocorrencia):
        if int(id_sala) == i.idDispositivo:
          if i.stOcorrencia == 'E':
            users_inside.append(i.idCadastro)
          if i.stOcorrencia == 'S':
            try:
              users_inside.remove(i.idCadastro)
            except:
              print('Aviso: Saída SEM Entrada na Sala!!')
  
  users_inside.sort()
  print(users_inside)
  #Verifica o nome da pessoa que está dentro da 'id_sala'
  with dbRfid.sessionQueryScope() as session:
      for i in session.query(Cadastro):
        if i.idCadastro in users_inside:
          info_users.append(i.noUsuario)
  print(info_users)
  
  lista_ocupantes = []

  for i in range(len(users_inside)):
      try:
        #VERIFICAR CAMINHO NA RASP
        with open(f"/home/pi/Documents/imagensRFID/{users_inside[i]}.png","rb") as image_file: 
          img_perfil = str(base64.b64encode(image_file.read()))
          img_perfil = img_perfil.replace("b'", "")
          img_perfil = img_perfil.replace("'", "")
          dict_ocupante = dict (nomeOcupante = info_users[i], idOcupante = users_inside[i], imgPerfil = img_perfil)
          lista_ocupantes.append(dict_ocupante)
          image_file.close()
      except:
        dict_ocupante = dict (nomeOcupante = info_users[i], idOcupante = users_inside[i], imgPerfil = '')
        lista_ocupantes.append(dict_ocupante)
  #VERIFICAR CAMINHO NA RASP
  with open(f"/home/pi/Documents/imagensRFID/S{id_sala}.png","rb") as imgsala:
    img_sala = str(base64.b64encode(imgsala.read()))
    img_sala = img_sala.replace("b'", "")
    img_sala = img_sala.replace("'", "")
    sala = dict( idSala = id_sala, nomeSala = room['salas'][int(id_sala)-1]['nomeSala'], imgMapaSala = img_sala ,ocupantes = lista_ocupantes)
    imgsala.close()
  room['salaSelecionada'] = sala

  return jsonify(room)


if __name__ == '__main__':
  app.run ()

