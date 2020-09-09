from sqlalchemy.sql.functions import Function

#Repositório contendo os comandos SQLAlchemy do sistema RFID.
class RfidCommands():
    #Criando objetos de suporte internos
    class MySqlFunc:
        def __init__(self,database=None):
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

    def __init__(self,database=None):
        from serverRFID_V2_Experimental import Cadastro, Cartao, Dispositivo, Rota, Ocorrencia, CadastroCartao, LocalizacaoDisp, DispLocalizacao
        self.db = database
        self.cd = self.db.aliased(Cadastro, name='CD')
        self.ct = self.db.aliased(Cartao, name='CT')
        self.dp = self.db.aliased(Dispositivo, name='DP')
        self.oc = self.db.aliased(Ocorrencia, name='OC')
        self.cdct = self.db.aliased(CadastroCartao, name='CDCT')
        self.rt = self.db.aliased(Rota, name='RT')
        self.ld = self.db.aliased(LocalizacaoDisp, name='LD')
        self.dl = self.db.aliased(DispLocalizacao, name='DL')
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

    def selCountEntradas(self,idDispositivo=None,idCadastro=None):
        oc = self.oc
        s = self.db.session
        if idDispositivo is not None and idCadastro is None:
            return s.query(oc)\
                    .filter(oc.idDispositivo == idDispositivo,
                            oc.stOcorrencia == 'E')\
                    .count()
        elif idCadastro is not None and idDispositivo is None:
            return s.query(oc)\
                    .filter(oc.idCadastro == idCadastro,
                            oc.stOcorrencia == 'E')\
                    .count()
        elif idDispositivo is not None and idCadastro is not None:
            return s.query(oc)\
                    .filter(oc.idCadastro == idCadastro,
                            oc.idDispositivo == idDispositivo,
                            oc.stOcorrencia == 'E')\
                    .count()
        return None
    
    def selListEntradas(self,idDispositivo=None, idCadastro=None):
        oc = self.oc
        s = self.db.session
        if idDispositivo is not None and idCadastro is None:
            return s.query(oc)\
                    .filter(oc.idDispositivo == idDispositivo,
                            oc.stOcorrencia == 'E')\
                    .all()
        elif idCadastro is not None and idDispositivo is None:
            return s.query(oc)\
                    .filter(oc.idCadastro == idCadastro,
                            oc.stOcorrencia == 'E')\
                    .all()
        elif idDispositivo is not None and idCadastro is not None:
            return s.query(oc)\
                    .filter(oc.idCadastro == idCadastro,
                            oc.idDispositivo == idDispositivo,
                            oc.stOcorrencia == 'E')\
                    .all()
        return None
    
    def selEntradas(self,idDispositivo=None,idCadastro=None,count=False):
        if count:
            return self.selCountEntradas(idDispositivo=idDispositivo,
                                         idCadastro=idCadastro)
        else:
            return self.selListEntradas(idDispositivo=idDispositivo,
                                        idCadastro=idCadastro)

    def selCountSaidas(self,idDispositivo=None, idCadastro=None):
        oc = self.oc
        s = self.db.session
        if idDispositivo is not None and idCadastro is None:
            return s.query(oc)\
                    .filter(oc.idDispositivo == idDispositivo,
                            oc.stOcorrencia == 'S')\
                    .count()
        elif idCadastro is not None and idDispositivo is None:
            return s.query(oc)\
                    .filter(oc.idCadastro == idCadastro,
                            oc.stOcorrencia == 'S')\
                    .count()
        elif idDispositivo is not None and idCadastro is not None:
            return s.query(oc)\
                    .filter(oc.idCadastro == idCadastro,
                            oc.idDispositivo == idDispositivo,
                            oc.stOcorrencia == 'S')\
                    .count()
        return None

    def selListSaidas(self, idDispositivo=None, idCadastro=None):
        oc = self.oc
        s = self.db.session
        if idDispositivo is not None and idCadastro is None:
            return s.query(oc)\
                    .filter(oc.idDispositivo == idDispositivo,
                            oc.stOcorrencia == 'S')\
                    .all()
        elif idCadastro is not None and idDispositivo is None:
            return s.query(oc)\
                    .filter(oc.idCadastro == idCadastro,
                            oc.stOcorrencia == 'S')\
                    .all()
        elif idDispositivo is not None and idCadastro is not None:
            return s.query(oc)\
                    .filter(oc.idCadastro == idCadastro,
                            oc.idDispositivo == idDispositivo,
                            oc.stOcorrencia == 'S')\
                    .all()
        return None    

    def selSaidas(self,idDispositivo=None,idCadastro=None,count=False):
        if count:
            return self.selCountSaidas(idDispositivo=idDispositivo,
                                       idCadastro=idCadastro)
        else:
            return self.selListSaidas(idDispositivo=idDispositivo,
                                      idCadastro=idCadastro)
    
    def selCountPessoasSala(self,idDispositivo):
        return self.selEntradas(idDispositivo=idDispositivo,
                                   count = True)\
             - self.selSaidas(idDispositivo=dispositivo,
                                  count = True)

    def selUltOcorrenciaCadastro(self,idCadastro=None):
        cd = self.cd
        oc = self.oc
        s = self.db.session
        desc = self.db.desc
        mysql_func = self.mysql_func
        return s.query(oc)\
                .filter(oc.idCadastro == idCadastro)\
                .order_by(desc(oc.idOcorrencia),desc(mysql_func.timestamp(oc.dtOcorrencia,oc.hrOcorrencia)))\
                .limit(1).scalar()
    
    def selUltEntradaCadastro(self,idCadastro=None):
        cd = self.cd
        oc = self.oc
        s = self.db.session
        desc = self.db.desc
        mysql_func = self.mysql_func
        return s.query(oc).join(cd,cd.idCadastro == oc.idCadastro)\
                .filter(cd.idCadastro == idCadastro,
                        oc.stOcorrencia == 'E')\
                .order_by(desc(oc.idOcorrencia),desc(mysql_func.timestamp(oc.dtOcorrencia,oc.hrOcorrencia)))\
                .limit(1).scalar()

    def selUltSaidaCadastro(self,idCadastro):
        cd = self.cd
        oc = self.oc
        s = self.db.session
        desc = self.db.desc
        mysql_func = self.mysql_func
        return s.query(oc).join(cd,cd.idCadastro == oc.idCadastro)\
                .filter(cd.idCadastro == idCadastro,
                        oc.stOcorrencia == 'S')\
                .order_by(desc(oc.idOcorrencia),desc(mysql_func.timestamp(oc.dtOcorrencia,oc.hrOcorrencia)))\
                .limit(1).scalar()

    def selPresenca(self,idCadastro):
        oc = self.oc
        ultOcorrencia = self.selUltSaidaCadastro(idCadastro=idCadastro)
        s = self.db.session
        if ultOcorrencia is not None:
            return s.query(oc)\
                    .filter(oc.stOcorrencia == 'E',
                            oc.idCadastro == idCadastro,
                            oc.idOcorrencia > ultOcorrencia.idOcorrencia)\
                    .count()
        else:
            ultOcorrencia = self.selUltEntradaCadastro(idCadastro=idCadastro)
            if ultOcorrencia is not None:
                return 1
            else:
                return 0

    def selPessoasSala(self,idDispositivo):
        oc = self.oc
        cd = self.cd
        presencaList = []
        s = self.db.session
        for cadastro in self.selAllCadastros():
            if self.selPresenca(cadastro.idCadastro) > 0:
                ocorrencia = self.selUltEntradaCadastro(idCadastro=cadastro.idCadastro)
                if ocorrencia.idDispositivo == idDispositivo:
                    presencaList.append(cadastro)
        return presencaList

    #COMANDO NOVO!
    def selUltRotaCadastro(self,idCadastro):
        rt = self.rt
        s = self.db.session
        desc = self.db.desc
        return s.query(rt)\
                .filter(rt.idCadastro == idCadastro)\
                .order_by(desc(rt.idRotas))\
                .limit(1).scalar()
                          
    def insertCadastro(self,cadastro,refresh=False):
        s = self.db.session
        s.add(cadastro)
        s.commit()
        if refresh:
            s.refresh(cadastro)

    def insertCartao(self,cartao,refresh=False):
        s = self.db.session
        s.add(cartao)
        s.commit()
        if refresh:
            s.refresh(cartao)
    
    def insertCadastroCartao(self,cadastroCartao,cadastro,cartao,refresh=False):
        s = self.db.session
        cadastroCartao.cadastro = cadastro
        cadastroCartao.cartao = cartao
        s.add(cadastroCartao)
        s.commit()
        if refresh:
            s.refresh(cadastroCartao)

    def insertOcorrencia(self,ocorrencia,refresh=False):
        s = self.db.session
        s.add(ocorrencia)
        s.commit()
        if refresh:
            s.refresh(ocorrencia)

    #COMANDO NOVO!
    def insertRota(self,rota,refresh=False):
        s = self.db.session
        s.add(rota)
        s.commit()
        if refresh:
            s.refresh(rota)

    #COMANDO NOVO!
    def insertDispositivo(self,dispositivo,refresh=False):
        s = self.db.session
        s.add(dispositivo)
        s.commit()
        if refresh:
            s.refresh(dispositivo)

    #COMANDO NOVO!
    def insertLocalizacaoDisp(self,localizacaoDisp,refresh=False):
        s = self.db.session
        s.add(localizacaoDisp)
        s.commit()
        if refresh:
            s.refresh(localizacaoDisp)

    #COMANDO NOVO!
    def insertDispLocalizacao(self,dispLocalizacao,dispositivo,localizacaoDisp,refresh=False):
        s = self.db.session
        dispLocalizacao.dispositivo = dispositivo
        dispLocalizacao.localizacaoDisp = localizacaoDisp
        s.add(dispLocalizacao)
        s.commit()
        if refresh:
            s.refresh(dispLocalizacao)

    #COMANDO NOVO!
    def insertPermissaoDisp(self,permissaoDisp,refresh=None):
        s = self.db.session
        s.add(permissaoDisp)
        s.commit()
        if refresh:
            s.refresh(permissaoDisp)

    #COMANDO NOVO!
    def insertPermHorario(self,permHorario,refresh=None):
        s = self.db.session
        s.add(permHorario)
        s.commit()
        if refresh:
            s.refresh()

    #COMANDO NOVO!
    def insertPermUsuDisp(self,permUsuDisp,permissaoDisp,dispLocalizacao,permHorario=None,refresh=None):
        s = self.db.session
        permUsuDisp.permissaoDisp = permissaoDisp
        permUsuDisp.dispLocalizacao = dispLocalizacao
        permUsuDisp.permHorario = permHorario
        s.add(permUsuDisp)
        s.commit()
        if refresh:
            s.refresh(permUsuDisp)

    def updateCadastroImg(self, idCadastro, imgUrl):
        s = self.db.session
        cd = self.cd
        cadastroUpdt = s.query(cd)\
                        .filter(cd.idCadastro == idCadastro)\
                        .scalar()
        s.add(cadastroUpdt)
        cadastroUpdt.edArquivoImagem = imgUrl
        s.commit()

    #COMANDO NOVO!
    def updateDispositivo(self, idDispositivo, newDisp):
        s = self.db.session
        dp = self.dp
        dispositivoUpdt = s.query(dp)\
                           .filter(dp.idDispositivo == idDispositivo)\
                           .scalar()
        s.add(dispositivoUpdt)
        newDispDict = newDisp.getDict()
        for key in dispositivoUpdt.getDict():
            if newDispDict[key] is not None:
                setattr(dispositivoUpdt, key, newDispDict[key])
        s.commit()

    #COMANDO NOVO!
    def updateCadastro(self, idCadastro, newCadastro):
        s = self.db.session
        cd = self.cd
        cadastroUpdt = s.query(cd)\
                        .filter(cd.idCadastro == idCadastro)\
                        .scalar()
        newCadastroDict = newCadastro.getDict()
        for key in cadastroUpdt.getDict():
            if newCadastroDict[key] is not None:
                setattr(cadastroUpdt, key, newCadastroDict[key])
        s.commit()

    #COMANDO NOVO!
    def updateCartao(self, idCartao, newCartao):
        s = self.db.session
        ct = self.ct
        cartaoUpdt = s.query(ct)\
                      .filter(ct.idCartao == idCartao)\
                      .scalar()
        newCartaoDict = newCartao.getDict()
        for key in cartaoUpdt.getDict():
            if newCartaoDict[key] is not None:
                setattr(cartaoUpdt, key, newCartaoDict[key])
        s.commit()

    #COMANDO NOVO!
    def updateLocalizacaoDisp(self, idLocalizacaoDisp , newLocalizacaoDisp):
        s = self.db.session
        ld = self.ld
        localizacaoDispUpdt = s.query(ld)\
                               .filter(ld.idLocalizacaoDisp == idLocalizacaoDisp)\
                               .scalar()
        s.add(localizacaoDispUpdt)
        newLocalizacaoDispDict = newLocalizacaoDisp.getDict()
        for key in localizacaoDispUpdt.getDict():
            if newLocalizacaoDispDict[key] is not None:
                setattr(localizacaoDispUpdt, key, newLocalizacaoDispDict[key])
        s.commit()

    #COMANDO NOVO!
    def updateStEstadoCadastroCartao(self, idCadastroCartao, newStatus):
        s = self.db.session
        cdct = self.cdct
        cadastroCartaoUpdt = s.query(cdct)\
                              .filter(cdct.idCadastroCartao == idCadastroCartao)\
                              .scalar()
        s.add(cadastroCartaoUpdt)
        cadastroCartaoUpdt.stEstado = newStatus
        s.commit()

    #COMANDO NOVO!
    def updateStSituacaoDispLoc(self, idDispLocalizacao, newStatus):
        s = self.db.session
        dl = self.dl
        dispLocalizacaoUpdt = s.query(dl)\
                               .filter(dl.idDispLocalizacao == idDispLocalizacao)\
                               .scalar()
        s.add(dispLocalizacaoUpdt)
        dispLocalizacaoUpdt.stSituacao = newStatus
        s.commit()

    #COMANDO NOVO!
    def deleteUltRotaCadastro(self,idCadastro):
        s = self.db.session
        rt = self.rt
        ultRota = self.selUltRotaCadastro(idCadastro=idCadastro)
        if ultRota is not None:
            s.query(rt).filter(rt.idRotas == ultRota.idRotas).delete()
            s.commit()