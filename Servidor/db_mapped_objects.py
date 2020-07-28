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
    cdCartao = Column("cd_cartao",String(25), nullable=False)

class Ocorrencia (Base):
    __tablename__ = "tb_ocorrencia"
    idOcorrencia = Column("id_ocorrencia",Integer, nullable=False, primary_key=True)
    idDispositivo = Column("id_dispositivo",Integer, ForeignKey('tb_dispositivo.id_dispositivo'),nullable=False)
    idCadastro = Column("id_cadastro",Integer, ForeignKey('tb_cadastro.id_cadastro'), nullable=False)
    dtOcorrencia = Column("dt_ocorrencia",Date,nullable=False)
    hrOcorrencia = Column("hr_ocorrencia",Time,nullable=False)
    stOcorrencia = Column("st_ocorrencia",String(1),nullable=False)

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

Dispositivo.ocorrencias = relationship("Ocorrencia", back_populates="dispositivo")
Cadastro.ocorrencias = relationship("Ocorrencia", back_populates="cadastro")