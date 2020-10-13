from db_control import *

Base = declarative_base()

class Dispositivo (Base):
    __tablename__ = "tb_dispositivo"
    idDispositivo = Column("id_dispositivo",Integer, nullable=False,primary_key=True)
    noDispositivo = Column("no_dispositivo",String(15), nullable=False)
    noLocalizacao = Column("no_localizacao",String(45), nullable=False)
    vlAndar = Column("vl_andar",Integer, nullable=False)
    stAtivo = Column("st_ativo",String(1), nullable=False, default='A')

    def __repr__ (self):
        return """<Dispositivo
    (id_cadastro='%d',
     no_dispositivo='%s',
     no_localizacao='%s',
     vl_andar='%d',
     st_ativo='%s')>""" % (self.idDispositivo, self.noDispositivo, 
                           self.noLocalizacao, self.vlAndar, 
                           self.stAtivo)

    def getDict (self):
        self.dictionary = {}
        self.dictionary['idDispositivo'] = self.idDispositivo
        self.dictionary['noDispositivo'] = self.noDispositivo
        self.dictionary['noLocalizacao'] = self.noLocalizacao
        self.dictionary['vlAndar'] = self.vlAndar
        self.dictionary['stAtivo'] = self.stAtivo
        return self.dictionary

class Cadastro (Base):
    __tablename__ = "tb_cadastro"
    idCadastro = Column("id_cadastro",Integer, nullable=False, primary_key=True)
    noUsuario = Column("no_usuario",String(45), nullable=False)

    def __repr__(self):
        return """<Cadastro
    (id_cadastro='%d',
     no_usuario='%s')>""" % (self.idCadastro, self.noUsuario)

    def getDict(self):
        self.dictionary = {}
        self.dictionary['idCadastro'] = self.idCadastro
        self.dictionary['noUsuario'] = self.noUsuario

class Cartao(Base):
    __tablename__ = "tb_cartao"
    idCartao = Column("id_cartao",Integer,nullable=False,primary_key=True)
    noCartao = Column("no_cartao",String(10),nullable=False)
    def __repr__(self):
        return """<Cartao
    (id_cartao='%d',
     no_cartao='%s')>""" % (self.idCartao, self.noCartao)

    def getDict(self):
        self.dictionary = {}
        self.dictionary['idCartao'] = self.idCartao
        self.dictionary['noCartao'] = self.noCartao

class CadastroCartao(Base):
    __tablename__ = "tb_cadastro_cartao"
    idCadastroCartao = Column("id_cadastro_cartao",Integer,nullable=False,primary_key=True)
    idCadastro = Column("id_cadastro",Integer,ForeignKey('tb_cadastro.id_cadastro'),nullable=False)
    idCartao = Column("id_cartao",Integer,ForeignKey('tb_cartao.id_cartao'),nullable=False)
    stEstado = Column("st_estado",String(1),nullable = False,default = 'A')

    cadastro = relationship(Cadastro, back_populates = "cadastros_cartoes")
    cartao = relationship(Cartao, back_populates = "cadastros_cartoes")

    def __repr__(self):
        return """<CadastroCartao
    (id_cadastro_cartao='%d',
     id_cadastro='%d',
     id_cartao='%d',
     st_estado='%s')>""" % (self.idCadastroCartao, self.idCadastro,
                            self.idCartao,self.stEstado)

    def getDict(self):
        self.dictionary = {}
        self.dictionary['idCadastroCartao'] = self.idCadastroCartao
        self.dictionary['idCadastro'] = self.idCadastro
        self.dictionary['idCartao'] = self.idCartao

class Ocorrencia (Base):
    __tablename__ = "tb_ocorrencia"
    idOcorrencia = Column("id_ocorrencia",Integer, nullable=False, primary_key=True)
    idDispositivo = Column("id_dispositivo",Integer, ForeignKey('tb_dispositivo.id_dispositivo'),nullable=False)
    idCadastro = Column("id_cadastro",Integer, ForeignKey('tb_cadastro.id_cadastro'), nullable=False)
    dtOcorrencia = Column("dt_ocorrencia",Date,nullable=False)
    hrOcorrencia = Column("hr_ocorrencia",Time,nullable=False)
    stOcorrencia = Column("st_ocorrencia",String(1),nullable=True)

    dispositivo = relationship(Dispositivo, back_populates = "ocorrencias")
    cadastro = relationship(Cadastro, back_populates = "ocorrencias")

    def __repr__ (self):
        return """<Cadastro
        (id_ocorrencia='%d',
        id_dispositivo='%d',
        id_cadastro='%d',
        dt_ocorrencia='%s',
        hr_ocorrencia='%s',
        st_ocorrencia='%s')>""" % (self.idOcorrencia, self.idDispositivo, 
                                    self.idCadastro, self.dtOcorrencia, 
                                    self.hrOcorrencia,self.stOcorrencia)

    def getDict(self):
        self.dictionary = {}
        self.dictionary['idOcorrencia'] = self.idOcorrencia
        self.dictionary['idDispositivo'] = self.idDispositivo
        self.dictionary['idCadastro'] = self.idCadastro
        self.dictionary['dtOcorrencia'] = self.dtOcorrencia
        self.dictionary['hrOcorrencia'] = self.hrOcorrencia
        self.dictionary['stOcorrencia'] = self.stOcorrencia

Dispositivo.ocorrencias = relationship("Ocorrencia", back_populates="dispositivo")
Cadastro.ocorrencias = relationship("Ocorrencia", back_populates="cadastro")
Cadastro.cadastros_cartoes = relationship("CadastroCartao", back_populates="cadastro")
Cartao.cadastros_cartoes = relationship("CadastroCartao", back_populates="cartao")