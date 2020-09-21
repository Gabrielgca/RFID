from db_commands import RfidCommands 
import numpy as np
from numpy import random
import json
import ttn
from flask import Flask, jsonify, request, url_for, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO, emit, send
import base64
from flask_ngrok import run_with_ngrok
import os


# flask namespace
app = Flask (__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")
#run_with_ngrok (app)
app.config['JSON_AS_ASCII'] = True

#Inicializando o banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:@localhost/db_rfid_v2'
db = SQLAlchemy(app)
CORS(app)
#Mapeamentos dos objetos Flask-SQLAlchemy.
class CadastroCartao(db.Model):
    __tablename__  = 'tb_cadastro_cartao'

    idCadastroCartao = db.Column('id_cadastro_cartao', db.Integer, primary_key=True, unique=True, nullable=False, comment='''Identificador da associação entre cadastro e cartão.''')
    idCadastro = db.Column('id_cadastro', db.Integer, db.ForeignKey('tb_cadastro.id_cadastro'),nullable=False, comment='''Identificador do cadastro.''')
    idCartao = db.Column('id_cartao', db.Integer, db.ForeignKey('tb_cartao.id_cartao'),nullable=False, comment='''Identificador do cartão.''')
    stEstado = db.Column('st_estado', db.String(1), nullable=False, comment='''Indica se o cartão está ativo ou inativo
''')

    cadastro = db.relationship('Cadastro', back_populates='cartoes')
    cartao = db.relationship('Cartao', back_populates='cadastros')

    def __repr__(self):
        return '''<Cadastro_cartao
    (id_cadastro_cartao='{}',
    id_cadastro='{}',
    id_cartao='{}',
    st_estado='{}')>'''.format(self.idCadastroCartao, self.idCadastro, self.idCartao, self.stEstado)

    def getDict(self):
        self.dictionary = {}
        self.dictionary['idCadastroCartao'] = self.idCadastroCartao
        self.dictionary['idCadastro'] = self.idCadastro
        self.dictionary['idCartao'] = self.idCartao
        self.dictionary['stEstado'] = self.stEstado
        return self.dictionary

class Cadastro(db.Model):
    __tablename__ = 'tb_cadastro'

    idCadastro = db.Column('id_cadastro', db.Integer, primary_key=True, unique=True, nullable=False, comment='''Indentificador do cadastro.''')
    noUsuario = db.Column('no_usuario', db.String(45), nullable=False, comment='''Nome do usuário cadastrado.''')
    edArquivoImagem = db.Column('ed_arquivo_imagem', db.String(50), nullable=True, default=None, comment='''Endereço no servidor da imagem do usuário.''')
    vlIdade = db.Column('vl_idade', db.Integer, nullable=True,default=None, comment='''Idade em anos do usuário''')
    noAreaTrabalho = db.Column('no_area_trabalho', db.String(40), nullable=True,default=None, comment='''Área de trabalho do usuário''')

    cartoes = db.relationship('CadastroCartao', back_populates='cadastro')
    ocorrencias = db.relationship('Ocorrencia', back_populates='cadastro')
    rotas = db.relationship('Rota', back_populates='cadastro')
    permissoesDisp = db.relationship('PermUsuDisp', back_populates='cadastro')

    def __repr__(self):
        return '''<Cadastro
(id_cadastro='{}',
no_usuario='{}',
vl_idade = '{}',
no_area_trabalho = '{}',
    ed_arquivo_imagem='{}')>'''.format(self.idCadastro, self.noUsuario, self.edArquivoImagem, self.vlIdade, self.noAreaTrabalho)

    def getDict(self):
        self.dictionary = {}
        self.dictionary['idCadastro'] = self.idCadastro
        self.dictionary['noUsuario'] = self.noUsuario
        self.dictionary['edArquivoImagem'] = self.edArquivoImagem
        self.dictionary['vlIdade'] = self.vlIdade
        self.dictionary['noAreaTrabalho'] = self.noAreaTrabalho

        return self.dictionary


class Cartao(db.Model):
    __tablename__ = 'tb_cartao'

    idCartao = db.Column('id_cartao', db.Integer, primary_key=True, unique=True, nullable=False, comment='''Indentificador do cartão.''')
    noCartao = db.Column('no_cartao', db.String(10), unique=True, nullable=False, comment='''Tag RFID do cartão.''')

    cadastros = db.relationship('CadastroCartao', back_populates='cartao')

    def __repr__(self):
        return '''<Cartao
    (id_cartao='{}',
    no_cartao='{}')>'''.format(self.idCartao, self.noCartao)

    def getDict(self):
        self.dictionary = {}
        self.dictionary['idCartao'] = self.idCartao
        self.dictionary['noCartao'] = self.noCartao
        return self.dictionary


class Dispositivo(db.Model):
    __tablename__ = 'tb_dispositivo'

    idDispositivo = db.Column('id_dispositivo', db.Integer, primary_key=True, unique=True, nullable=False, comment='''Idendificador do dispositivo.''')
    noDispositivo = db.Column('no_dispositivo', db.String(15), nullable=False, comment='''Descrição do dispositivo.''')
    stAtivo = db.Column('st_ativo', db.String(1), nullable=False, default='A', comment='''Status ativo ou inativo do dispositivo.''')

    ocorrencias = db.relationship('Ocorrencia', back_populates='dispositivo')
    rotasOrigem = db.relationship('Rota', back_populates='dispositivoOrigem', foreign_keys='Rota.idDispositivoOrigem')
    rotasDestino = db.relationship('Rota', back_populates='dispositivoDestino', foreign_keys='Rota.idDispositivoDestino')
    localizacaoDisps = db.relationship('DispLocalizacao', back_populates='dispositivo')

    def __repr__(self):
        return '''<Dispositivo
    (id_dispositivo='{}',
    vl_andar='{}',
    st_ativo='{}')>'''.format(self.idDispositivo, self.noDispositivo, self.stAtivo)

    def getDict(self):
        self.dictionary = {}
        self.dictionary['idDispositivo'] = self.idDispositivo
        self.dictionary['noDispositivo'] = self.noDispositivo
        self.dictionary['stAtivo'] = self.stAtivo
        return self.dictionary

#MAPEAMENTO NOVO!
class Rota(db.Model):
    __tablename__ = 'tb_rota'

    idRota = db.Column('id_rota', db.Integer, primary_key=True, unique=True, nullable=False, comment='''Identificador de uma rota.''')
    idDispositivoOrigem = db.Column('id_dispositivo_origem', db.Integer, db.ForeignKey('tb_dispositivo.id_dispositivo'), nullable=False, comment='''Identificador do dispositvo(origem)''')
    idDispositivoDestino = db.Column('id_dispositivo_destino', db.Integer,  db.ForeignKey('tb_dispositivo.id_dispositivo'), nullable=False, comment='''Identificador do dispositvo(destino)''')
    idCadastro = db.Column('id_cadastro', db.Integer,  db.ForeignKey('tb_cadastro.id_cadastro'), nullable=False, comment='''Identificador do cadastro''')

    dispositivoOrigem = db.relationship('Dispositivo', back_populates='rotasOrigem', foreign_keys=[idDispositivoOrigem])
    dispositivoDestino = db.relationship('Dispositivo', back_populates='rotasDestino', foreign_keys=[idDispositivoDestino])
    cadastro = db.relationship('Cadastro', back_populates='rotas')

    def __repr__(self):
        return '''<Rota
    (id_rota='{}',
    id_dispositivo_origem='{}',
    id_dispositivo_destino='{}',
    id_cadastro='{}')>'''.format(self.idRota,self.idDispositivoOrigem,self.idDispositivoDestino,self.idCadastro)

    def getDict(self):
        self.dictionary = {}
        self.dictionary['idRota'] = self.idRota
        self.dictionary['idDispositivoOrigem'] = self.idDispositivoOrigem
        self.dictionary['idDispositivoDestino'] = self.idDispositivoDestino
        self.dictionary['idCadastro'] = self.idCadastro
        return self.dictionary 


class Ocorrencia(db.Model):
    __tablename__ = 'tb_ocorrencia'

    idOcorrencia = db.Column('id_ocorrencia', db.Integer, primary_key=True, unique=True, nullable=False, comment='''Identificador da ocorrência.''')
    idDispositivo = db.Column('id_dispositivo', db.Integer, db.ForeignKey('tb_dispositivo.id_dispositivo'), nullable=False, comment='''Identificador do dispositivo.''')
    idCadastro = db.Column('id_cadastro', db.Integer, db.ForeignKey('tb_cadastro.id_cadastro'), nullable=False, comment='''Identificador do cadastro.''')
    dtOcorrencia = db.Column('dt_ocorrencia', db.Date, nullable=False, comment='''Data em que houve a detecção de um movimento.''')
    hrOcorrencia = db.Column('hr_ocorrencia', db.Time, nullable=False, comment='''Hora em que houve a detecção de um movimento.''')
    stOcorrencia = db.Column('st_ocorrencia', db.String(1), nullable=False, default='S', comment="""Se o movimento foi de 'entrada' ou 'saída'.""")

    cadastro = db.relationship('Cadastro', back_populates='ocorrencias')
    dispositivo = db.relationship('Dispositivo', back_populates='ocorrencias')

    def __repr__(self):
        return '''<Ocorrencia
    (id_ocorrencia='{}',
    id_dispositivo='{}',
    id_cadastro='{}',
    dt_ocorrencia='{}',
    hr_ocorrencia='{}',
    st_ocorrencia='{}')>'''.format(self.idOcorrencia, self.idDispositivo, self.idCadastro, self.dtOcorrencia, self.hrOcorrencia, self.stOcorrencia)

    def getDict(self):
        self.dictionary = {}
        self.dictionary['idOcorrencia'] = self.idOcorrencia
        self.dictionary['idDispositivo'] = self.idDispositivo
        self.dictionary['idCadastro'] = self.idCadastro
        self.dictionary['dtOcorrencia'] = self.dtOcorrencia
        self.dictionary['hrOcorrencia'] = self.hrOcorrencia
        self.dictionary['stOcorrencia'] = self.stOcorrencia
        return self.dictionary


#MAPEAMENTO NOVO!
class LocalizacaoDisp(db.Model):
    __tablename__ = 'tb_localizacao_disp' 

    idLocalizacaoDisp = db.Column('id_localizacao_disp', db.Integer, primary_key=True, unique=True, nullable=False, comment='''Identificação da localização do dispositivo''')
    noEmpresa = db.Column('no_empresa', db.String(40), nullable=False, comment='''Nome da empresa em que se encontra a localização''')
    noLocalizacao = db.Column('no_localizacao', db.String(40), nullable=False, comment='''Nome da localização do dispositivo''')  
    vlAndar = db.Column('vl_andar', db.Integer, nullable=True,default=None, comment='''Indicação do andar da localização''')
    vlArea = db.Column('vl_area', db.Integer, nullable=False, comment='''Tamanho em metros quadrados de localização''')

    dispositivos = db.relationship('DispLocalizacao', back_populates='localizacaoDisp')

    def __repr__(self):
        return '''<Localizacao_disp
	(id_localizacao_disp='{}',
    no_empresa='{}',
	no_localizacao='{}',
	vl_andar='{}',
	vl_area='{}')>'''.format(self.idLocalizacaoDisp, self.noEmpresa,self.noLocalizacao, self.vlAndar, self.vlArea)

    def getDict(self):
        self.dictionary = {}
        self.dictionary['idLocalizacaoDisp'] = self.idLocalizacaoDisp
        self.dictionary['noEmpresa'] = self.noEmpresa
        self.dictionary['noLocalizacao'] = self.noLocalizacao
        self.dictionary['vlAndar'] = self.vlAndar
        self.dictionary['vlArea'] = self.vlArea
        return self.dictionary

#MAPEAMENTO NOVO!
class DispLocalizacao(db.Model):
    __tablename__ = 'tb_disp_localizacao' 

    idDispLocalizacao = db.Column('id_disp_localizacao', db.Integer, primary_key=True, unique=True, nullable=False, comment="""Identificador tabela associativa 'Dispositivo Localização'""")
    idDispositivo = db.Column('id_dispositivo', db.Integer, db.ForeignKey('tb_dispositivo.id_dispositivo'), nullable=False, comment='''Idenificador do dispositivo''')
    idLocalizacaoDisp = db.Column('id_localizacao_disp', db.Integer, db.ForeignKey('tb_localizacao_disp.id_localizacao_disp'), nullable=False, comment='''Identificador da localização do dispositivo''')
    stSituacao = db.Column('st_situacao', db.String(1), nullable=False, comment='''Status indicando Ativo e Inativo''')

    dispositivo = db.relationship('Dispositivo', back_populates='localizacaoDisps')
    localizacaoDisp = db.relationship('LocalizacaoDisp', back_populates='dispositivos')
    permHorarios = db.relationship('PermUsuDisp', back_populates='dispLocalizacao')
    ocupacoes = db.relationship('Ocupacao', back_populates='dispLocalizacao')

    def __repr__(self):
        return '''<Disp_localizacao
	(id_disp_localizacao='{}',
	id_dispositivo='{}',
	id_localizacao_disp='{}',
	st_situacao='{}')>'''.format(self.idDispLocalizacao, self.idDispositivo, self.idLocalizacaoDisp, self.stSituacao)

    def getDict(self):
        self.dictionary = {}
        self.dictionary['idDispLocalizacao'] = self.idDispLocalizacao
        self.dictionary['idDispositivo'] = self.idDispositivo
        self.dictionary['idLocalizacaoDisp'] = self.idLocalizacaoDisp
        self.dictionary['stSituacao'] = self.stSituacao
        return self.dictionary


#MAPEAMENTO NOVO!
class Ocupacao(db.Model):
    __tablename__ = 'tb_ocupacao'

    idOcupacao = db.Column('id_ocupacao', db.Integer, primary_key=True, unique=True, nullable=False, comment='''Identificador da ocupação.''')
    idDispLocalizacao = db.Column('id_disp_localizacao', db.Integer, db.ForeignKey('tb_disp_localizacao.id_disp_localizacao'), nullable=False, comment='''Identificador tabela associativa 'Dispositivo Localização'.''')
    dtOcupacao = db.Column('dt_ocupacao', db.Date, nullable=False, comment='''Data do resumo da ocorrência, atrelado ao cadastro ocorrencia por dispositivo.''')
    hrOcupacao = db.Column('hr_ocupacao', db.Time, nullable=False, comment='''Hora do resumo da ocorrência, atrelado ao cadastro ocorrencia por dispositivo.''')
    nrPessoas = db.Column('nr_pessoas', db.Integer, nullable=False, comment='''Número de pessoas existentes na sala = Nr. de entradas - nr. de saídas do dispositivo.''')

    dispLocalizacao = db.relationship('DispLocalizacao', back_populates='ocupacoes')

    def __repr__(self):
        return '''<Ocupacao
    (id_ocupacao='{}',
    id_disp_localizacao='{}',
    dt_ocupacao='{}',
    hr_ocupacao='{}',
    nr_pessoas='{}')>'''.format(self.idOcupacao, self.idDispLocalizacao, self.dtOcupacao, self.hrOcupacao, self.nrPessoas)

    def getDict(self):
        self.dictionary = {}
        self.dictionary['idOcupacao'] = self.idOcupacao
        self.dictionary['idDispLocalizacao'] = self.idDispLocalizacao
        self.dictionary['dtOcupacao'] = self.dtOcupacao
        self.dictionary['hrOcupacao'] = self.hrOcupacao
        self.dictionary['nrPessoas'] = self.nrPessoas
        return self.dictionary

#MAPEAMENTO NOVO!
class PermissaoDisp(db.Model):
    __tablename__ = 'tb_permissao_disp' 

    idPermissao = db.Column('id_permissao', db.Integer, primary_key=True, unique=True, nullable=False, comment='''Identificador da permissao''')
    noPermissao = db.Column('no_permissao', db.String(30), nullable=False, comment='''Descrição da permissão''')
    stStatus = db.Column('st_status', db.String(1), nullable=False, comment='''Status Ativo / Inativo''')

    cadastrosPerms = db.relationship('PermUsuDisp', back_populates='permissaoDisp')

    def __repr__(self): 
        return '''<Permissao_disp
    (id_permissao='{}',
    no_permissao='{}',
    st_status='{}')>'''.format(self.idPermissao,self.noPermissao,self.stStatus)

    def getDict(self):
        self.dictionary = {}
        self.dictionary['idPermissao'] = self.idPermissao
        self.dictionary['noPermissao'] = self.noPermissao
        self.dictionary['stStatus'] = self.stStatus
        return self.dictionary


class PermHorario(db.Model):
    __tablename__ = 'tb_perm_horario' 

    idPermHorario = db.Column('id_perm_horario', db.Integer, primary_key=True, unique=True, nullable=False, comment='''Identificador da ocorrência horário permissão''')
    dtInicio = db.Column('dt_inicio', db.Date, nullable=True, comment='''Data de início da permissão - Não obrigatória principalmente quando o permanente está setado.''')
    dtFim = db.Column('dt_fim', db.Date, nullable=True, comment='''Data final da permissão - Não obrigatória.''')
    hrInicial = db.Column('hr_incial', db.Time, nullable=False, comment='''Hora Início permissão''')
    hrFinal = db.Column('hr_final', db.Time, nullable=False, comment='''Hora final permissão''')
    stPermanente = db.Column('st_permanente', db.String(1), nullable=False, comment='''Indica se essa permissão é permanente.''')

    dispLocalizacoes = db.relationship('PermUsuDisp', back_populates='permHorario')

    def __repr__(self):
        return '''<Perm_horario
    (id_perm_horario='{}',
    dt_inicio='{}',
    dt_fim='{}',
    hr_incial='{}',
    hr_final='{}',
    st_permanente='{}')>'''.format(self.idPermHorario, self.dtInicio, self.dtFim, self.hrInicial, self.hrFinal, self.stPermanente)

    def getDict(self):
        self.dictionary = {}
        self.dictionary['idPermHorario'] = self.idPermHorario
        self.dictionary['dtInicio'] = self.dtInicio
        self.dictionary['dtFim'] = self.dtFim
        self.dictionary['hrInicial'] = self.hrInicial
        self.dictionary['hrFinal'] = self.hrFinal
        self.dictionary['stPermanente'] = self.stPermanente
        return self.dictionary

#MAPEAMENTO NOVO!
class PermUsuDisp(db.Model):
    __tablename__ = 'tb_perm_usu_disp'

    idPermUsuDisp = db.Column('id_perm_usu_disp', db.Integer, primary_key=True, unique=True, nullable=False, comment='''Identificador permissão usuário x dispositivo''')
    idCadastro = db.Column('id_cadastro', db.Integer, db.ForeignKey('tb_cadastro.id_cadastro'), nullable=False, comment='''Identificador do cadastro''')
    idPermissao = db.Column('id_permissao', db.Integer, db.ForeignKey('tb_permissao_disp.id_permissao'), nullable=False, comment='''Identificador da permissão''')
    idDispLocalizacao = db.Column('id_disp_localizacao', db.Integer, db.ForeignKey('tb_disp_localizacao.id_disp_localizacao'), nullable=False, comment='''Identificador da localização do dispositivo''')
    idPermHorario = db.Column('id_perm_horario', db.Integer, db.ForeignKey('tb_perm_horario.id_perm_horario'), nullable=True, comment='''Identificador permissão por horário de bloqueio.. se existir não libera''')
    stStatus = db.Column('st_status', db.String(1), nullable=False, comment='''Status permissão Ativo ou Inativo''')

    cadastro = db.relationship('Cadastro', back_populates='permissoesDisp')
    permissaoDisp = db.relationship('PermissaoDisp', back_populates='cadastrosPerms')
    dispLocalizacao = db.relationship('DispLocalizacao', back_populates='permHorarios')
    permHorario = db.relationship('PermHorario', back_populates='dispLocalizacoes')

    def __repr__(self):
        return '''<Perm_usu_disp
    (id_perm_usu_disp='{}',
    id_cadastro='{}',
    id_permissao='{}',
    id_disp_localizacao='{}',
    id_perm_horario='{}',
    st_status='{}')>'''.format(self.idPermUsuDisp, self.idCadastro, self.idPermissao, self.idDispLocalizacao, self.idPermHorario, self.stStatus)

    def getDict(self):
        self.dictionary = {}
        self.dictionary['idPermUsuDisp'] = self.idPermUsuDisp
        self.dictionary['idCadastro'] = self.idCadastro
        self.dictionary['idPermissao'] = self.idPermissao
        self.dictionary['idDispLocalizacao'] = self.idDispLocalizacao
        self.dictionary['idPermHorario'] = self.idPermHorario
        self.dictionary['stStatus'] = self.stStatus
        return self.dictionary

#Inicializando o objeto com os comandos Flask - SQLAlchemy
cmd = RfidCommands(db)

#Variáveis Globais
global available, idrfid, uplink, id_sala, flag_roominfo

available = True
uplink = False
flag_roominfo = False


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
  
    available = not(cmd.selCountCartoesAtivos(idrfid) > 0)

'''
  #Verifica se o card lido está no banco 
  for u in dbRfid.session.query(Cartao):
    if idrfid == u.noCartao:
        #Verifica se o card está ativo
        for k in dbRfid.session.query(CadastroCartao):
          #print(k.idCartao)
          if k.idCartao == u.idCartao:
            if k.stEstado == 'A':
              available = False
              break

        break
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



#-----------------------------------------------------#
#--------------------EVENTOS SOCKET-------------------#
#-----------------------------------------------------#

@socketio.on('connect')
def test_connect():
    print("Novo Usuário conectado!!")
    #print(request.headers.get())
    emit('responseMessage', {'data': 'Connected'})

@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected')

#Envia para a aplicação o número de pessoas na sala quando solicitado
@socketio.on('rooms')   
def rooms():
    room = findrooms()
    emit('rooms_update', room)

#Envia para a aplicação as informações das pessoas na sala selecionada
@socketio.on('roominfo')   
def roominfo(data):
    global id_sala, flag_roominfo
    id_sala = data['idSala']
    flag_roominfo = True
    print(f'O ID da sala recebido foi: {id_sala}')
    room = fuc_roominfo(id_sala)
    emit('news_from_roominfo', room)
#-----------------------------------------------------#
#------------------------ROTAS------------------------#
#-----------------------------------------------------#



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
def WiFIRFID ():
    global uplink
    global idrfid
    global available
    global id_sala, flag_roominfo

    if flag_roominfo:
        flag_roominfo = False
    else:
        id_sala = 0
    try:
        locDisp = request.args.get('LOC')
        idrfid = request.args.get('RFID')
        idrfid = idrfid.upper()
        available = is_available(idrfid)
        print(idrfid)
        print(available)
        if not available:
            cadastroCartao = cmd.selCadastroCartaoAtivo(idrfid)
            ultOcorrencia = cmd.selUltOcorrenciaCadastro(cadastroCartao.idCadastro)
            #VERIFICANDO PERMISSÕES
            permissions_cadastro_local = cmd.selAllPermCadastroLocal (cadastroCartao.idCadastro, locDisp)
            if len (permissions_cadastro_local) <= 0:
                    # ACCESS DENIED
                return jsonify (success = False)
            else:
                for i in permissions_cadastro_local:
                    if i.idPermHorario is not None:
                        permissions_by_time = cmd.selPermHorarioByTime (i.idPermHorario, db.func.current_time ())
                        if len (permissions_by_time) <= 0:
                            # ACCESS DENIED
                            return jsonify (success = False)
            
            # ACCESS GRANTED, proceed to database insert
            if ultOcorrencia is not None:
                if ultOcorrencia.idDispositivo == int(locDisp):
                    if ultOcorrencia.stOcorrencia == 'E':
                        stOc = 'S'
                    else:
                        stOc = 'E'
                    cmd.insertOcorrencia(Ocorrencia (idDispositivo=locDisp,
                                                     idCadastro=cadastroCartao.idCadastro,
                                                     dtOcorrencia=db.func.current_date(),
                                                     hrOcorrencia=db.func.current_time(),
                                                     stOcorrencia=stOc))
                    
                else:
                    if ultOcorrencia.stOcorrencia == 'E':
                        cmd.insertOcorrencia(Ocorrencia (idDispositivo=ultOcorrencia.idDispositivo,
                                                         idCadastro=cadastroCartao.idCadastro,
                                                         dtOcorrencia=db.func.current_date(),
                                                         hrOcorrencia=db.func.current_time(),
                                                         stOcorrencia='S'))
                    cmd.insertOcorrencia(Ocorrencia (idDispositivo=locDisp,
                                                     idCadastro=cadastroCartao.idCadastro,
                                                     dtOcorrencia=db.func.current_date(),
                                                     hrOcorrencia=db.func.current_time(),
                                                     stOcorrencia='E'))
                    
            else:
                cmd.insertOcorrencia(Ocorrencia (idDispositivo=locDisp,
                                                 idCadastro=cadastroCartao.idCadastro,
                                                 dtOcorrencia=db.func.current_date(),
                                                 hrOcorrencia=db.func.current_time(),
                                                 stOcorrencia='E'))
                
            ##Atualiza a quantidade de pessoas nas salas
            rooms_updates = findrooms()
            print('EMITI')
            print(type(rooms_updates))
            socketio.emit('rooms_update', rooms_updates)
            #Verifica se atualização na sala selecionada
            if int(locDisp) == int(id_sala):
                rooms = fuc_roominfo(locDisp)
                socketio.emit('news_from_roominfo', rooms)
            return jsonify (success = True)
        else:
            uplink = True
            # Envia o ID para a aplicação e o possibilita ser cadastrado
            socketio.emit('register', idrfid)
            return jsonify (success = False)

    except Exception as e:
        
        print(e)
        return jsonify(answer = 'cannot read any ID')

@app.route ('/register', methods = ['GET','POST'])
def register():
    if request.method == 'POST':

        try:
            data = request.get_json ()
        except (KeyError, TypeError, ValueError):
            resp = jsonify (success = False)
            return answer (app, 204, resp)

        str_card = data['codigoRFIDCartao']
        str_user = data['nomeUsuario']
        str_age = data['idade']
        str_trab = data['trab']
        #str_img = data['imgPerfil']
        
        list_perm = data['permissoes']






        cadastroCartao = CadastroCartao (stEstado = 'A')
        cartao = Cartao (noCartao = str_card)
        usuario = Cadastro (noUsuario = str_user, vlIdade = str_age, noAreaTrabalho = str_trab)
        try:
            cmd.insertCadastroCartao(cadastroCartao = cadastroCartao,
                                    cadastro = usuario,
                                    cartao = cartao,
                                    refresh = True)
            #cmd.updateCadastroImg(cadastro = cadastroCartao.idCadastro,
            #                     imgUrl = url_for("static",filename = "imagens/"+str(cadastroCartao.idCadastro)+".png",_external = True))
        except Exception as e:
            print(e)
            return jsonify(success = False)

        #VERIFICAR CAMINHO NA RASP
        #with open(os.getcwd().replace("\\","/")+"/static/imagens/{}.png".format(cadastroCartao.idCadastro),"wb") as png2:
           # png2.write(base64.b64decode(str_img))

        for i in range(len(list_perm)):

            hr_perm_ini = 0
            hr_perm_fim = 0
            perm_perm = "N"
            loc_perm = list_perm[i]["loc"]

            loc_perm_no = cmd.selLocalizacaoDisp_no(loc_perm)

            dict_loc_perm = loc_perm_no[0].getDict()
            id_loc_perm = dict_loc_perm['idLocalizacaoDisp']
            print(f'id_loc_perm:   {id_loc_perm}')
            disp_loc = cmd.selDispLocalizacao(id_loc_perm)
            print(f'disp_loc:  {disp_loc}')
            dict_disp_loc = disp_loc[0].getDict()
            id_disp_loc = dict_disp_loc['idDispLocalizacao']
            try:
                hr_perm_ini = list_perm[i]["hrini"]
                hr_perm_fim = list_perm[i]["hrfim"]
                perm_perm =list_perm[i]["perm"]
                try:
                    perm_horario = PermHorario(hrInicial = hr_perm_ini, hrFinal = hr_perm_fim, stPermanente = perm_perm)
                    cmd.insertPermHorario(perm_horario, refresh = True)
                    usu_disp = PermUsuDisp(idCadastro = cadastroCartao.idCadastro, idPermissao = 1, idDispLocalizacao = id_disp_loc, idPermHorario = perm_horario.idPermHorario, stStatus = 'A')
                    
                except Exception as e:
                    print(f'1 - {e}')
                    return jsonify (success = False)
            except:
                print(f'Sem horário definido para a permissão número {i} do usuário.')
                try:
                    usu_disp = PermUsuDisp(idCadastro = cadastroCartao.idCadastro, idPermissao = 1, idDispLocalizacao = id_disp_loc, stStatus = 'A')
                    
                except Exception as e:
                    print(f'2 - {e}')
                    return jsonify (success = False)
            try:
                cmd.insertPermUsuDisp(usu_disp)
            except Exception as e:
                    print(f'3 - {e}')
                    return jsonify (success = False)



        return jsonify(success = True)

        
        if request.method == 'GET':
            return jsonify(get = True)


#-----------------------------------------------------#
#---------------------NOVAS ROTAS---------------------#
#-----------------------------------------------------#

@app.route ('/registerDisp', methods = ['GET','POST'])
def registerDisp():
    
     if request.method == 'POST':

        try:
            data = request.get_json ()
        except (KeyError, TypeError, ValueError):
            resp = jsonify (success = False)
            return answer (app, 204, resp)
    
        try:
            noDisp = data['desc']
            st_disp = data['status']
            noLoc = 0
        except Exception as e:
            print (e)
            return jsonify(success = False)
        try:
            noLoc = data['loc']
            disp_loc = cmd.selLocalizacaoDisp_no(noLoc)

            dict_disp_loc = disp_loc[0].getDict()
            id_disp_loc = dict_disp_loc['idLocalizacaoDisp']

        except Exception as e:
            print(e)
            print('Nenhuma sala enviada ou sala não encontrada.')
        
        new_disp = Dispositivo(noDispositivo = noDisp, stAtivo = st_disp)

        
        try:
            cmd.insertDispositivo(new_disp, refresh=True)
            if noLoc != 0:
                dispLoca = DispLocalizacao(idDispositivo = new_disp.idDispositivo, idLocalizacaoDisp = id_disp_loc, stSituacao = st_disp)
                
                cmd.insertDispLocalizacao(dispLoca)
            return jsonify(success = True)
        except Exception as e:
            print(e)
            return jsonify(success = False)

@app.route ('/updateDisp', methods = ['GET','POST'])
def updateDisp():
    if request.method == 'POST':
        global old_id_disp_loc
        try:
            data = request.get_json ()
        except (KeyError, TypeError, ValueError):
            resp = jsonify (success = False)
            return answer (app, 204, resp)
        update_disp = Dispositivo()
        noLoc = 0
        for key in data:
            if key == "id_disp": id_disp = data['id_disp']  
            if key == "disp": update_disp.noDispositivo = data['disp']   
            if key == "status": update_disp.stAtivo = data['status']  
            if key == "loc": noLoc = data['loc']
                
        try:
            cmd.updateDispositivo(int(id_disp), update_disp)

            if update_disp.stAtivo == "I" and len(cmd.selDispLocalizacao_disp(id_disp)) != 0:
                update_disp_loc = DispLocalizacao()
                
                old_disp_loc = cmd.selDispLocalizacao_disp(id_disp)

                for i in range(len(old_disp_loc)):
                    dict_old_disp_loc = old_disp_loc[i].getDict()
                    old_id_disp_loc = dict_old_disp_loc['idDispLocalizacao']

                    cmd.updateStSituacaoDispLoc(old_id_disp_loc, update_disp.stAtivo)
            
            if noLoc != 0:
                    old_disp_loc = cmd.selDispLocalizacao_disp(id_disp)

                    new_loc_disp = cmd.selLocalizacaoDisp_no(noLoc)

                    dict_new_loc_disp = new_loc_disp[0].getDict()
                    new_id_loc_disp = dict_new_loc_disp['idLocalizacaoDisp']

                    #print(f'AQUIIIIIII     {cmd.selDispLocalizacao_disp_loc(id_disp, new_id_loc_disp)}')
                    
                    #CASO HAJA UMA CONEXÃO PRÉVIA AINDA ATIVA
                    if len(old_disp_loc) != 0:
                        for i in range(len(old_disp_loc)):
                            dict_old_disp_loc = old_disp_loc[i].getDict()
                            old_id_disp_loc = dict_old_disp_loc['idDispLocalizacao']

                            cmd.updateStSituacaoDispLoc(old_id_disp_loc, "I")
                    #VERIFICA SE JÁ EXISTE UMA CONEXÃO COM A LOCALIZAÇÃO ENVIADA
                    if len(cmd.selDispLocalizacao_disp_loc(id_disp, new_id_loc_disp)) != 0:
                        update_disp_loc = cmd.selDispLocalizacao_disp_loc(id_disp, new_id_loc_disp)
                        dict_update_disp_loc = update_disp_loc[0].getDict()

                        update_id_disp_loc = dict_update_disp_loc['idDispLocalizacao']

                        cmd.updateStSituacaoDispLoc(update_id_disp_loc, "A")
                    #CASO NÃO HAJA UMA CONEXÃO, FARÁ UMA
                    else :
                        new_loc_disp = cmd.selLocalizacaoDisp_no(noLoc)

                        dict_new_loc_disp = new_loc_disp[0].getDict()
                        new_id_loc_disp = dict_new_loc_disp['idLocalizacaoDisp']
                        
                        
                        dispLoca = DispLocalizacao(idDispositivo = id_disp, idLocalizacaoDisp = new_id_loc_disp, stSituacao = "A")  
                        cmd.insertDispLocalizacao(dispLoca)

            return jsonify(success = True)
        except Exception as e:
            print (f'1 - {e}')
            return jsonify(success = False)



@app.route ('/dispInfo', methods = ['GET','POST'])
def dispInfo():
    all_disp = cmd.selAllDispositivos(include_inactive = True)

    info_disp = {}
    list_disp = []
    for i in all_disp:
        dict_disp = {}
        dict_disp["id_disp"] = i.idDispositivo
        dict_disp["desc"] = i.noDispositivo
        dict_disp["status"] = i.stAtivo
        if len(cmd.selDispLocalizacao_disp(i.idDispositivo)) != 0:
            disp_loc = cmd.selDispLocalizacao_disp(i.idDispositivo)
            id_loc_disp = disp_loc[0].idLocalizacaoDisp

            dict_disp["id_loc"] = id_loc_disp

            loc_disp = cmd.selLocalizacaoDisp(id_loc_disp)
            dict_disp["no_loc"] = loc_disp[0].noLocalizacao

            
        list_disp.append(dict_disp)

    info_disp["dispinfo"] = list_disp
    return jsonify (info_disp)





@app.route ('/registerLoc', methods = ['GET','POST'])
def registerLoc():
    if request.method == 'POST':

        try:
            data = request.get_json ()
        except (KeyError, TypeError, ValueError):
            resp = jsonify (success = False)
            return answer (app, 204, resp)

        str_emp = data['emp']
        str_loc = data['loc']
        str_andar = data['andar']
        str_area = data['area']
        
        try:

            andar = int(str_andar)
            area = int(str_area)
            insereDispLoc = LocalizacaoDisp(noEmpresa = str_emp,noLocalizacao = str_loc, vlAndar = andar, vlArea = area)
             
            cmd.insertLocalizacaoDisp(insereDispLoc, refresh = True)
            return jsonify(success = True)
            #VERIFICAR COM A APLICAÇÃO SE PODERÃO ARMAZENAR ISSO
            #return jsonify(idLoc = insereDispLoc.idLocalizacaoDisp)

        except Exception as e:
            print(e)
            return jsonify(success = False)


@app.route ('/updateLoc', methods = ['GET','POST'])
def updateLoc():
    if request.method == 'POST':
        try:
            data = request.get_json ()
        except (KeyError, TypeError, ValueError):
            resp = jsonify (success = False)
            return answer (app, 204, resp)
        

        id_loc = data['id_loc']

        update_loc_disp = LocalizacaoDisp(idLocalizacaoDisp = id_loc)

        for key in data:
            if key == "emp": update_loc_disp.noEmpresa = data['emp']   
            if key == "loc": update_loc_disp.noLocalizacao = data['loc']  
            if key == "andar": update_loc_disp.vlAndar = data['andar']
            if key == "area": update_loc_disp.vlArea = data['area']
                
        
        cmd.updateLocalizacaoDisp(int(id_loc), update_loc_disp)
        print(update_loc_disp)
        return jsonify(success = True)


@app.route ('/locInfo', methods = ['GET','POST'])
def locInfo():

    info_loc_disp = {}
    list_loc_disp = []
    all_loc_disp = cmd.selAllLocalizacaoDisps()
    for i in all_loc_disp:
        dict_loc_disp = {}
        dict_loc_disp["id_loc"] = i.idLocalizacaoDisp
        dict_loc_disp["emp"] = i.noEmpresa
        dict_loc_disp["loc"] = i.noLocalizacao
        dict_loc_disp["andar"] = i.vlAndar
        dict_loc_disp["area"] = i.vlArea
        list_loc_disp.append(dict_loc_disp)

    info_loc_disp["locinfo"] = list_loc_disp
    return jsonify (info_loc_disp)
        
    




@app.route ('/registerPerm', methods = ['GET','POST'])
def registerPerm():
    if request.method == 'POST':

        try:
            data = request.get_json ()
        except (KeyError, TypeError, ValueError):
            resp = jsonify (success = False)
            return answer (app, 204, resp)

        list_perm = data['permissoes']
        
        for i in range(len(list_perm)):
            hr_perm_ini = 0
            hr_perm_fim = 0
            perm_perm = 0
            loc_perm = list_perm[i]["loc"]

            loc_perm_no = cmd.selLocalizacaoDisp_no(loc_perm)

            dict_loc_perm = loc_perm_no[0].getDict()
            id_loc_perm = dict_loc_perm['idLocalizacaoDisp']
            print(f'id_loc_perm:   {id_loc_perm}')
            disp_loc = cmd.selDispLocalizacao(id_loc_perm)
            print(f'disp_loc:  {disp_loc}')
            dict_disp_loc = disp_loc[0].getDict()
            id_disp_loc = dict_disp_loc['idDispLocalizacao']
            try:
                hr_perm_ini = list_perm[i]["hrini"]
                hr_perm_fim = list_perm[i]["hrfim"]
                perm_perm =list_perm[i]["perm"]
                try:
                    perm_horario = PermHorario(hrInicial = hr_perm_ini, hrFinal = hr_perm_fim, stPermanente = perm_perm)
                    cmd.insertPermHorario(perm_horario, refresh = True)
                    usu_disp = PermUsuDisp(idCadastro = 1, idPermissao = 1, idDispLocalizacao = id_disp_loc, idPermHorario = perm_horario.idPermHorario, stStatus = 'A')
                    
                except Exception as e:
                    print(f'1 - {e}')
                    return jsonify (success = False)
            except:
                print(f'Sem horário definido para a permissão número {i} do usuário.')
                try:
                    usu_disp = PermUsuDisp(idCadastro = 1, idPermissao = 1, idDispLocalizacao = id_disp_loc, stStatus = 'A')
                    
                except Exception as e:
                    print(f'2 - {e}')
                    return jsonify (success = False)
            try:
                cmd.insertPermUsuDisp(usu_disp)
            except Exception as e:
                    print(f'3 - {e}')
                    return jsonify (success = False)
        return jsonify (success = True)


@app.route ('/userInfo', methods = ['GET','POST'])
def userInfo():
    
    info_user = {}
    list_user= []
    all_user = cmd.selAllCadastros()

    for i in all_user:
        dict_user = {}
        dict_user["id_user"] = i.idCadastro
        dict_user["nome"] = i.noUsuario
        dict_user["idade"] = i.vlIdade
        dict_user["cargo"] = i.noAreaTrabalho
        if len(cmd.selCadastroCartao(i.idCadastro)) > 0:
            cad_cat = cmd.selCadastroCartao(i.idCadastro)
            nocartao = cmd.selnoCartao(cad_cat[0].idCartao)
            dict_user["status"] = cad_cat[0].stEstado
            dict_user["RFID"] = nocartao
            
        list_user.append(dict_user)

    info_user['usuarios']=list_user

    return jsonify(info_user)

#---------------------------------#


#-----------------------------------------------------#
#-----------------------FUNÇÕES-----------------------#
#-----------------------------------------------------#

def is_available(RFID):
    global available
    available = not(cmd.selCountCartoesAtivos(RFID) > 0)
    return available

def findrooms():
    dispositivo = []

    for i in cmd.selAllDispositivos():
        full_dict_disp = i.getDict()
        dict_disp = {}
        dict_disp['idSala'] = full_dict_disp['idDispositivo']
        dict_disp['nomeSala'] = full_dict_disp['noDispositivo']
        dict_disp["qtdOcupantes"] = cmd.selCountPessoasSala(i.idDispositivo)
        dispositivo.append(dict_disp)
  
    room = {}
    room['salas'] = dispositivo
    return room 

def validateRoom(room,idSala):
    for sala in room['salas']:
        if int(idSala) == int(sala['idSala']):
            return True
    return False

def fuc_roominfo(app_id_sala):
    global id_sala
    id_sala = app_id_sala

    print(id_sala)
  
    room = findrooms()

    if validateRoom(room,id_sala):
        info_users = []
        img_users = []
        users_inside = []

        #Verifica o id dos usuários dentro da 'id_sala'
        #Verifica o nome da pessoa que está dentro da 'id_sala'
        for i in cmd.selPessoasSala(id_sala):
            users_inside.append(i.idCadastro)
            info_users.append(i.noUsuario)
            img_users.append(i.edArquivoImagem)

        users_inside.sort()
        print(users_inside)

        print(info_users)
    
        lista_ocupantes = []

        for i in range(len(users_inside)):
            #VERIFICAR SE O ARQUIVO DE IMAGEM DE PERFIL EXISTE
            if os.path.exists(os.getcwd().replace("\\","/")+"/static/imagens/"+str(users_inside[i])+".png"):
                dict_ocupante = dict (nomeOcupante = info_users[i], idOcupante = users_inside[i], imgPerfil = img_users[i])
                lista_ocupantes.append(dict_ocupante)
            else:
                dict_ocupante = dict (nomeOcupante = info_users[i], idOcupante = users_inside[i], imgPerfil = '')
                lista_ocupantes.append(dict_ocupante)
        #VERIFICAR SE O ARQUIVO DE IMAGEM DE SALA EXISTE
        if os.path.exists(os.getcwd().replace("\\","/")+"/static/imagens/SalaIBTI.png"):
            img_sala = url_for("static",filename = "imagens/SalaIBTI.png",_external = True)
            sala = dict( idSala = id_sala, nomeSala = room['salas'][int(id_sala)-1]['nomeSala'], imgMapaSala = img_sala ,ocupantes = lista_ocupantes)
            room['salaSelecionada'] = sala

        return room
    else:
        print("O idSala "+str(id_sala)+" não existe no banco de dados!")

#-----------RODANDO------------#
if __name__ == '__main__':
    socketio.run(app, host = '0.0.0.0', port=7000)
