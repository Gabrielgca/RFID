from db_mapped_objects import *
from db_mapped_aux_objects import *
import numpy as np
from numpy import random
import json

#Banco de Nomes
nomes = [[]]
#Criando objetos de suporte internos

class MySqlFunc:
    def timediff(self,col1,col2):
        return Function("TIMEDIFF",col1,col2)
    def addtime (self,col,add):
        return Function("ADDTIME",col,add)
    def timestamp (self,col1,col2):
        return Function("TIMESTAMP",col1,col2)
    def date_format(self,col,formatation):
        return Function("DATE_FORMAT",col,formatation)
    def time_format(self,col,formatation):
        return Function("TIME_FORMAT",col,formatation)
    def converte_mes(self,col):
        return Function("CONVERTE_MES",self.date_format(col,"%m"))
mysql_func = MySqlFunc()

class CarregaDadosAux():
    def __init__ (self,parent = None):
        self.parent = parent
        self.session = parent.session
        self.nno = aliased(Nomes,name="nno")
        self.sno = aliased(Sobrenomes,name="sno")

    def selectNomes (self):
        nno = self.nno
        return self.session.query(nno.noNome).all()

    def selectSobrenomes (self):
        sno = self.sno
        return self.session.query(sno.noSobrenome).all()

class InsereDados():
    def __init__ (self,parent = None):
        self.parent = parent
        self.session = parent.session
        self.dp = aliased(Dispositivo,name="dp")
        self.cd = aliased(Cadastro,name="cd")
        self.ct = aliased(Cartao,name="ct")
        self.cdct = aliased(CadastroCartao,name="cdct")
        self.oc = aliased(Ocorrencia,name="oc")

    def insertDispositivos (self):
        newDisp1 = Dispositivo(noDispositivo = "ttn1",
                               noLocalizacao = "IBTI - Sala Principal",
                               vlAndar = 1)
        newDisp2 = Dispositivo(noDispositivo = "ttn2",
                               noLocalizacao = "IBTI - Sala da Administração",
                               vlAndar = 1)
        newDisp3 = Dispositivo(noDispositivo = "wifi1",
                               noLocalizacao = "IBTI - Sala de Reuniões",
                               vlAndar = 1)
        self.session.add(newDisp1)
        self.session.add(newDisp2)
        self.session.add(newDisp3)

        self.session.commit()

    def insereCadastros (self,cadastros):
        for cadastro in cadastros:
            self.session.add(cadastro)
        self.session.commit()

    def insereCartoes (self,cartoes):
        for cartao in cartoes:
            self.session.add(cartao)
        self.session.commit()

    def insereCadastrosCartoes(self,cadastrosCartoes):
        for cadastroCartao in cadastrosCartoes:
            newCadastroCartao = CadastroCartao(idCadastro = int(cadastroCartao[0]),
                                               idCartao = int(cadastroCartao[1]),
                                               stEstado = 'A')
            self.session.add(newCadastroCartao)
        self.session.commit()

    def selectAllDisps(self):
        dp = self.dp
        return self.session.query(dp,dp.idDispositivo,dp.noDispositivo)
    
    def selectAllCadastrosIds(self):
        cd = self.cd
        return self.session.query(cd.idCadastro)\
                           .order_by(asc(cd.idCadastro)).all()

    def selectAllCartoesIds(self):
        ct = self.ct
        return self.session.query(ct.idCartao)\
                           .order_by(asc(ct.idCartao)).all()
                           

def generateNomes (nomes,sobrenomes):
    i = 0
    for x in nomes:
        for y in sobrenomes:
            nomeCompleto = np.array([x,y])
            #print(nome)
            if i < 1:
                nomeArr = nomeCompleto
            else:
                nomeArr = np.concatenate((nomeArr,nomeCompleto))
            i += 1
    nomeArr = nomeArr.reshape(len(nomes) * len(sobrenomes),2)
    return nomeArr

def generateCards (qtdeDigitos,qtdeRegistros):
    cards = []
    hexArr = np.array(['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'])
    for i in range(0,qtdeRegistros):
        hexStr = ''
        for z in range(0,qtdeDigitos):
            hexStr = hexStr + random.choice(hexArr)
        if hexStr not in cards:
            cards.append(hexStr)
        else:
            i -= 1
    return cards

