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

    def selectAllDisps(self):
        dp = self.dp
        return self.session.query(dp,dp.idDispositivo,dp.noDispositivo)

def generateNomes (nomes,sobrenomes):
    i = 0
    for x in nnoArr:
        for y in snoArr:
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

def generateCadastros (nomes,cards,qtde):
    cadastros = []
    for i in range(0,qtde):
        currRand = random.randint(qtde - i)
        nnoUsua = nomes[currRand][0]
        snoUsua = nomes[currRand][1]
        nomes = np.delete(nomes,currRand,0)
        cardUsua = cards[currRand]
        cards = np.delete(cards,currRand)
        cadastro = Cadastro(noUsuario = str(nnoUsua)+' '+str(snoUsua),
                            cdCartao = str(cardUsua))
        cadastros.append(cadastro)
    return cadastros

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

cards = generateCards(8,200)

cadastros = generateCadastros(nomesArr,cards,200)

ins.insereCadastros(cadastros)

#print(nnoArr)

#print(snoArr)



"""
res = ins.selectAllDisps()
#print(vars(res[0]))
dictList = {}
dictList['Dispositivos'] = []
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
                    newDict[key] = objDict[key]
                i += 1
                dictList['Dispositivos'].append(newDict)
            else:
                z = 0
                for dicti in res.column_descriptions:       
                    if z == i:
                        newDict[dicti['name']] = col
                        i += 1
                        dictList['Dispositivos'].append(newDict)
                    z += 1
    else:
        newDict = {}
        #print(type(row))
        if (issubclass(type(row),Base)):
            #print(row.getDict())
            #print("Objeto detectado")
            objDict = row.getDict()
            for key in row.getDict():           
                newDict[key] = objDict[key]
            i += 1
            dictList['Dispositivos'].append(newDict)
        else:
            z = 0
            for dicti in res.column_descriptions:
                if z == i:       
                    newDict[dicti['name']] = row[i]
                    i += 1
                    dictList['Dispositivos'].append(newDict)
                z += 1
#print(dictList)

js = json.dumps(dictList,indent=4,separators=(',',':'))

f = open("TesteDict2.txt","w")
f.write(js)
f.close
"""