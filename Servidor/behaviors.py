import numpy as np

class TimeBehavior():
    def __init__(self,min_hr_entrada = None,
                      max_hr_entrada = None,min_hr_saida = None,
                      max_hr_saida=None,oddFactor = None):
        self.min_hr_entrada = min_hr_entrada
        self.max_hr_entrada = max_hr_entrada
        self.min_hr_saida = min_hr_saida
        self.max_hr_saida = max_hr_saida
        self.oddFactor = oddFactor

    def randSecs(self):
        return np.random.randint(0,60)
    
    def getHrEntrada (self):
        return np.random.randint(self.min_hr_entrada,self.max_hr_entrada)

    def getHrSaida (self):
        return np.random.randint(self.min_hr_saida,self.max_hr_saida)

class EventBehavior():
    def __init__(self,chance_faltar = None,
                      chance_chegar_cedo = None,chance_sair_cedo = None,
                      chance_chegar_tarde = None,chance_sair_tarde = None,
                      min_desvio_horario = None,max_desvio_horario = None,
                      oddFactor = None):
        self.chance_faltar = chance_faltar
        self.chance_chegar_cedo = chance_chegar_cedo
        self.chance_sair_cedo = chance_sair_cedo
        self.chance_chegar_tarde = chance_chegar_tarde
        self.chance_sair_tarde = chance_sair_tarde
        self.min_desvio_horario = min_desvio_horario
        self.max_desvio_horario = max_desvio_horario
        self.oddFactor = oddFactor

    def getFaltou (self):
        return np.random.choice([True,False],p=[self.chance_faltar/100,(100 - self.chance_faltar)/100])
    
    def getChegouCedo (self):
        return np.random.choice([True,False],p=[self.chance_chegar_cedo/100,(100 - self.chance_chegar_cedo)/100])

    def getSaiuCedo (self):
        return np.random.choice([True,False],p=[self.chance_sair_cedo/100,(100 - self.chance_sair_cedo)/100])

    def getChegouTarde (self):
        return np.random.choice([True,False],p=[self.chance_chegar_tarde/100,(100 - self.chance_chegar_tarde)/100])

    def getSaiuTarde (self):
        return np.random.choice([True,False],p=[self.chance_sair_tarde/100,(100 - self.chance_sair_tarde)/100])



class MovementBehavior():
    def __init__(self,chance_locomocao = None,oddFactor = None):
        self.chance_locomocao = chance_locomocao
        self.oddFactor = oddFactor

