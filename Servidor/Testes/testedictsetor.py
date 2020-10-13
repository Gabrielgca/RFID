#testetempo
from db_mapped_objects import *
from db_mapped_aux_objects import *
import numpy as np
from numpy import random
import json
import ttn
from flask import Flask, jsonify, request
import base64
#from flask_ngrok import run_with_ngrok

#Instância para controle do banco de dados
dbRfid = DbControl()
#Instância para inserir dados no banco

dbRfid.dbInit("root:@localhost/db_rfid")
id_disp = []
no_disp = []
local = []
dispositivo = []
t_pess = 0

for i in dbRfid.session.query(Dispositivo):
    dict_disp = i.getDict()
    for j in dbRfid.session.query(Ocorrencia):
        if i.idDispositivo == j.idDispositivo:
            if j.stOcorrencia == 'E':
                t_pess += 1
            if j.stOcorrencia == 'S':
                t_pess -= 1
        dict_disp["toPessoas"] = t_pess
        
    t_pess = 0
    dispositivo.append(dict_disp)
for i in dbRfid.session.query(Dispositivo):
    id_disp.append(i.idDispositivo)
    no_disp.append(i.noDispositivo)
    local.append (i.noLocalizacao)
#for i in dbRfid.session.query(Ocorrencia):
    
print(id_disp)
print(no_disp)
print(local)
print(dispositivo)
    




