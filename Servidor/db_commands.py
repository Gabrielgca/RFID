from sqlalchemy.sql.functions import Function

#Repositório contendo os comandos SQLAlchemy do sistema RFID.
class RfidCommands():
    #Criando objetos de suporte internos
    class MySqlFunc:
        def __init__(self,database = None):
            self.db = database
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

    def __init__(self,database = None):
        from serverRFID import Cadastro, Cartao, Dispositivo, Ocorrencia, CadastroCartao
        self.db = database
        self.cd = self.db.aliased(Cadastro,name='CD')
        self.ct = self.db.aliased(Cartao,name='CT')
        self.dp = self.db.aliased(Dispositivo,name='DP')
        self.oc = self.db.aliased(Ocorrencia,name='OC')
        self.cdct = self.db.aliased(CadastroCartao,name='CDCT')
        self.mysql_func = self.MySqlFunc(database)

    
    def selAllDispositivos(self):
        dp = self.dp
        s = self.db.session
        return s.query(dp).filter(dp.stAtivo == 'A').all()

    def selAllCadastros(self):
        cd = self.cd
        s = self.db.session
        return s.query(cd).all()

    def selAllOcorrencias(self):
        oc = self.oc
        s = self.db.session
        return s.query(oc).all()

    def selCadastros(self,cadastros):
        cd = self.cd
        s = self.db.session
        return s.query(cd).filter(cd.idCadastro.in_(cadastros)).all()

    def selCountCartoesAtivos(self,rfid):
        ct = self.ct
        cdct = self.cdct
        s = self.db.session
        return s.query(ct).join(cdct,ct.idCartao == cdct.idCartao)\
                .filter(ct.noCartao == rfid,cdct.stEstado == 'A').count()

    def selCadastroCartaoAtivo (self,rfid):
        ct = self.ct
        cdct = self.cdct
        s = self.db.session
        cadastroCartao = s.query(cdct).join(ct,cdct.idCartao == ct.idCartao)\
                          .filter(ct.noCartao == rfid,cdct.stEstado == 'A').scalar()
        return cadastroCartao

    def selCountEntradas(self,dispositivo = None,cadastro = None):
        oc = self.oc
        s = self.db.session
        if dispositivo is not None and cadastro is None:
            return s.query(oc)\
                    .filter(oc.idDispositivo == dispositivo,
                            oc.stOcorrencia == 'E')\
                    .count()
        elif cadastro is not None and dispositivo is None:
            return s.query(oc)\
                    .filter(oc.idCadastro == cadastro,
                            oc.stOcorrencia == 'E')\
                    .count()
        elif dispositivo is not None and cadastro is not None:
            return s.query(oc)\
                    .filter(oc.idCadastro == cadastro,
                            oc.idDispositivo == dispositivo,
                            oc.stOcorrencia == 'E')\
                    .count()
        return None
    
    def selListEntradas(self,dispositivo = None, cadastro = None):
        oc = self.oc
        s = self.db.session
        if dispositivo is not None and cadastro is None:
            return s.query(oc)\
                    .filter(oc.idDispositivo == dispositivo,
                            oc.stOcorrencia == 'E')\
                    .all()
        elif cadastro is not None and dispositivo is None:
            return s.query(oc)\
                    .filter(oc.idCadastro == cadastro,
                            oc.stOcorrencia == 'E')\
                    .all()
        elif dispositivo is not None and cadastro is not None:
            return s.query(oc)\
                    .filter(oc.idCadastro == cadastro,
                            oc.idDispositivo == dispositivo,
                            oc.stOcorrencia == 'E')\
                    .all()
        return None
    
    def selEntradas(self,dispositivo = None,cadastro = None,count = False):
        if count:
            return self.selCountEntradas(dispositivo = dispositivo,
                                            cadastro = cadastro)
        else:
            return self.selListEntradas(dispositivo = dispositivo,
                                           cadastro = cadastro)

    def selCountSaidas(self,dispositivo = None, cadastro = None):
        oc = self.oc
        s = self.db.session
        if dispositivo is not None and cadastro is None:
            return s.query(oc)\
                    .filter(oc.idDispositivo == dispositivo,
                            oc.stOcorrencia == 'S')\
                    .count()
        elif cadastro is not None and dispositivo is None:
            return s.query(oc)\
                    .filter(oc.idCadastro == cadastro,
                            oc.stOcorrencia == 'S')\
                    .count()
        elif dispositivo is not None and cadastro is not None:
            return s.query(oc)\
                    .filter(oc.idCadastro == cadastro,
                            oc.idDispositivo == dispositivo,
                            oc.stOcorrencia == 'S')\
                    .count()
        return None

    def selListSaidas(self,dispositivo = None, cadastro = None):
        oc = self.oc
        s = self.db.session
        if dispositivo is not None and cadastro is None:
            return s.query(oc)\
                    .filter(oc.idDispositivo == dispositivo,
                            oc.stOcorrencia == 'S')\
                    .all()
        elif cadastro is not None and dispositivo is None:
            return s.query(oc)\
                    .filter(oc.idCadastro == cadastro,
                            oc.stOcorrencia == 'S')\
                    .all()
        elif dispositivo is not None and cadastro is not None:
            return s.query(oc)\
                    .filter(oc.idCadastro == cadastro,
                            oc.idDispositivo == dispositivo,
                            oc.stOcorrencia == 'S')\
                    .all()
        return None    

    def selSaidas(self,dispositivo = None,cadastro = None,count = False):
        if count:
            return self.selCountSaidas(dispositivo = dispositivo,
                                          cadastro = cadastro)
        else:
            return self.selListSaidas(dispositivo = dispositivo,
                                         cadastro = cadastro)
    
    def selCountPessoasSala(self,dispositivo):
        return self.selEntradas(dispositivo = dispositivo,
                                   count = True)\
             - self.selSaidas(dispositivo = dispositivo,
                                  count = True)

    def selUltOcorrenciaCadastro(self,cadastro = None):
        cd = self.cd
        oc = self.oc
        s = self.db.session
        desc = self.db.desc
        mysql_func = self.mysql_func
        return s.query(oc)\
                .filter(oc.idCadastro == cadastro)\
                .order_by(desc(oc.idOcorrencia),desc(mysql_func.timestamp(oc.dtOcorrencia,oc.hrOcorrencia)))\
                .limit(1).scalar()
    
    def selUltEntradaCadastro(self,cadastro = None):
        cd = self.cd
        oc = self.oc
        s = self.db.session
        desc = self.db.desc
        mysql_func = self.mysql_func
        return s.query(oc).join(cd,cd.idCadastro == oc.idCadastro)\
                .filter(cd.idCadastro == cadastro,
                        oc.stOcorrencia == 'E')\
                .order_by(desc(oc.idOcorrencia),desc(mysql_func.timestamp(oc.dtOcorrencia,oc.hrOcorrencia)))\
                .limit(1).scalar()

    def selUltSaidaCadastro(self,cadastro):
        cd = self.cd
        oc = self.oc
        s = self.db.session
        desc = self.db.desc
        mysql_func = self.mysql_func
        return s.query(oc).join(cd,cd.idCadastro == oc.idCadastro)\
                .filter(cd.idCadastro == cadastro,
                        oc.stOcorrencia == 'S')\
                .order_by(desc(oc.idOcorrencia),desc(mysql_func.timestamp(oc.dtOcorrencia,oc.hrOcorrencia)))\
                .limit(1).scalar()

    def selPresenca(self,cadastro):
        oc = self.oc
        ultOcorrencia = self.selUltSaidaCadastro(cadastro = cadastro)
        s = self.db.session
        if ultOcorrencia is not None:
            return s.query(oc)\
                    .filter(oc.stOcorrencia == 'E',
                            oc.idCadastro == cadastro,
                            oc.idOcorrencia > ultOcorrencia.idOcorrencia)\
                    .count()
        else:
            ultOcorrencia = self.selUltEntradaCadastro(cadastro = cadastro)
            if ultOcorrencia is not None:
                return 1
            else:
                return 0

    def selPessoasSala(self,dispositivo):
        oc = self.oc
        cd = self.cd
        presencaList = []
        s = self.db.session
        for cadastro in self.selAllCadastros():
            if self.selPresenca(cadastro.idCadastro) > 0:
                ocorrencia = self.selUltEntradaCadastro(cadastro=cadastro.idCadastro)
                if ocorrencia.idDispositivo == dispositivo:
                    presencaList.append(cadastro)
        return presencaList

    def insertCadastro(self,cadastro,refresh = False):
        s = self.db.session
        s.add(cadastro)
        s.commit()
        if refresh:
            s.refresh(cadastro)

    def insertCartao(self,cartao,refresh = False):
        s = self.db.session
        s.add(cartao)
        s.commit()
        if refresh:
            s.refresh(cartao)
    
    def insertCadastroCartao(self,cadastroCartao,cadastro,cartao,refresh = False):
        s = self.db.session
        cadastroCartao.cadastro = cadastro
        cadastroCartao.cartao = cartao
        s.add(cadastroCartao)
        s.commit()
        if refresh:
            s.refresh(cadastroCartao)

    def insertOcorrencia(self,ocorrencia,refresh = False):
        s = self.db.session
        s.add(ocorrencia)
        s.commit()
        if refresh:
            s.refresh(ocorrencia)

    def updateCadastroImg(self,cadastro,imgUrl):
        s = self.db.session
        cd = self.cd
        cadastroUpdt = s.query(cd)\
                        .filter(cd.idCadastro == cadastro)\
                        .scalar()
        s.add(cadastroUpdt)
        cadastroUpdt.edArquivoImagem = imgUrl
        s.commit()
