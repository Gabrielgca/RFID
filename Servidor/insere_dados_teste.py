from db_mapped_objects import *
from db_mapped_aux_objects import *
import numpy as np
from numpy import random
import json
import behaviors as bh

#Banco de Nomes
nomes = [[]]
#Criando objetos de suporte internos

class MySqlFunc:
    def timediff(self,col1,col2):
        return Function("TIMEDIFF",col1,col2)
    def adddate (self,col,add):
        return Function("ADDDATE",col,add)
    def addtime (self,col,add):
        return Function("ADDTIME",col,add)
    def timestamp (self,col1,col2):
        return Function("TIMESTAMP",col1,col2)
    def date_format(self,col,formatation):
        return Function("DATE_FORMAT",col,formatation)
    def time_format(self,col,formatation):
        return Function("TIME_FORMAT",col,formatation)
    def strtodate(self,col,formatation):
        return Function("STR_TO_DATE",col,formatation)
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
        self.engine = parent.engine
        self.dp = aliased(Dispositivo,name="dp")
        self.cd = aliased(Cadastro,name="cd")
        self.ct = aliased(Cartao,name="ct")
        self.cdct = aliased(CadastroCartao,name="cdct")
        self.oc = aliased(Ocorrencia,name="oc")

    def insertDispositivos (self):
        newDisp = Dispositivo(noDispositivo = "wifi",
                              noLocalizacao = "IBTI - Sala Principal",
                              vlAndar = 1)
        self.session.add(newDisp)

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

    def insereOcorrencias (self,ocorrencias):
        for ocorrencia in ocorrencias:
            #print(type(ocorrencia))
            if ocorrencia.hrOcorrencia is not None:
                self.session.add(ocorrencia)
        self.session.commit()
    
    def selectAllDisps(self):
        dp = self.dp
        return self.session.query(dp)
    
    def selectAllCadastrosIds(self):
        cd = self.cd
        return self.session.query(cd.idCadastro)\
                           .order_by(asc(cd.idCadastro)).all()

    def selectAllCartoesIds(self):
        ct = self.ct
        return self.session.query(ct.idCartao)\
                           .order_by(asc(ct.idCartao)).all()

    def selectCadastrosCartoes(self):
        cd = self.cd
        ct = self.ct
        cdct = self.cdct
        return self.session.query(cd.noUsuario,ct.noCartao,cdct.stEstado)\
                           .join(cd,cd.idCadastro == cdct.idCadastro)\
                           .join(ct,ct.idCartao == cdct.idCartao)

    def deleteAll(self):
        self.session.query(Ocorrencia).delete()
        self.session.commit()
        self.engine.execute("ALTER TABLE {} AUTO_INCREMENT = 0".format(Ocorrencia.__tablename__))
        
        self.session.query(Dispositivo).delete()
        self.session.commit()
        self.engine.execute("ALTER TABLE {} AUTO_INCREMENT = 0".format(Dispositivo.__tablename__))
        
        self.session.query(CadastroCartao).delete()
        self.session.commit()
        self.engine.execute("ALTER TABLE {} AUTO_INCREMENT = 0".format(CadastroCartao.__tablename__))

        self.session.query(Cadastro).delete()
        self.session.commit()
        self.engine.execute("ALTER TABLE {} AUTO_INCREMENT = 0".format(Cadastro.__tablename__))
        
        self.session.query(Cartao).delete()
        self.session.commit()
        self.engine.execute("ALTER TABLE {} AUTO_INCREMENT = 0".format(Cartao.__tablename__))
    
    def gerenateOcorrencias (self, qtde):
        entarr = np.array(['13:00:00','13:10:00','13:20:00','13:30:00','13:40:00','13:50:00'])
        saiarr = np.array(['18:00:00','18:10:00','18:20:00','18:30:00','18:40:00','18:50:00'])
        if qtde % 2 == 0:
            entrada = random.randint(qtde/2, qtde)
        else:
            entrada = random.randint((qtde-1)/2,qtde)
        saida = qtde - entrada
        list_id = []
        for i in range(entrada):
            id_disp =random.randint(3)+1
            while True:
                id_cad = random.randint(200)+1
                if id_cad not in list_id:
                    break
            list_id.append(id_cad)
            hr_ent = random.randint(5)
            hr_said = random.randint(5)

            ocorr_ent = Ocorrencia (idDispositivo = id_disp,
            idCadastro = id_cad,
            dtOcorrencia = func.current_date(),
            hrOcorrencia = str(entarr[hr_ent]))

            self.session.add(ocorr_ent)
            self.session.commit()

class Funcionario ():
    def __init__(self,idCad = None,behavior = None):
        self.idCad = idCad
        self.behavior = behavior