class Behavior():
    def __init__(self,times,events,movements):
        self.times = times
        self.events = events
        self.movements = movements
        self.faltou = False 
        self.setTimeBehavior()
        self.setEventBehavior()
        self.setMovementBehavior()

    def getProbabilities (self,behaviorList):
        pList = []
        for behavior in behaviorList:
            pList.append(behavior.oddFactor / 100)
        return pList

    def setTimeBehavior (self):
        self.timeBehavior =  np.random.choice(self.times,p=self.getProbabilities(self.times))

    def setEventBehavior (self):
        self.eventBehavior = np.random.choice(self.events,p=self.getProbabilities(self.events))

    def setMovementBehavior (self):
        self.movementBehavior = np.random.choice(self.movements,p=self.getProbabilities(self.movements))

    def getHrEntrada (self):
        self.faltou = self.eventBehavior.getFaltou()
        if self.faltou:
            return None
        else:
            hrStr = ''
            minStr = ''
            secStr = ''
            hrInt = self.timeBehavior.getHrEntrada()
            if self.eventBehavior.getChegouCedo():
                hrInt -= np.random.randint(self.eventBehavior.min_desvio_horario,self.eventBehavior.max_desvio_horario)
            elif self.eventBehavior.getChegouTarde():
                hrInt += np.random.randint(self.eventBehavior.min_desvio_horario,self.eventBehavior.max_desvio_horario)
            hrStr = str(hrInt // 100)
            hrStr = hrStr.zfill(2)
            minStr = str((hrInt % 100) * 60 // 100)
            minStr = minStr.zfill(2)
            secStr = str(self.timeBehavior.randSecs())
            secStr = secStr.zfill(2)
        return hrStr+":"+minStr+":"+secStr

    def getHrSaida (self):
        if self.faltou:
            return None
        else:
            hrStr = ''
            minStr = ''
            secStr = ''
            hrInt = self.timeBehavior.getHrSaida()
            if self.eventBehavior.getSaiuCedo():
                hrInt -= np.random.randint(self.eventBehavior.min_desvio_horario,self.eventBehavior.max_desvio_horario)
            elif self.eventBehavior.getSaiuTarde():
                hrInt += np.random.randint(self.eventBehavior.min_desvio_horario,self.eventBehavior.max_desvio_horario)
            hrStr = str(hrInt // 100)
            hrStr = hrStr.zfill(2)
            minStr = str((hrInt % 100) * 60 // 100)
            minStr = minStr.zfill(2)
            secStr = str(self.timeBehavior.randSecs())
            secStr = secStr.zfill(2)
        return hrStr+":"+minStr+":"+secStr

#TIME BEHAVIORS

#TimeBehavior: expediente completo
EXPEDIENTE_COMPLETO = TimeBehavior(min_hr_entrada = 750,
                                   max_hr_entrada = 850,
                                   min_hr_saida = 1750,
                                   max_hr_saida = 1850,
                                   oddFactor = 20)

#TimeBehavior: expediente matutino
EXPEDIENTE_MATUTINO = TimeBehavior(min_hr_entrada = 750,
                                   max_hr_entrada = 850,
                                   min_hr_saida = 1150,
                                   max_hr_saida = 1250,
                                   oddFactor = 40)

#TimeBehavior: expediente matutino
EXPEDIENTE_VESPERTINO = TimeBehavior(min_hr_entrada = 1250,
                                     max_hr_entrada = 1350,
                                     min_hr_saida = 1650,
                                     max_hr_saida = 1750,
                                     oddFactor = 40)

TIME_ARRAY = np.array([EXPEDIENTE_COMPLETO,EXPEDIENTE_MATUTINO,EXPEDIENTE_VESPERTINO])

#EVENT BEHAVIORS

#EventBehavior: sair cedo 
SAIR_CEDO = EventBehavior(chance_faltar = 5,
                          chance_chegar_cedo = 25,
                          chance_sair_cedo = 40,
                          chance_chegar_tarde = 2.5,
                          chance_sair_tarde = 2.5,
                          min_desvio_horario = 25,
                          max_desvio_horario = 50, 
                          oddFactor = 5)

#EventBehavior: chegar cedo 1
CHEGAR_CEDO = EventBehavior(chance_faltar = 5,
                            chance_chegar_cedo = 40,
                            chance_sair_cedo = 25,
                            chance_chegar_tarde = 2.5,
                            chance_sair_tarde = 2.5,
                            min_desvio_horario = 25,
                            max_desvio_horario = 50, 
                            oddFactor = 5)

#EventBehavior: sair tarde 
SAIR_TARDE = EventBehavior(chance_faltar = 5,
                           chance_chegar_cedo = 2.0,
                           chance_sair_cedo = 2.5,
                           chance_chegar_tarde = 25,
                           chance_sair_tarde = 40,
                           min_desvio_horario = 25,
                           max_desvio_horario = 50, 
                           oddFactor = 5)

#EventBehavior: chegar tarde 
CHEGAR_TARDE = EventBehavior(chance_faltar = 5,
                             chance_chegar_cedo = 2.0,
                             chance_sair_cedo = 2.5,
                             chance_chegar_tarde = 40,
                             chance_sair_tarde = 25,
                             min_desvio_horario = 25,
                             max_desvio_horario = 50, 
                             oddFactor = 5)

#EventBehavior: chegar cedo e sair cedo 
CHEGAR_CEDO_SAIR_CEDO = EventBehavior(chance_faltar = 5,
                                      chance_chegar_cedo = 40,
                                      chance_sair_cedo = 40,
                                      chance_chegar_tarde = 2.0,
                                      chance_sair_tarde = 2.0,
                                      min_desvio_horario = 25,
                                      max_desvio_horario = 50, 
                                      oddFactor = 15)

#EventBehavior: chegar tarde e sair tarde
CHEGAR_TARDE_SAIR_TARDE = EventBehavior(chance_faltar = 5,
                                        chance_chegar_cedo = 2.0,
                                        chance_sair_cedo = 2.0,
                                        chance_chegar_tarde = 40,
                                        chance_sair_tarde = 40,
                                        min_desvio_horario = 25,
                                        max_desvio_horario = 50, 
                                        oddFactor = 15)      

#EventBehavior: cumpre expediente normal
CUMPRE_EXPEDIENTE = EventBehavior(chance_faltar = 5,
                                  chance_chegar_cedo = 2.0,
                                  chance_sair_cedo = 2.0,
                                  chance_chegar_tarde = 2.0,
                                  chance_sair_tarde = 2.0,
                                  min_desvio_horario = 25,
                                  max_desvio_horario = 50, 
                                  oddFactor = 50)

EVENT_ARRAY = np.array([SAIR_CEDO,CHEGAR_CEDO,SAIR_TARDE,CHEGAR_TARDE,CHEGAR_CEDO_SAIR_CEDO,CHEGAR_TARDE_SAIR_TARDE,CUMPRE_EXPEDIENTE])

#MOVEMENT BEHAVIORS

#Movement Behavior: pouco deslocamento
POUCO_DESLOCAMENTO = MovementBehavior(chance_locomocao = 10,
                                      oddFactor = 50)

#Movement Behavior: medio deslocamento
MEDIO_DESLOCAMENTO = MovementBehavior(chance_locomocao = 30,
                                      oddFactor = 35)

#Movement Behavior: alto deslocamento
ALTO_DESLOCAMENTO = MovementBehavior(chance_locomocao = 55,
                                     oddFactor = 15)

MOVEMENT_ARRAY = np.array([POUCO_DESLOCAMENTO,MEDIO_DESLOCAMENTO,ALTO_DESLOCAMENTO])

#newBehavior = Behavior(TIME_ARRAY,EVENT_ARRAY,MOVEMENT_ARRAY)

'''
print(newBehavior.timeBehavior.getHrEntrada())
print(newBehavior.timeBehavior.getHrSaida()) 


print(newBehavior.eventBehavior.getFaltou())
print(newBehavior.eventBehavior.getChegouCedo())
print(newBehavior.eventBehavior.getSaiuCedo())
print(newBehavior.eventBehavior.getChegouTarde())
print(newBehavior.eventBehavior.getSaiuTarde())
'''

def generateNewBehavior():
    global TIME_ARRAY
    global EVENT_ARRAY
    global MOVEMENT_ARRAY

    return Behavior(TIME_ARRAY,EVENT_ARRAY,MOVEMENT_ARRAY)