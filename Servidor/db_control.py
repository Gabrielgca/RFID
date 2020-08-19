import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine,ForeignKey
from sqlalchemy import Column,Integer,Boolean,SmallInteger,Numeric,String,Date,DateTime,Time,TIMESTAMP
from sqlalchemy import between,func,text,asc,desc,case
from sqlalchemy.orm import sessionmaker,relationship,aliased
from sqlalchemy.sql.functions import Function
from sqlalchemy.exc import SQLAlchemyError
from contextlib import contextmanager

#Criando objeto de controle do banco de dados
class DbControl: 
	def __init__(self,engine = None,session = None):
		self.engine = engine
		self.session = session

	def initSession (self):
		self.Session = sessionmaker()
		self.Session.configure(bind = self.engine)

	@contextmanager
	def sessionQueryScope (self):
		self.session = self.Session()
		try:
			yield self.session
		except:
			self.session.rollback()
			raise
		finally:
			self.session.close()

	@contextmanager
	def sessionTransactionScope (self,refresh = None):
		self.session = self.Session()
		try:
			yield self.session
			self.session.commit()
			if refresh is not None:
				self.session.refresh(refresh)
		except:
			self.session.rollback()
			raise
		finally:
			self.session.close()

	def dbConnTest (self):
		try:
			conn = self.engine.connect()
		except SQLAlchemyError as err:
			raise Exception('Erro ao se conectar com o banco de dados!')

	def dbInit(self,url):
		self.engine = create_engine('mysql+mysqlconnector://'+url)
		self.dbConnTest()
		self.initSession()