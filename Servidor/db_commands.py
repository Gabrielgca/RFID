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
        from serverRFID_V2_Socket import Cadastro, Cartao, Dispositivo, Rota \
                                               , Ocorrencia, CadastroCartao, LocalizacaoDisp \
                                               , DispLocalizacao, PermHorario, PermissaoDisp, PermUsuDisp
                                               
        self.db = database
        self.cd = self.db.aliased(Cadastro, name='CD')
        self.ct = self.db.aliased(Cartao, name='CT')
        self.dp = self.db.aliased(Dispositivo, name='DP')
        self.oc = self.db.aliased(Ocorrencia, name='OC')
        self.cdct = self.db.aliased(CadastroCartao, name='CDCT')
        self.rt = self.db.aliased(Rota, name='RT')
        self.ld = self.db.aliased(LocalizacaoDisp, name='LD')
        self.dl = self.db.aliased(DispLocalizacao, name='DL')
        self.ph = self.db.aliased(PermHorario, name='PH')
        self.pd = self.db.aliased(PermissaoDisp, name='PD')
        self.pud = self.db.aliased(PermUsuDisp, name='PUD')
        self.mysql_func = self.MySqlFunc(database)

    ###################
    # COMANDOS SELECT #
    ###################
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

    def selAllRotas(self):
        rt = self.rt
        s = self.db.session
        return s.query(rt).all()

    def selAllLocalizacaoDisps(self):
        ld = self.ld
        s = self.db.session
        return s.query(ld).all()

    def selAllPermHorarios(self):
        ph = self.ph
        s = self.db.session
        return s.query(ph).all()

    def selAllPermissaoDisps(self):
        pd = self.pd
        s = self.db.session
        return s.query(pd).all()

    def selDispositivo(self, idDispositivo):
        dp = self.dp
        s = self.db.session
        if type(idDispositivo) != list:
            idDispositivo = [idDispositivo]
        return s.query(dp).filter(dp.idDispositivo.in_(idDispositivo)).all()

    def selCadastro(self, idCadastro):
        cd = self.cd
        s = self.db.session
        if type(idCadastro) != list:
            idCadastro = [idCadastro]
        return s.query(cd).filter(cd.idCadastro.in_(idCadastro)).all()

    def selOcorrencia(self, idOcorrencia):
        oc = self.oc
        s = self.db.session
        if type(idOcorrencia) != list:
            idOcorrencia = [idOcorrencia]
        return s.query(cd).filter(cd.idOcorrencia.in_(idOcorrencia)).all()

    def selRota(self, idRota):
        rt = self.rt
        s = self.db.session
        if type(idRota) != list:
            idRota = [idRota]
        return s.query(rt).filter(rt.idRota.in_(idRota)).all()

    def selLocalizacaoDisp(self, idLocalizacaoDisp):
        ld = self.ld
        s = self.db.session
        if type(idLocalizacaoDisp) != list:
            idLocalizacaoDisp = [idLocalizacaoDisp]
        return s.query(ld).filter(ld.idLocalizacaoDisp.in_(idLocalizacaoDisp)).all()

    def selLocalizacaoDisp_no(self, noLocalizacao):
        ld = self.ld
        s = self.db.session
        if type(noLocalizacao) != list:
            noLocalizacao = [noLocalizacao]
        return s.query(ld).filter(ld.noLocalizacao.in_(noLocalizacao)).all()

    def selDispLocalizacao(self, idLocalizacao):
        dl = self.dl
        s = self.db.session
        if type(idLocalizacao) != list:
            idLocalizacao = [idLocalizacao]
        return s.query(dl).filter(dl.idLocalizacaoDisp.in_(idLocalizacao), dl.stSituacao.in_("A")).all()

    def selUsuDisp(self, idCadastro):
        pud = self.pud
        s = self.db.session
        if type(idCadastro) != list:
            idCadastro = [idCadastro]
        return s.query(pud).filter(pud.idCadastro.in_(idCadastro), pud.stStatus.in_("A")).all()


    def selPermHorario(self, idPermHorario):
        ph = self.ph
        s = self.db.session
        if type(idPermHorario) != list:
            idPermHorario = [idPermHorario]
        return s.query(ph).filter(ph.idPermHorario.in_(idPermHorario)).all()

    def selPermissaoDisp(self, idPermissaoDisp):
        pd = self.pd
        s = self.db.session
        if type(idPermissaoDisp) != list:
            idPermissaoDisp = [idPermissaoDisp]
        return s.query(pd).filter(pd.idPermissaoDisp.in_(idPermissaoDisp)).all()

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
    def selAllDispsAndLocDisp(self):
        dp = self.dp
        ld = self.ld
        dl = self.dl
        s = self.db.session
        return s.query(dp,ld).join(dl,dp.idDispositivo == dl.idDispositivo)\
                             .join(ld,dl.idLocalizacaoDisp == ld.idLocalizacaoDisp).scalar()

    #COMANDO NOVO!
    def selUltRotaCadastro(self,idCadastro):
        rt = self.rt
        s = self.db.session
        desc = self.db.desc
        return s.query(rt)\
                .filter(rt.idCadastro == idCadastro)\
                .order_by(desc(rt.idRota))\
                .limit(1).scalar()

    ###########################
    # FIM DOS COMANDOS SELECT #
    ###########################


    ###################
    # COMANDOS INSERT #
    ###################
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
    def insertDispLocalizacao(self,dispLocalizacao, refresh = False):

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
            s.refresh(permHorario)

    #COMANDO NOVO!
    def insertPermUsuDisp(self, permUsuDisp, refresh=None):
        s = self.db.session
        s.add(permUsuDisp)
        s.commit()
        if refresh:
            s.refresh(permUsuDisp)

    ###########################
    # FIM DOS COMANDOS INSERT #
    ###########################


    ###################
    # COMANDOS UPDATE #
    ###################
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

    ###########################
    # FIM DOS COMANDOS UPDATE #
    ###########################


    ###################
    # COMANDOS DELETE #
    ###################
    #COMANDO NOVO!
    def deleteUltRotaCadastro(self,idCadastro):
        s = self.db.session
        rt = self.rt
        ultRota = self.selUltRotaCadastro(idCadastro=idCadastro)
        if ultRota is not None:
            s.query(rt).filter(rt.idRota == ultRota.idRota).delete()
            s.commit()

    ###########################
    # FIM DOS COMANDOS DELETE #
    ###########################