def generateCadastros (nomes,qtde):
    cadastros = []
    for i in range(0,qtde):
        currRand = random.randint(qtde - i)
        nnoUsua = nomes[currRand][0]
        snoUsua = nomes[currRand][1]
        nomes = np.delete(nomes,currRand,0)
        cadastro = Cadastro(noUsuario = str(nnoUsua)+' '+str(snoUsua))
        cadastros.append(cadastro)
    return cadastros

def generateCartoes(cards,qtde):
    cartoes = []
    for i in range(0,qtde):
        currRand = random.randint(qtde - i)
        card = cards[currRand]
        cards = np.delete(cards,currRand)
        cartao = Cartao(noCartao = card) 
        cartoes.append(cartao)
    return cartoes

def generateCadastroCartaoArr(qtde,cadastrosIds,cartoesIds):
    cartoesIds = np.array(cartoesIds)
    cartoesIds = cartoesIds.reshape(-1)
    cadastrosIds = np.array(cadastrosIds)
    cadastrosIds = cadastrosIds.reshape(-1)
    i = 0

    for cadastroId in cadastrosIds:
        randCartaoId = np.random.choice(cartoesIds)
        newArray = np.array([cadastroId,randCartaoId])
        if i < 1:
            cadastrosCartoes = newArray
            cartoesIds = np.delete(cartoesIds,np.where(cartoesIds == randCartaoId))
        else:
            cadastrosCartoes = np.concatenate((cadastrosCartoes,newArray))
            cartoesIds = np.delete(cartoesIds,np.where(cartoesIds == randCartaoId))
        i += 1
    cadastrosCartoes = cadastrosCartoes.reshape(qtde,2)
    return cadastrosCartoes

dbRfid = DbControl()

dbRfid.dbInit("root:@localhost/db_rfid")

ins = InsereDados(dbRfid)

dbAux = DbControl()

dbAux.dbInit("root:@localhost/db_auxiliar")

sel = CarregaDadosAux(dbAux)

ins.insertDispositivos()

nomes = sel.selectNomes()
sobrenomes = sel.selectSobrenomes()

nnoArr = np.array(nomes)

snoArr = np.array(sobrenomes)

nnoArr = nnoArr.reshape(-1)

snoArr = snoArr.reshape(-1)

nomesArr = generateNomes(nnoArr,snoArr)

cardsArr = generateCards(8,200)

cadastros = generateCadastros(nomesArr,200)

ins.insereCadastros(cadastros)

cartoes = generateCartoes(cardsArr,200)

ins.insereCartoes(cartoes)

cadastrosId = ins.selectAllCadastrosIds()

cartoesId = ins.selectAllCartoesIds()

cadastrosCartoes = generateCadastroCartaoArr(200,cadastrosId,cartoesId)

ins.insereCadastrosCartoes(cadastrosCartoes)
#print(nnoArr)

#print(snoArr)
'''
res = ins.selectAllDisps()
#print(vars(res[0]))
dicti = {}
dictHeader = 'Dispositivos'
arr = np.array(res.all())
print(arr.ndim)
for dit in res.column_descriptions:
    print(dit['name'])

for row in res:
    i = 0
    if arr.ndim > 1:
        for col in row:
            newDict = {}
            #print(type(col))
            if (issubclass(type(col),Base)):
                #print(col.getDict())
                #print("Objeto detectado")
                objDict = col.getDict()
                for key in col.getDict():           
                    dicti[dictHeader][key] = objDict[key]
                i += 1
            else:
                z = 0
                for dicti in res.column_descriptions:       
                    if z == i:
                        dicti[dictHeader][dicti['name']] = col
                        i += 1
                    z += 1
    else:
        newDict = {}
        #print(type(row))
        if (issubclass(type(row),Base)):
            #print(row.getDict())
            #print("Objeto detectado")
            objDict = row.getDict()
            for key in row.getDict():           
                dicti[dictHeader][key] = objDict[key]
            i += 1
        else:
            z = 0
            for dictio in res.column_descriptions:
                if z == i:       
                    dicti[dictHeader][dictio['name']] = row[i]
                    i += 1
                z += 1
#print(dicti)

js = json.dumps(dicti,indent=4,separators=(',',':'))

f = open("TesteDict2.txt","w")
f.write(js)
f.close
'''