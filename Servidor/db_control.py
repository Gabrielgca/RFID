#BIBLIOTECA - db_control.py
#   Objetivo: realizar o controle da comunicação com banco de dados MySql
#             usando o orm SQLAlchemy
#   Importa: SQLAlchemy

#Importando o SQLAlchemy e os objetos necessários
import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine,ForeignKey
from sqlalchemy import Column,Integer,Numeric,String,Date,Time,TIMESTAMP
from sqlalchemy import between,func,text,asc,desc,case
from sqlalchemy.orm import sessionmaker,relationship,aliased
from sqlalchemy.sql.functions import Function

#Criando objeto de controle do banco de dados
class DbControl:          
    def __init__(self,engine = None,session = None):
        self.engine = engine
        self.session = session

    def startSession (self):
        Session = sessionmaker()
        Session.configure(bind = self.engine)
        self.session = Session()
        
    def dbInit(self,url):
        self.engine = create_engine("mysql+mysqlconnector://"+url)
        self.startSession()
        
    

    
                   
                   
