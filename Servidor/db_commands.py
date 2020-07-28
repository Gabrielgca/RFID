#Repositório contendo os comandos SQLAlchemy para o
#sistema "Monitoramento Indoor"

from db_mapped_objects import *

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

class Commands:
    def __init__(self,parent = None):
        self.parent = parent
        self.session = parent.session
        self.dp = aliased(Dispositivo,name="D")
        self.cd = aliased(Cadastro,name="C")
        self.oc = aliased(Ocorrencia,name="O")
        self.ult24Horas = between(mysql_func.timestamp(self.oc.dtOcorrencia,self.oc.hrOcorrencia),
                                  mysql_func.timestamp(func.current_date() - 1,func.current_time()),
                                  func.current_timestamp())
        
    def selectDispositivo(self,dpName):
        dp = self.dp
        return self.session.query(dp)\
                           .filter(dp.noDispositivo == dpName)
    
    def selectCadastro(self,cdCard):
        cd = self.cd
        return self.session.query(cd)\
                           .filter(cd.cdCartao == cdCard)
    
    def insertOcorrencia(self,*cols):
        if (len(cols) != 2):
            raise Exception("Erro ao inserir nova ocorrencia. Número de argumentos é inválido!")
        cadastro = self.selectCadastro(cols[0])
        dispositivo = self.selectDispositivo(cols[1])
        novaOcorrencia = Ocorrencia(idDispositivo = dispositivo[0].idDispositivo,
                                    idCadastro = cadastro[0].idCadastro,
                                    dtOcorrencia = func.current_date(),
                                    hrOcorrencia = func.current_time())
        self.session.add(novaOcorrencia)
        self.session.commit()