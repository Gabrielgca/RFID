from db_commands_v2 import RfidCommands 
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
ed_arquivo_imagem='{}',
vl_idade = '{}',
no_area_trabalho = '{}'
    )>'''.format(self.idCadastro, self.noUsuario, self.edArquivoImagem, self.vlIdade, self.noAreaTrabalho)
    
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
    dtRota = db.Column('dt_rota', db.Date, nullable=True, comment='Data em que a rota foi registrada.')
    hrRota = db.Column('hr_rota', db.Time, nullable=True, comment='Hora em que a rota foi registrada.')

    dispositivoOrigem = db.relationship('Dispositivo', back_populates='rotasOrigem', foreign_keys=[idDispositivoOrigem])
    dispositivoDestino = db.relationship('Dispositivo', back_populates='rotasDestino', foreign_keys=[idDispositivoDestino])
    cadastro = db.relationship('Cadastro', back_populates='rotas')

    def __repr__(self):
        return '''<Rota
    (id_rota='{}',
    id_dispositivo_origem='{}',
    id_dispositivo_destino='{}',
    id_cadastro='{}',
    dt_rota='{}',
    hr_rota='{}')>'''.format(self.idRota, self.idDispositivoOrigem, self.idDispositivoDestino, self.idCadastro, self.dtRota, self.hrRota)

    def getDict(self):
        self.dictionary = {}
        self.dictionary['idRota'] = self.idRota
        self.dictionary['idDispositivoOrigem'] = self.idDispositivoOrigem
        self.dictionary['idDispositivoDestino'] = self.idDispositivoDestino
        self.dictionary['idCadastro'] = self.idCadastro
        self.dictionary['dtRota'] = self.dtRota
        self.dictionary['hrRota'] = self.hrRota
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
    noEmpresa = db.Column('no_empresa', db.String(40), nullable = False, comment='''Nome da empresa em que se encontra a localização.''')
    noLocalizacao = db.Column('no_localizacao', db.String(40), nullable=False, comment='''Nome da localização do dispositivo''')
    vlAndar = db.Column('vl_andar', db.Integer, nullable=True, default=None, comment='''Indicação do andar da localização''')
    vlArea = db.Column('vl_area', db.Integer, nullable=False, comment='''Quantidade de pessoas na localização''')
    vlQtdeLampadas = db.Column('vl_qtde_lampadas', db.Integer, nullable=False, comment='''Quantidade de lâmpadas instaladas na localização.''')
    vlConsumoLamp = db.Column('vl_consumo_lamp', db.Integer, nullable=False, comment='''Consumo total por lâmpada instalada, em watts.''')
    stStatus = db.Column('st_status', db.Integer, nullable=False, default='A')

    dispositivos = db.relationship('DispLocalizacao', back_populates='localizacaoDisp')

    def __repr__(self):
        return '''<Localizacao_disp
    (id_localizacao_disp='{}',
    no_empresa='{}',
    no_localizacao='{}',
    vl_andar='{}',
    vl_area='{}',
    vl_qtde_lampadas='{}',
    vl_consumo_lamp='{}',
st_status='{}')>'''.format(self.idLocalizacaoDisp, self.noEmpresa, self.noLocalizacao, self.vlAndar, self.vlArea, self.vlQtdeLampadas, self.vlConsumoLamp, self.stStatus)

    def getDict(self):
        self.dictionary = {}
        self.dictionary['idLocalizacaoDisp'] = self.idLocalizacaoDisp
        self.dictionary['noEmpresa'] = self.noEmpresa
        self.dictionary['noLocalizacao'] = self.noLocalizacao
        self.dictionary['vlAndar'] = self.vlAndar
        self.dictionary['vlArea'] = self.vlArea
        self.dictionary['vlQtdeLampadas'] = self.vlQtdeLampadas
        self.dictionary['vlConsumoLamp'] = self.vlConsumoLamp
        self.dictionary['stStatus'] = self.stStatus
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
    #try:
    locDisp = request.args.get('LOC')
    idrfid = request.args.get('RFID')
    idrfid = idrfid.upper()
    available = is_available(idrfid)
    print(idrfid)
    print(available)
    
    if available:
        uplink = True
        # Envia o ID para a aplicação e o possibilita ser cadastrado
        socketio.emit('register', idrfid)
        return jsonify (success = False)
    
        
    if cmd.selDispLocalizacaoByDisp (locDisp) != None:
        cadastroCartao = cmd.selCadastroCartaoAtivo(idrfid)
        ultOcorrencia = cmd.selUltOcorrenciaCadastro(cadastroCartao.idCadastro)

        disp_loc = cmd.selDispLocalizacaoByDisp (locDisp)
        
        population = cmd.selCountPessoasSala (locDisp)
        loc_disp = cmd.selLocalizacaoDispByDisp (locDisp)

        print (f'LOCATION ID: {loc_disp.idLocalizacaoDisp}')
        print (f'CURRENT POPULATION: {population}')
        print (f'MAX POPULATION: {loc_disp.vlArea / 2}')

        if population >= loc_disp.vlArea / 2:
            # ACCESS DENIED: number of people in this location can't go any higher
            print('NÚMERO MAXIMO NA SALA FOI EXCEDIDO.')
            return jsonify (success = False)
        perm_usu_disp = cmd.selAllPermCadastroLocal (cadastroCartao.idCadastro, disp_loc.idDispLocalizacao)


        if len (perm_usu_disp) <= 0:
            # ACCESS DENIED
            print('1 - SEM PERMISSÃO PARA AQUELA SALA.')
            return jsonify (success = False)
        else:
            #EXISTE ALGUM REGISTRO DE PERMISSÃO NA SALA
            for i in perm_usu_disp:
                #VERIFICAR SE EXISTE PERMISSÃO ATIVA
                perm_disp = cmd.selPermissaoDisp (i.idPermissao)
                print (f'PERM_DISP: {perm_disp}')

                if len (perm_disp) <= 0: 
                    # ACCESS DENIED
                    print('2 - SEM ALGUM TIPO DE PERMISSÃO ATIVA NA SALA.')
                    return jsonify (success = False)
                else:
                    #EXISTE PERMISSÃO ATIVA
                    for j in perm_disp:
                        #VERIFICA SE O TIPO DE PERMISSÃO É DE BLOQUEIO  
                        if j.noPermissao.lower () == 'bloqueado':
                            # ACCESS DENIED
                            print('3 - TIPO DE PERMISSÃO DE BLOQUEIO. ACESSO NEGADO.')
                            return jsonify (success = False)
                            
                if i.idPermHorario is not None:
                    permissions_by_date = cmd.selPermHorarioOutOfDate (i.idPermHorario, db.func.current_date ())
                    print (f'PERMISSIONS OUT OF CURRENT DATE: {permissions_by_date}')

                    if len (permissions_by_date) > 0:
                        # ACCESS DENIED
                        print('4 - SEM PERMISSÃO PARA O DIA CORRENTE.')
                        return jsonify (success = False)
                    
                    permissions_by_time = cmd.selPermHorarioByTime (i.idPermHorario, db.func.current_time ())
                    print (f'PERMISSIONS BY TIME: {permissions_by_time}')

                    if len (permissions_by_time) <= 0:
                        # ACCESS DENIED
                        print('5 - SEM PERMISSÃO PARA O HORÁRIO ATUAL.')
                        return jsonify (success = False)
            
        # ACCESS GRANTED, proceed to database insert
        newRota = Rota(idCadastro=cadastroCartao.idCadastro,
                                        dtRota=db.func.current_date(),
                                        hrRota=db.func.current_time())

        newOcorrencia = Ocorrencia(idCadastro=cadastroCartao.idCadastro,
                                dtOcorrencia=db.func.current_date(),
                                hrOcorrencia=db.func.current_time())

        newOcupacao = Ocupacao(dtOcupacao=db.func.current_date(),
                            hrOcupacao=db.func.current_time())

        if ultOcorrencia is not None:
            if ultOcorrencia.idDispositivo == int(locDisp):
                if ultOcorrencia.stOcorrencia == 'E':
                    stOc = 'S'
                    ultRota = cmd.selUltRotaCadastro(idCadastro=cadastroCartao.idCadastro)
                    newRota.idDispositivoOrigem = ultRota.idDispositivoDestino
                    newRota.idDispositivoDestino = ultRota.idDispositivoOrigem
                    cmd.insertRota(newRota)

                    newOcupacao.idDispLocalizacao = cmd.selDispLocalizacao_disp(idDispositivo=locDisp)[0].idDispLocalizacao
                    newOcupacao.nrPessoas = cmd.selCountPessoasDispositivo(idDispositivo=locDisp)
                    cmd.insertOcupacao(ocupacao=newOcupacao, expunge=True, transient=True)


                    if ultRota.idDispositivoOrigem is not None:
                        newOcupacao.dtOcupacao = db.func.current_date()
                        newOcupacao.hrOcupacao = db.func.current_time()
                        newOcupacao.idDispLocalizacao = cmd.selDispLocalizacao_disp(idDispositivo=ultRota.idDispositivoOrigem)[0].idDispLocalizacao
                        newOcupacao.nrPessoas = cmd.selCountPessoasDispositivo(idDispositivo=ultRota.idDispositivoOrigem)
                        cmd.insertOcupacao(newOcupacao)
                else:
                    stOc = 'E'
                    ultRota = cmd.selUltRotaCadastro(idCadastro=cadastroCartao.idCadastro)
                    if ultRota is not None:
                        newRota.idDispositivoOrigem = ultRota.idDispositivoDestino
                        newRota.idDispositivoDestino = locDisp
                        cmd.insertRota(newRota)
                    else:
                        newRota.idDispositivoOrigem = None
                        newRota.idDispositivoDestino = locDisp
                        cmd.insertRota(newRota)

                    newOcupacao.idDispLocalizacao = cmd.selDispLocalizacao_disp(idDispositivo=locDisp)[0].idDispLocalizacao
                    newOcupacao.nrPessoas = cmd.selCountPessoasDispositivo(idDispositivo=locDisp)
                    cmd.insertOcupacao(newOcupacao)
                newOcorrencia.idDispositivo = locDisp
                newOcorrencia.stOcorrencia = stOc
                cmd.insertOcorrencia(newOcorrencia)
            else:
                ultRota = cmd.selUltRotaCadastro(idCadastro=cadastroCartao.idCadastro)
                if ultOcorrencia.stOcorrencia == 'E':
                    newOcorrencia.idDispositivo = ultOcorrencia.idDispositivo
                    newOcorrencia.stOcorrencia = 'S'
                    cmd.insertOcorrencia(ocorrencia=newOcorrencia, expunge=True, transient=True)
                    if ultRota.idDispositivoOrigem is not None:
                        newRota.idDispositivoOrigem = ultRota.idDispositivoDestino
                        newRota.idDispositivoDestino = ultRota.idDispositivoOrigem
                        cmd.insertRota(rota=newRota, expunge=True, transient=True)       
                        ultRota = cmd.selUltRotaCadastro(idCadastro=cadastroCartao.idCadastro)
                
                newOcorrencia.idCadastro = cadastroCartao.idCadastro
                newOcorrencia.dtOcorrencia = db.func.current_date()
                newOcorrencia.hrOcorrencia = db.func.current_time()
                newOcorrencia.idDispositivo = locDisp
                newOcorrencia.stOcorrencia = 'E'
                cmd.insertOcorrencia(newOcorrencia)

                newRota.idCadastro = cadastroCartao.idCadastro
                newRota.dtRota = db.func.current_date()
                newRota.hrRota = db.func.current_time()
                if int(ultRota.idDispositivoDestino) == int(locDisp):
                    newRota.idDispositivoOrigem = locDisp
                    newRota.idDispositivoDestino = None
                    cmd.insertRota(newRota)
                else:
                    newRota.idDispositivoOrigem = ultRota.idDispositivoDestino
                    newRota.idDispositivoDestino = locDisp
                    cmd.insertRota(newRota)
                newOcupacao.idDispLocalizacao = cmd.selDispLocalizacao_disp(idDispositivo=ultOcorrencia.idDispositivo)[0].idDispLocalizacao
                newOcupacao.nrPessoas = cmd.selCountPessoasDispositivo(idDispositivo=ultOcorrencia.idDispositivo)
                cmd.insertOcupacao(ocupacao=newOcupacao, expunge=True, transient=True)


                newOcupacao.dtOcupacao = db.func.current_date()
                newOcupacao.hrOcupacao = db.func.current_time()
                newOcupacao.idDispLocalizacao = cmd.selDispLocalizacao_disp(idDispositivo=locDisp)[0].idDispLocalizacao
                newOcupacao.nrPessoas = cmd.selCountPessoasDispositivo(idDispositivo=locDisp)
                cmd.insertOcupacao(newOcupacao)
        else:
            newOcorrencia.idDispositivo = locDisp
            newOcorrencia.stOcorrencia = 'E'
            cmd.insertOcorrencia(newOcorrencia)

            newRota.idDispositivoOrigem = None
            newRota.idDispositivoDestino = locDisp
            cmd.insertRota(newRota)

            newOcupacao.idDispLocalizacao = cmd.selDispLocalizacao_disp(idDispositivo=locDisp)[0].idDispLocalizacao
            newOcupacao.nrPessoas = cmd.selCountPessoasDispositivo(idDispositivo=locDisp)
            cmd.insertOcupacao(newOcupacao)
    
    
        
        
        
        
        '''
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
        '''   


#------------------------------------------------------------#

                






            
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
        print('Dispositivo sem uma localização ativa.')
        return 'Dispositivo sem uma localização ativa.'
            

    #except Exception as e:
        #print(e)
       # return jsonify(answer = 'cannot read any ID')

@app.route ('/register', methods = ['GET','POST'])
def register():
    if request.method == 'POST':

        try:
            data = request.get_json ()
        except (KeyError, TypeError, ValueError):
            return jsonify (success = False)

        str_card = data['codigoRFIDCartao']
        str_user = data['nomeUsuario']
        str_age = data['idade']
        str_trab = data['trab']
        str_img = data['imgPerfil']
        
        list_perm = data['permissoes']






        cadastroCartao = CadastroCartao (stEstado = 'A')
        cartao = Cartao (noCartao = str_card)
        usuario = Cadastro (noUsuario = str_user, vlIdade = str_age, noAreaTrabalho = str_trab)
        try:
            if cmd.selnoCartao(str_card) != None:
                #CARTAO JÁ TINHA SIDO CADASTRADO
                print('1')
                cmd.insertCadastro(usuario, refresh = True)
                id_cartao = cmd.selnoCartao(str_card).idCartao
                cadastroCartao = CadastroCartao(idCadastro = usuario.idCadastro, idCartao = id_cartao, stEstado = 'A')
                cmd.insertCadastroCartao_byid(cadastroCartao, refresh=True)
                cmd.updateCadastroImg(idCadastro = cadastroCartao.idCadastro,
                                 imgUrl = url_for("static",filename = "imagens/"+str(cadastroCartao.idCadastro)+".png",_external = True))
            else:
                #CARTAO NÃO TINHA SIDO CADASTRADO
                cmd.insertCadastroCartao(cadastroCartao = cadastroCartao,
                                        cadastro = usuario,
                                        cartao = cartao,
                                        refresh = True)
            cmd.updateCadastroImg(idCadastro = cadastroCartao.idCadastro,
                                 imgUrl = url_for("static",filename = "imagens/"+str(cadastroCartao.idCadastro)+".png",_external = True))
        except Exception as e:
            print(e)
            return jsonify(success = False)

        #VERIFICAR CAMINHO NA RASP
        with open(os.getcwd().replace("\\","/")+"/static/imagens/{}.png".format(str(cadastroCartao.idCadastro)),"wb") as png2:
            png2.write(base64.b64decode(str_img))

        for i in range(len(list_perm)):

            hr_perm_ini = 0
            hr_perm_fim = 0
            perm_perm = "N"
            id_disp_loc = list_perm[i]["id_disp_loc"]
            #print(f'loc_perm :{loc_perm}')
            #MUDEI PARA QUE RECEBA O ID, E NÃO O NOME
            if list_perm[i]["hrini"] != None or list_perm[i]["hrini"] != None:
                hr_perm_ini = list_perm[i]["hrini"]
                hr_perm_fim = list_perm[i]["hrfim"]
                print(f'horário recebido de início : { list_perm[i]["hrini"]}')
                print(f'horário recebido de fim : { list_perm[i]["hrfim"]}')
                perm_perm =list_perm[i]["permanente"]



                if "dtini" not in list_perm[i] and "dtfim" not in list_perm[i]:
                    list_perm[i]["dtini"] == None
                    list_perm[i]["dtfim"] == None

                
                if list_perm[i]["dtini"] == None or list_perm[i]["dtfim"] == None:
                    #CASO NÃO EXISTA DATA ESPECÍFICA
                    try:
                        perm_horario = PermHorario(hrInicial = hr_perm_ini, hrFinal = hr_perm_fim, stPermanente = perm_perm)
                        cmd.insertPermHorario(perm_horario, refresh = True)
                        usu_disp = PermUsuDisp(idCadastro = cadastroCartao.idCadastro, idPermissao = 1, idDispLocalizacao = id_disp_loc, idPermHorario = perm_horario.idPermHorario, stStatus = 'A')
                        
                    except Exception as e:
                        print(f'register 1 - {e}')
                        return jsonify (success = False)
                else:
                    #CASO EXISTA DATA ESPECÍFICA 
                    try:
                        perm_horario = PermHorario(hrInicial = hr_perm_ini, hrFinal = hr_perm_fim, dtInicio = list_perm[i]["dtini"], dtFim = list_perm[i]["dtfim"],stPermanente = perm_perm)
                        cmd.insertPermHorario(perm_horario, refresh = True)
                        usu_disp = PermUsuDisp(idCadastro = cadastroCartao.idCadastro, idPermissao = 1, idDispLocalizacao = id_disp_loc, idPermHorario = perm_horario.idPermHorario, stStatus = 'A')
                    
                    except Exception as e:
                        print(f'register 1 - {e}')
                        return jsonify (success = False)

            else:
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


@app.route ('/userInfo', methods = ['GET','POST'])
def userInfo():
    
    info_user = {}
    list_user= []
    all_user = cmd.selAllCadastros()
    list_perm = []
    for i in all_user:
        dict_user = {}
        dict_user["id_user"] = i.idCadastro
        dict_user["name"] = i.noUsuario
        dict_user["age"] = i.vlIdade
        dict_user["office"] = i.noAreaTrabalho

        #VERIFICAR SE O ARQUIVO DE IMAGEM DE PERFIL EXISTE
        if os.path.exists(os.getcwd().replace("\\","/")+"/static/imagens/"+ str(i.idCadastro) +".png"):
            dict_user['imgPerfil'] = i.edArquivoImagem

        if len(cmd.selCadastroCartao(i.idCadastro)) > 0:
            cad_cat = cmd.selCadastroCartao(i.idCadastro)
            nocartao = cmd.selCartao(cad_cat[-1].idCartao)
            dict_user["status"] = cad_cat[-1].stEstado
            dict_user["RFID"] = nocartao




        if len(cmd.selPermUsuDisp(i.idCadastro)) > 0:
            for j in range(len(cmd.selPermUsuDisp(i.idCadastro))):

                dict_perm = {}
                perm_usu_disp = cmd.selPermUsuDisp(i.idCadastro)
                dict_perm['id_perm_usu_disp'] = perm_usu_disp[j].idPermUsuDisp
                dict_perm['id_user'] = perm_usu_disp[j].idCadastro
                dict_perm['id_perm'] = perm_usu_disp[j].idPermissao

                dict_perm['id_disp_loc'] = perm_usu_disp[j].idDispLocalizacao

                disp_loc = cmd.selDispLocalizacao_byid(dict_perm['id_disp_loc'], alldisploc = True)

                loc_disp = cmd.selLocalizacaoDisp(disp_loc.idLocalizacaoDisp)

                dict_perm['company'] = loc_disp[0].noEmpresa
                dict_perm['no_localizacao'] = loc_disp[0].noLocalizacao

                dict_perm['id_perm_hora'] = perm_usu_disp[j].idPermHorario

                if dict_perm['id_perm_hora'] != None:
                    
                    perm_hor = cmd.selPermHorario(dict_perm['id_perm_hora'] )

                    dict_perm['hr_inicio'] = perm_hor[0].hrInicial.strftime("%H:%M:%S")
                    dict_perm['hr_final'] = perm_hor[0].hrFinal.strftime("%H:%M:%S")
                    dict_perm['permanente'] = perm_hor[0].stPermanente

                    if perm_hor[0].dtInicio != None or perm_hor[0].dtFim != None:
                        dict_perm['dt_inicio'] = perm_hor[0].dtInicio.strftime("%m/%d/%Y")
                        dict_perm['dt_fim'] = perm_hor[0].dtFim.strftime("%m/%d/%Y")

                dict_perm['status'] = perm_usu_disp[j].stStatus
                list_perm.append(dict_perm)
            dict_user["perm"] = list_perm
            list_perm = []
        list_user.append(dict_user)

    
    info_user['usuarios']=list_user
    return jsonify(info_user)

@app.route ('/updateUser', methods = ['GET','POST'])
def updateUser():
    if request.method == 'POST':
        global old_id_disp_loc
        try:
            data = request.get_json ()
        except (KeyError, TypeError, ValueError):
            return jsonify (success = False)

        update_user = Cadastro()

        id_user = data['id_user']
        update_user.noUsuario = data['name']
        update_user.vlIdade = data['age']
        update_user.noAreaTrabalho = data['office']
  
        
        #DESATIVANDO RFID ANTERIOR
        vl_status = data['status']
        user_card= cmd.selCadastroCartao(id_user)

        id_user_card = user_card[-1].idCadastroCartao
        vl_user_card = user_card[-1].stEstado
        
        
        #ATUALIZANDO NOVO RFID PARA O USUÁRIO
        noRFID = data['RFID']
        #VERIFICA SE O USUÁRIO JÁ ESTÁ CADASTRADO
        if len(cmd.selCadastroCartao(id_user)) > 0:

            #VERIFICA SE O RFID JÁ FOI CADASTRADO
            if cmd.selnoCartao(noRFID) == None:
                #CARTAO NAO TINHA SIDO CADASTRADO AINDA
                #CADASTRO SERÁ FEITO
                print('1')
                cmd.updateStEstadoCadastroCartao(id_user_card, 'I')
                cartao = Cartao(noCartao = noRFID)
                cmd.insertCartao(cartao, refresh = True)
                cadastro_cartao = CadastroCartao(idCadastro = id_user, idCartao = cartao.idCartao, stEstado = 'A')
                cmd.insertCadastroCartao_byid(cadastro_cartao)

            else:
                try:
                    #TENTA ATUALIZAR O CADASTRO DO USUÁRIO COM AQUELE RFID, CASO EXISTA
                    if vl_user_card == 'A' and vl_status != 'A':
                        print('2')
                        cmd.updateStEstadoCadastroCartao(id_user_card, 'I')
                    else:    
                        print('3')
                        cartao = cmd.selnoCartao(noRFID)
                        id_cartao = cartao.idCartao
                        if len(cmd.selidCadastroidCartao(id_user, id_cartao)) != 0:
                            cmd.updateStEstadoCadastroCartao(id_user_card, 'I')
                            cadastro_cartao = CadastroCartao(idCadastro = id_user, idCartao = id_cartao, stEstado = 'A')
                            cmd.insertCadastroCartao(cadastro_cartao)
                        else:
                            cmd.updateStEstadoCadastroCartao(id_user_card, 'A')
                except:
                    #CASO NÃO HAJA O CADASTRO DO USUÁRIO COM AQUELE RFID, SERÁ INSERIDO
                    print('4')
                    cartao = cmd.selnoCartao(noRFID)
                    id_cartao = cartao.idCartao
                    cadastro_cartao = CadastroCartao(idCadastro = id_user, idCartao = id_cartao, stEstado = 'A')
                    cmd.insertCadastroCartao_byid(cadastro_cartao)

        else:
            print('Não foi encontrado um id_cadastro na tabela tb_cadastro_cartao.')
            return jsonify(success = False)
            
        if data['imgPerfil'] != None:
            str_img = data['imgPerfil']
            with open(os.getcwd().replace("\\","/")+"/static/imagens/{}.png".format(id_user),"wb") as png2:
                png2.write(base64.b64decode(str_img))

        count = 0
        if "perm" in data:
            list_perm = data['perm']
            
            for i in list_perm:

                if "dtini" not in list_perm[i] and "dtfim" not in list_perm[i]:
                    list_perm[i]["dtini"] == None
                    list_perm[i]["dtfim"] == None
                
                for p_key in i:
                    #CASO DE ATUALIZAR PERMISSÃO
                    if p_key == 'id_perm_usu_disp':
                        
                        id_perm_usu_disp = list_perm[count]['id_perm_usu_disp']
                        #CASO DE ATUALIZAR STATUS DA PERMISSÃO
                        if "st_perm_usu_disp" in list_perm[count]:
                            
                            st_perm_usu_disp = list_perm[count]['st_perm_usu_disp']
                            cmd.updatestStatusPermUsuDisp(id_perm_usu_disp, st_perm_usu_disp)
                        #CASO DE ATUALIZAR HORA OU DATA DA PERMISSÃO
                        if "hr_inicio" in list_perm[count] and "hr_final" in list_perm[count] :
                            
                            if list_perm[count]['hr_inicio'] != None and list_perm[count]['hr_final'] != None:
                                
                                hr_inicio = list_perm[count]['hr_inicio']
                                hr_final = list_perm[count]['hr_final']
                                permissao = list_perm[count]['permanente']

                                if list_perm[i]["dtini"] == None or list_perm[i]["dtfim"] == None:
                                    #CASO NÃO EXISTA DATA ESPECÍFICA
                                    try:
                                        perm_horario = PermHorario(hrInicial = hr_inicio, hrFinal = hr_final, stPermanente = permissao)
                                        cmd.insertPermHorario(perm_horario, refresh = True)
                                        
                                        cmd.updatePermHorarioPermUsuDisp(id_perm_usu_disp,perm_horario.idPermHorario)
                                    except Exception as e:
                                        print(f'update permissao  - {e}')
                                        return jsonify (success = False)
                                else:
                                    #CASO EXISTA DATA ESPECÍFICA 
                                    try:
                                        perm_horario = PermHorario(hrInicial = hr_perm_ini, hrFinal = hr_perm_fim, dtInicio = list_perm[i]["dtini"], dtFim = list_perm[i]["dtfim"],stPermanente = perm_perm)
                                        cmd.insertPermHorario(perm_horario, refresh = True)
                                        cmd.updatePermHorarioPermUsuDisp(id_perm_usu_disp,perm_horario.idPermHorario)
                                    
                                    except Exception as e:
                                        print(f'register 1 - {e}')
                                        return jsonify (success = False)
                            else:
                                print('Tirando horário de permissão.')
                                        
                                cmd.updatePermHorarioPermUsuDisp(id_perm_usu_disp, None)
                    #CASO DE ADICIONAR NOVA PERMISSÃO
                    elif p_key == 'id_disp_loc':
                        
                        print('ENTREI AQUI 5 .')
                        id_disp_loc = list_perm[count]["id_disp_loc"]
                        
                        '''disp_loc = cmd.selDispLocalizacao(id_loc_perm)
                        dict_disp_loc = disp_loc[-1].getDict()
                        id_disp_loc = dict_disp_loc['idDispLocalizacao']
                        '''
                        if "hr_inicio" in list_perm[count] and "hr_final" in list_perm[count]:
                            print('ENTREI AQUI 6 .')
                            hr_perm_ini = list_perm[count]["hr_inicio"]
                            hr_perm_fim = list_perm[count]["hr_final"]
                            print(f'horário recebido de início : { list_perm[count]["hr_inicio"]}')
                            print(f'horário recebido de fim : { list_perm[count]["hr_final"]}')
                            perm_perm =list_perm[count]["permanente"]
                            try:
                                perm_horario = PermHorario(hrInicial = hr_perm_ini, hrFinal = hr_perm_fim, stPermanente = perm_perm)
                                cmd.insertPermHorario(perm_horario, refresh = True)
                                usu_disp = PermUsuDisp(idCadastro = id_user, idPermissao = 1, idDispLocalizacao = id_disp_loc, idPermHorario = perm_horario.idPermHorario, stStatus = 'A')
                                
                            except Exception as e:
                                print(f'register 1 - {e}')
                                return jsonify (success = False)
                        else:
                            print(f'Sem horário definido para a permissão número {i} do usuário.')
                            try:
                                usu_disp = PermUsuDisp(idCadastro = id_user, idPermissao = 1, idDispLocalizacao = id_disp_loc, stStatus = 'A')
                                
                            except Exception as e:
                                print(f'2 - {e}')
                                return jsonify (success = False)
                        try:
                            cmd.insertPermUsuDisp(usu_disp)
                        except Exception as e:
                                print(f'3 - {e}')
                                return jsonify (success = False)
                count = count + 1
            count = 0



        
        cmd.updateCadastro(id_user, update_user)

        return jsonify(success = True)
        


@app.route ('/registerDisp', methods = ['GET','POST'])
def registerDisp():
    
     if request.method == 'POST':

        try:
            data = request.get_json ()
        except (KeyError, TypeError, ValueError):
            return jsonify (success = False)
    
        try:
            noDisp = data['desc']
            st_disp = data['status']
            id_disp_loc = 0
        except Exception as e:
            print (e)
            return jsonify(success = False)
        try:
            id_loc_disp = data['loc']
           # disp_loc = cmd.selLocalizacaoDisp_no(noLoc)

           # dict_disp_loc = disp_loc[0].getDict()
            # id_disp_loc = dict_disp_loc['idLocalizacaoDisp']

        except Exception as e:
            print(e)
            print('Nenhuma sala enviada ou sala não encontrada.')
        
        new_disp = Dispositivo(noDispositivo = noDisp, stAtivo = st_disp)

        
        try:
            cmd.insertDispositivo(new_disp, refresh=True)
            if id_loc_disp != 0:
                dispLoca = DispLocalizacao(idDispositivo = new_disp.idDispositivo, idLocalizacaoDisp = id_loc_disp, stSituacao = st_disp)
                
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
            return jsonify (success = False)

        update_disp = Dispositivo()
        idLoc = 0
        for key in data:
            if key == "id_disp": id_disp = data['id_disp']      
            if key == "disp": update_disp.noDispositivo = data['disp']   
            if key == "loc": idLoc = data['loc']
                
        try:
            cmd.updateDispositivo(int(id_disp), update_disp)

            if idLoc != 0:
                    old_disp_loc = cmd.selDispLocalizacao_disp(id_disp)

                    #print(f'AQUIIIIIII     {cmd.selDispLocalizacao_disp_loc(id_disp, new_id_loc_disp)}')
                    
                    #CASO HAJA UMA CONEXÃO PRÉVIA AINDA ATIVA
                    if len(old_disp_loc) != 0:
                        for i in range(len(old_disp_loc)):
                            dict_old_disp_loc = old_disp_loc[i].getDict()
                            old_id_disp_loc = dict_old_disp_loc['idDispLocalizacao']

                            cmd.updateStSituacaoDispLoc(old_id_disp_loc, "I")
                    #VERIFICA SE JÁ EXISTE UMA CONEXÃO COM A LOCALIZAÇÃO ENVIADA
                    if len(cmd.selDispLocalizacao_disp_loc(id_disp, idLoc)) != 0:
                        update_disp_loc = cmd.selDispLocalizacao_disp_loc(id_disp, idLoc)
                        dict_update_disp_loc = update_disp_loc[-1].getDict()

                        update_id_disp_loc = dict_update_disp_loc['idDispLocalizacao']

                        cmd.updateStSituacaoDispLoc(update_id_disp_loc, "A")
                    #CASO NÃO HAJA UMA CONEXÃO, FARÁ UMA
                    else :
           
                        dispLoca = DispLocalizacao(idDispositivo = id_disp, idLocalizacaoDisp = idLoc, stSituacao = "A")  
                        cmd.insertDispLocalizacao(dispLoca)

            return jsonify(success = True)
        except Exception as e:
            print (f'updatedisp 1 - {e}')
            return jsonify(success = False)

@app.route ('/statusDisp', methods = ['GET','POST'])
def statusDisp():
    #ROTA APENAS PARA ATUALIZAR O STATUS DO DISPOSITIVO

    if request.method == 'POST':
        global old_id_disp_loc, id_disp
        try:
            data = request.get_json ()
        except (KeyError, TypeError, ValueError):
            return jsonify (success = False)

        update_disp = Dispositivo()
        id_disp = 0
        for key in data:
            if key == "id_disp": id_disp = data['id_disp']      
            if key == "status": update_disp.stAtivo = data['status']  
        #try:
        cmd.updateDispositivo(int(id_disp), update_disp)

        if len(cmd.selDispLocalizacao_disp(int(id_disp), alldisploc = True)) != 0:
            
            old_disp_loc = cmd.selDispLocalizacao_disp(int(id_disp), alldisploc = True)

            dict_old_disp_loc = old_disp_loc[-1].getDict()
            old_id_disp_loc = dict_old_disp_loc['idDispLocalizacao']

            cmd.updateStSituacaoDispLoc(old_id_disp_loc, update_disp.stAtivo)

        return jsonify(success = True)
        #except Exception as e:
           # print(e)
           # return jsonify(success = False)
    

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
            id_loc_disp = disp_loc[-1].idLocalizacaoDisp
            dict_disp["id_disp_loc"] = disp_loc[-1].idDispLocalizacao
            dict_disp["id_loc_disp"] = id_loc_disp

            loc_disp = cmd.selLocalizacaoDisp(id_loc_disp)
            dict_disp["no_loc"] = loc_disp[-1].noLocalizacao

            
        list_disp.append(dict_disp)

    info_disp["dispinfo"] = list_disp
    return jsonify (info_disp)





@app.route ('/registerLoc', methods = ['GET','POST'])
def registerLoc():
    if request.method == 'POST':

        try:
            data = request.get_json ()
        except (KeyError, TypeError, ValueError):
            return jsonify (success = False)

        str_emp = data['companyName']
        str_loc = data['roomName']
        str_andar = data['floor']
        str_area = data['area']
        
        try:
            andar = int(str_andar)
            area = int(str_area)
            insereLocDisp = LocalizacaoDisp(noEmpresa = str_emp,noLocalizacao = str_loc, vlAndar = andar, vlArea = area, vlQtdeLampadas = 20,vlConsumoLamp = 40, stStatus = 'A')

            cmd.insertLocalizacaoDisp(insereLocDisp, refresh = True)
           
            if data['img'] != None:
                str_img = data['img']
                with open(os.getcwd().replace("\\","/")+"/static/setores/{}_{}.png".format(str_emp.replace(" ", "_"), insereLocDisp.idLocalizacaoDisp),"wb") as png2:
                    png2.write(base64.b64decode(str_img))
            
            return jsonify(success = True)
            

        except Exception as e:
            print(e)
            return jsonify(success = False)


@app.route ('/updateLoc', methods = ['GET','POST'])
def updateLoc():
    if request.method == 'POST':
        try:
            data = request.get_json ()
        except (KeyError, TypeError, ValueError):
            return jsonify (success = False)
        

        id_loc = data['id_loc']

        update_loc_disp = LocalizacaoDisp(idLocalizacaoDisp = id_loc)

        update_loc_disp.noEmpresa = data['companyName']   
        update_loc_disp.noLocalizacao = data['roomName']  
        update_loc_disp.vlAndar = data['floor']
        update_loc_disp.vlArea = data['area']

        if data['img'] != None:
            str_img = data['img']
            with open(os.getcwd().replace("\\","/")+"/static/setores/{}_{}.png".format(data['companyName'].replace(" ","_"), id_loc),"wb") as png2:
                png2.write(base64.b64decode(str_img))

        #STATUS NOVO
        try:
            update_loc_disp.stStatus = data['status']
        finally:
            cmd.updateLocalizacaoDisp(int(id_loc), update_loc_disp)
            #print(update_loc_disp)
            return jsonify(success = True)


@app.route ('/locInfo', methods = ['GET','POST'])
def locInfo():

    info_loc_disp = {}
    list_loc_disp = []
    all_loc_disp = cmd.selAllLocalizacaoDisps()
    for i in all_loc_disp:
        dict_loc_disp = {}
        dict_loc_disp["id_loc"] = i.idLocalizacaoDisp
        dict_loc_disp["companyName"] = i.noEmpresa
        dict_loc_disp["roomName"] = i.noLocalizacao
        dict_loc_disp["floor"] = i.vlAndar
        dict_loc_disp["area"] = i.vlArea

        #NOVO COMANDO STATUS
        dict_loc_disp["status"] = i.stStatus
        dict_loc_disp["maxOccupation"] = int(i.vlArea/2)
        list_loc_disp.append(dict_loc_disp)

    info_loc_disp["locinfo"] = list_loc_disp
    return jsonify (info_loc_disp)
        



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
        #SELECIONA A SALA QUE O DISPOSITIVO ESTÁ RELACIONADO
        loc_disp = cmd.selLocalizacaoDispByDisp(full_dict_disp['idDispositivo'], all_disp = True)
        no_loc_disp = loc_disp[-1].noLocalizacao
        dict_disp['nomeSala'] = no_loc_disp
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
  
    
    #Considerando que o id_sala será o id_dispositivo

    loc_disp = cmd.selLocalizacaoDispByDisp(id_sala, all_disp = True)
    no_empresa = loc_disp[-1].noEmpresa
    id_loc_disp = loc_disp[-1].idLocalizacao

    
    
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
        if os.path.exists(os.getcwd().replace("\\","/")+"/static/setores/{}_{}.png".format(no_empresa.replace(" ","_"), id_loc_disp)):
            img_sala = url_for("static",filename = "imagens/{}_{}.png".format(no_empresa.replace(" ","_"), id_loc_disp),_external = True)
            sala = dict( idSala = id_sala, nomeSala = room['salas'][int(id_sala)-1]['nomeSala'], imgMapaSala = img_sala ,ocupantes = lista_ocupantes)
            room['salaSelecionada'] = sala

        return room
    else:
        print("O idSala "+str(id_sala)+" não existe no banco de dados!")

#-----------RODANDO------------#
if __name__ == '__main__':
    socketio.run(app, host = '0.0.0.0', port=7000)

