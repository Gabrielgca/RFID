from db_control import *

Base = declarative_base()

class Nomes (Base):
    __tablename__ = "tb_nomes"
    idNome = Column("id_nome",Integer,nullable=False,primary_key=True)
    noNome = Column("no_nome",String(15),nullable=False)

    def __repr__ (self):
        return """<Nomes
    (id_nome='%d',
     no_nome='%s')>""" % (self.idNome, self.noNome)

class Sobrenomes (Base):
    __tablename__ = "tb_sobrenomes"
    idSobrenome = Column("id_sobrenome",Integer,nullable=False,primary_key=True)
    noSobrenome = Column("no_sobrenome",String(15),nullable=False)

    def __repr__ (self):
        return """<Nomes
    (id_sobrenome='%d',
     no_sobrenome='%s')>""" % (self.idSobrenome, self.noSobrenome)