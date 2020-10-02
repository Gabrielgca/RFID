from sqlalchemy.sql.functions import Function
from sqlalchemy.orm.session import make_transient

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
    
    #-----------COMANDO GABRIEL-----------#
    def selAllDispositivos(self, include_inactive = False):
        dp = self.dp
        s = self.db.session
        if include_inactive == True:
            return s.query(dp).all()
        else:
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

    #-----------COMANDO GABRIEL-----------#
    def selAllCadastroCartao(self):
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

    
    #Comando inserido em: 24/09/2020 11:41
    #Por: Gabriel de Castro Araújo
    def selnoCartao(self, noCartao):
        ct = self.ct
        s = self.db.session
        if type(noCartao) != list:
            noCartao = [noCartao]
        return s.query(ct).filter(ct.noCartao.in_(noCartao)).scalar()

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

    #Comando inserido em: 21/09/2020 14:36
    #Por: Saulo Silveira Corrêa
    def selLocalizacaoDispByDisp(self,idDispositivo, all_disp = False):
        ld = self.ld
        dl = self.dl
        s = self.db.session
        if all_disp == True:
            return s.query(ld).join(dl,ld.idLocalizacaoDisp == dl.idLocalizacaoDisp)\
                            .filter(dl.idDispositivo == idDispositivo, dl.stSituacao == 'A').all()
        else:
            return s.query(ld).join(dl,ld.idLocalizacaoDisp == dl.idLocalizacaoDisp)\
                            .filter(dl.idDispositivo == idDispositivo, dl.stSituacao == 'A').scalar()


    #Comando inserido em: 21/09/2020 10:37
    #Por: Saulo Silveira Corrêa
    def selPessoasDispositivo(self,idDispositivo):
        rt = self.rt
        cd = self.cd
        s = self.db.session
        ultRotaCadastros = []
        for cadastro in self.selAllCadastros():
            ultRotaCadastro = self.selUltRotaCadastro(cadastro.idCadastro)
            if ultRotaCadastro is not None:
                ultRotaCadastros.append(ultRotaCadastro.idRota)
        return s.query(cd).join(rt, cd.idCadastro == rt.idCadastro)\
                          .filter(rt.idRota.in_(ultRotaCadastros), rt.idDispositivo == idDispositivo)\
                          .all()

    #Comando inserido em: 21/09/2020 12:00
    #Por: Saulo Silveira Corrêa
    def selCountPessoasDispositivo(self,idDispositivo):
        rt = self.rt
        cd = self.cd
        s = self.db.session
        ultRotaCadastros = []
        for cadastro in self.selAllCadastros():
            ultRotaCadastro = self.selUltRotaCadastro(cadastro.idCadastro)
            if ultRotaCadastro is not None:
                ultRotaCadastros.append(ultRotaCadastro.idRota)
        return s.query(cd).join(rt,cd.idCadastro == rt.idCadastro)\
                          .filter(rt.idRota.in_(ultRotaCadastros), rt.idDispositivoDestino == idDispositivo)\
                          .count()

    #--------COMANDO GABRIEL--------#
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

    #Comando inserido em: 29/09/2020 13:44
    #Por: Gabriel de Castro Araújo
    def selDispLocalizacao_byid(self, idDispLocalizacao, alldisploc = False):
        dl = self.dl
        s = self.db.session
        if type(idDispLocalizacao) != list:
            idDispLocalizacao = [idDispLocalizacao]
        if alldisploc == True:
            return s.query(dl).filter(dl.idDispLocalizacao.in_(idDispLocalizacao)).scalar()
        else:
            return s.query(dl).filter(dl.idDispLocalizacao.in_(idDispLocalizacao), dl.stSituacao.in_("A")).scalar()

    def selAllPermissions (self, idCadastro):
        pud = self.pud
        s = self.db.session
        if type (idCadastro) != list:
            idCadastro = [idCadastro]
        return s.query (pud).filter (pud.idCadastro.in_(idCadastro), pud.stStatus.in_('A')).all ()

    # COMANDO RENATO
    def selAllPermCadastroLocal (self, idCadastro, idLocal):
        dl = self.dl
        pud = self.pud
        s = self.db.session

        if type (idCadastro) != list:
            idCadastro = [idCadastro]
        if type (idLocal) != list:
            idLocal = [idLocal]

        return s.query (pud).join (dl, pud.idDispLocalizacao == dl.idDispLocalizacao) \
            .filter (pud.idCadastro.in_(idCadastro), pud.idDispLocalizacao.in_(idLocal), dl.stSituacao.in_('A')).all ()
    
    
    
    
    #Comando inserido em: 22/09/2020 08:49
    #Por: Renato Reis
    def selDispLocalizacaoByDisp (self, idDispositivo):
            dl = self.dl
            s = self.db.session
            return s.query (dl).filter (dl.idDispositivo == idDispositivo, dl.stSituacao == 'A').scalar ()
				
    
    
    #-----------COMANDO GABRIEL-----------#
    def selDispLocalizacao_disp(self, idDispositivo, alldisploc = False):
        dl = self.dl
        s = self.db.session
        if type(idDispositivo) != list:
            idDispositivo = [idDispositivo]
        if alldisploc == True:
            return s.query(dl).filter(dl.idDispositivo.in_(idDispositivo)).all()
        else:
            return s.query(dl).filter(dl.idDispositivo.in_(idDispositivo), dl.stSituacao.in_("A")).all()

    #-----------COMANDO GABRIEL-----------#
    def selDispLocalizacao_disp_loc(self, idDispositivo, idLocalizacao):
        dl = self.dl
        s = self.db.session
        if type(idDispositivo) != list:
            idDispositivo = [idDispositivo]
        
        if type(idLocalizacao) != list:
            idLocalizacao = [idLocalizacao]
        return s.query(dl).filter(dl.idDispositivo.in_(idDispositivo), dl.idLocalizacaoDisp.in_(idLocalizacao)).all()


    #-----------COMANDO GABRIEL-----------#
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


    # COMANDO RENATO
    def selPermHorarioByTime (self, idPermHorario, currentTime):
        ph = self.ph
        s = self.db.session

        if type(idPermHorario) != list:
            idPermHorario = [idPermHorario]

        return s.query (ph).filter (ph.idPermHorario.in_(idPermHorario), self.db.between (currentTime, ph.hrInicial, ph.hrFinal)).all ()
    

    
    # COMANDO NOVO
    # Renato Reis, 23/09/2020
    def selPermHorarioOutOfDate (self, idPermHorario, currentDate):
        ph = self.ph
        s = self.db.session

        if type(idPermHorario) != list:
            idPermHorario = [idPermHorario]

        return s.query (ph).filter (ph.idPermHorario.in_(idPermHorario), ~(self.db.between (currentDate, ph.dtInicio, ph.dtFim)), ph.stPermanente == 'N').all ()
        
    # COMANDO MOTIFICADO
    # Renato Reis, 23/09/2020
    def selPermissaoDisp(self, idPermissao):
        pd = self.pd
        s = self.db.session

        if type(idPermissao) != list:
            idPermissao = [idPermissao]
        
        return s.query (pd).filter (pd.idPermissao.in_(idPermissao), pd.stStatus == 'A').all ()
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

    #-----------COMANDO GABRIEL-----------#
    def selCadastroCartao (self,idCadastro):
        cdct = self.cdct
        s = self.db.session
        if type(idCadastro) != list:
            idCadastro = [idCadastro]
        cadastroCartao = s.query(cdct).filter(cdct.idCadastro.in_(idCadastro)).all()
        return cadastroCartao

    
    #Comando inserido em: 24/09/2020 15:09
    #Por: Gabriel de Castro Araújo
    def selidCadastroidCartao (self,idCadastro, idCartao):
        cdct = self.cdct
        s = self.db.session
        if type(idCadastro) != list:
            idCadastro = [idCadastro]
        if type(idCartao) != list:
            idCartao = [idCartao]
        cadastroCartao = s.query(cdct).filter(cdct.idCadastro.in_(idCadastro), cdct.idCartao.in_(idCartao)).all()
        return cadastroCartao

     #-----------COMANDO GABRIEL-----------#
    def selCartao (self,idCartao):
        ct = self.ct
        s = self.db.session
        if type(idCartao) != list:
            idCartao = [idCartao]
        Cartao = s.query(ct).filter(ct.idCartao.in_(idCartao)).scalar()
        return Cartao.noCartao

    #Comando inserido em: 25/09/2020 14:51
    #Por: Gabriel de Castro Araújo
    def selPermUsuDisp (self,idCadastro):
        pud = self.pud
        s = self.db.session
        if type(idCadastro) != list:
            idCadastro = [idCadastro]
        return s.query(pud).filter(pud.idCadastro.in_(idCadastro)).all()

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
             - self.selSaidas(idDispositivo=idDispositivo,
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

    #Comando alterado em: 24/09/2020 14:57
	#Por: Saulo Silveira Corrêa
    def selUltRotaCadastro(self,idCadastro):
        rt = self.rt
        s = self.db.session
        desc = self.db.desc
        return s.query(rt)\
                .filter(rt.idCadastro == idCadastro)\
                .order_by(desc(rt.idRota), desc(self.mysql_func.timestamp(rt.dtRota,rt.hrRota)))\
                .limit(1).scalar()

    #Comando inserido em: 24/09/2020 15:33
    #Por: Saulo Silveira Corrêa
    def selUltOcupacaoDisp(self,idDispositivo):
        dl = self.dl
        ocp = self.ocp
        desc = self.db.desc
        return s.query(ocp)\
                .join(dl,ocp.idDispLocalizacao == dl.idDispLocalizacao)\
                .filter(dl.idDispositivo == idDispositivo)\
                .order_by(desc(ocp.idOcupacao), desc(self.mysql_func.timestamp(ocp.dtOcupacao,ocp.hrOcupacao)))\
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

    #Comando inserido em: 24/09/2020 11:41
    #Por: Gabriel de Castro Araújo
    def insertCadastroCartao_byid(self,cadastroCartao, refresh=False):
        s = self.db.session
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
        s = self.db.session
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
    
    #Comando alterado em: 24/09/2020 15:45
    #Por: Saulo Silveira Corrêa	
    def insertOcorrencia(self, ocorrencia, refresh=False, expunge=False, transient=False):
        s = self.db.session
        s.add(ocorrencia)
        s.commit()
        if refresh:
            s.refresh(ocorrencia)
        if expunge:
            s.expunge(ocorrencia)
        if transient:
            make_transient(ocorrencia)

    #Comando alterado em: 24/09/2020 16:12
    def insertRota(self, rota, refresh=False, expunge=False, transient=False):
        s = self.db.session
        s.add(rota)
        s.commit()
        if refresh:
            s.refresh(rota)
        if expunge:
            s.expunge(rota)
        if transient:
            make_transient(rota)

    #Comando inserido em: 22/09/2020 17:03
    #Por: Saulo Silveira Corrêa
    def insertOcupacao(self, ocupacao, refresh=False, expunge=False, transient=False):
        s = self.db.session
        s.add(ocupacao)
        s.commit()
        if refresh:
            s.refresh(ocupacao)
        if expunge:
            s.expunge(ocupacao)
        if transient:
            make_transient(ocupacao)

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


    def updateCadastroImg_loc(self, idLocalizacaoDisp, imgUrl):
        s = self.db.session
        ld = self.ld
        LocalizacaoDispUpdt = s.query(ld)\
                        .filter(ld.idLocalizacaoDisp == idLocalizacaoDisp)\
                        .scalar()
        s.add(LocalizacaoDispUpdt)
        LocalizacaoDispUpdt.edArquivoImagem = imgUrl
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
    
    #Comando inserido em: 25/09/2020 11:39
    #Por: Gabriel de Castro Araújo
    def updatestStatusPermUsuDisp(self, idPermUsuDisp, newStatus):
        s = self.db.session
        pud = self.pud
        PermUsuDispUpdt = s.query(pud)\
                                .filter(pud.idPermUsuDisp == idPermUsuDisp)\
                                .scalar()
        s.add(PermUsuDispUpdt)
        PermUsuDispUpdt.stStatus = newStatus
        s.commit()

    #Comando inserido em: 29/09/2020 15:01
    #Por: Gabriel de Castro Araújo
    def updatePermHorarioPermUsuDisp(self, idPermUsuDisp , newPermHorario):
        s = self.db.session
        pud = self.pud
        PermUsuDispUpdt = s.query(pud)\
                               .filter(pud.idPermUsuDisp == idPermUsuDisp)\
                               .scalar()
        s.add(PermUsuDispUpdt)
        PermUsuDispUpdt.idPermHorario = newPermHorario
        s.commit()
    #Comando inserido em: 28/09/2020 10:25
    #Por: Gabriel de Castro Araújo
    def updateStatusDisp(self, idDispositivo, newStatus):
        s = self.db.session
        dp = self.dp
        DispUpdt = s.query(dp)\
                                .filter(dp.idDispositivo == idDispositivo)\
                                .scalar()
        s.add(DispUpdt)
        DispUpdt.stAtivo = newStatus
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