def sortOcorrencias (ocorrencias):
    for i in range(0,len(ocorrencias)):
        if ocorrencias[i].hrOcorrencia is not None:
            for z in range(i,len(ocorrencias)):
                if ocorrencias[z] is not None:
                    if ocorrencias[i].hrOcorrencia > ocorrencias[z].hrOcorrencia:
                        oldOcorrencia = ocorrencias[i]
                        ocorrencias[i] = ocorrencias[z]
                        ocorrencias[z] = oldOcorrencia 

def setBehaviors (cadastrosIds):
    funcionarios = []
    for ids in cadastrosIds:
        for id in ids:
            funcionarios.append(Funcionario(idCad = id,
                                            behavior = bh.generateNewBehavior()))
    return funcionarios

def generateOcorrencias2(cadastrosIds,days):
    finalOcorrencias = []
    funcionarios = setBehaviors(cadastrosIds)
    for i in range(days,0,-1):
        currOcorrencias = []
        for funcionario in funcionarios:
            currDate = text("ADDDATE(CURRENT_DATE,INTERVAL "+str(-i)+" DAY)")
            hrOc = funcionario.behavior.getHrEntrada()
            if hrOc is not None:
                newOcorrencia = Ocorrencia(idDispositivo = 1,
                                            idCadastro = funcionario.idCad,
                                            dtOcorrencia = currDate,
                                            hrOcorrencia = str(hrOc),
                                            stOcorrencia = 'E')
                currOcorrencias.append(newOcorrencia)
        for funcionario in funcionarios:
            currDate = text("ADDDATE(CURRENT_DATE,INTERVAL "+str(-i)+" DAY)")
            hrOc = funcionario.behavior.getHrSaida()
            if hrOc is not None:
                newOcorrencia = Ocorrencia(idDispositivo = 1,
                                        idCadastro = funcionario.idCad,
                                        dtOcorrencia = currDate,
                                        hrOcorrencia = str(hrOc))
                currOcorrencias.append(newOcorrencia)
        sortOcorrencias(currOcorrencias)
        for currOcorrencia in currOcorrencias:
            finalOcorrencias.append(currOcorrencia)
    return finalOcorrencias
    
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
        currRand = random.randint(len(nomes) - 1)
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
    cadastrosCartoes = cadastrosCartoes.reshape(int(len(cadastrosCartoes))//2,2)
    return cadastrosCartoes

def generateDict(res,dictHeader = None):
    dicti = {}
    dicti[dictHeader] = {}
    arr = np.array(res.all())
    #print(arr.ndim)
    for dit in res.column_descriptions:
        print(dit['name'])

    for row in res:
        i = 0
        if arr.ndim > 1:
            for col in row:
                #print(type(col))
                if isinstance(type(col),type(Base)):
                    #print(col.getDict())
                    print("Objeto detectado")
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
            if isinstance(type(row),type(Base)):
                #print(row.getDict())
                print("Objeto detectado")
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
    return dicti

dbRfid = DbControl()

dbRfid.dbInit("root:@localhost/db_rfid")

ins = InsereDados(dbRfid)

dbAux = DbControl()

dbAux.dbInit("root:@localhost/db_auxiliar")

sel = CarregaDadosAux(dbAux)

ins.deleteAll()

ins.insertDispositivos()

nomes = sel.selectNomes()
sobrenomes = sel.selectSobrenomes()

nnoArr = np.array(nomes)

snoArr = np.array(sobrenomes)

nnoArr = nnoArr.reshape(-1)

snoArr = snoArr.reshape(-1)

nomesArr = generateNomes(nnoArr,snoArr)

print("Informe a quantidade de inserções de cadastro e cartões: ")
qtde = int(input())

cardsArr = generateCards(8,qtde)

cadastros = generateCadastros(nomesArr,qtde)

ins.insereCadastros(cadastros)

cartoes = generateCartoes(cardsArr,qtde)

ins.insereCartoes(cartoes)

cadastrosId = ins.selectAllCadastrosIds()

cartoesId = ins.selectAllCartoesIds()

cadastrosCartoes = generateCadastroCartaoArr(qtde,cadastrosId,cartoesId)

ins.insereCadastrosCartoes(cadastrosCartoes)

print("Informe a quantidade de dias de ocorrências a serem gerados: ")
qtdeDias = input()
ocorrencias = generateOcorrencias2(cadastrosId,int(qtdeDias))

ins.insereOcorrencias(ocorrencias)

#ins.gerenateOcorrencias(20)
#print(nnoArr)

#print(snoArr)

'''
res = ins.selectCadastrosCartoes()

#print(res)

dicti = generateDict(res,"CadastrosCartoes")

print(dicti)


#res = ins.selectAllDisps()
#print(vars(res[0]))
#print(dicti)

js = json.dumps(dicti,indent=4,separators=(',',':'))

f = open("TesteDict2.txt","w")
f.write(js)
f.close
'''