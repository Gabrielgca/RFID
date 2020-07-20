---------------------------------
### Situação Atual 
---------------------------------
Deixo aqui minhas observações sobre o que foi feito até agora no projeto RFID referente ao dispositivo.

Como o Marcos falou, o dispositivo LoRa está completo. No projeto, é feito a leitura da tag/cartão RFID e enviado para o servidor da The Things Network (TTN). Cada chip RFID tem seu número de identificação único. Este número é lido e enviado para a TTN na base hexadecimal. Na TTN não existe nenhuma decodificação da mensagem (pacote).


Para o seu uso adequado, foi necessário fazer alguns ajustes em sua biblioteca, pois ela foi feita para os padrões de uso do LoRa na europa e nos estados unidos. Foi acrescentado, usando um guia no próprio Git, linhas de código para que a biblioteca estivesse apta a funcionar com o padrão australiano (que é o mesmo do Brasil).


Na montagem do circuito, é necessário o uso de um conversor de nível lógico, porque enquanto o arduino trabalha com 5V o módulo LoRa trabalha com 3.3V. Se a conexão entre os dois fosse feito diretamente, o módulo LoRa poderia queimar.

No final, foi necessário usar o XAMPP. Este projeto usava um localhost e tinha opção de cadastrar e verificar hora de entrada e saída dos usuários cadastrados.

Para dar continuidade a este projeto, é necessário estudar as bibliotecas WiFi para fazer a comunicação com o servidor que será criado.

Para quaisquer outras informações ou dúvidas estamos a disposição da equipe.

---------------------------------
### Problemas ou dificuldades atuais
---------------------------------

O problema que estávamos enfrentando antes da paralisação do projeto era como poderíamos aumentar o alcance do leitor RFID. Para isso, provavelmente será necessário mudar a tecnologia que utilizamos na leitura, mas as opções ainda precisam ser pesquisadas. Não encontramos nenhuma viável. Penso que para uma primeira versão, podemos continuar usando a tecnologia disponível, por isso não estimarei um prazo para este problema.

---------------------------------
### Módulos
---------------------------------
MÓDULO RFID RC522

*SPI.h - Biblioteca do protocolo SPI
  * Nativa do Arduino / WiFi
  * Usa para comunicação: SCK, MOSI, MISO, Chip Select (SS ou NSS ou SDA)

MFRC522.h v1.4.6 - Biblioteca da placa RC522
  * Requer instanciação de um objeto do tipo MFRC522
  * MFRC522 obj (ss pin, rst pin)

* Com estas duas bibliotecas devidamente implementadas o sistema é capaz de ler tags normalmente.
---------------------------------
### Links Auxiliáres
---------------------------------
* A biblioteca principal para a comunicação com a tecnologia LoRa pode ser encontrada no link abaixo:
  * https://github.com/matthijskooijman/arduino-lmic
* A biblioteca atualizada pode ser encontrada no link abaixo, (o link pode mudar quando organizarmos o git):
  * https://github.com/Gabrielgca/RFID/tree/master/Bibliotecas
* Para o dispositivo WiFi, fizemos um projeto de controle de acesso seguindo um tutorial no youtube:
  * https://www.youtube.com/watch?v=dXZiFx6RP6s
---------------------------------
### Bibliotecas utilizada
---------------------------------
* Utilizando a biblioteca de "matthijskooijman" com a adaptação para AU-915
* Primeira fase de testes: sem erros de compilação, mas a conexão não foi bem sucedida
* Fases de teste consecutivas: bem sucedidos. Ajustes nas configurações foram feitos e os pacotes de dados chegam na TTN com sucesso usando ABP
* Todas as iterações da biblioteca LMIC apresentaram algum tipo de problema ou necessidade de alterar seus códigos, então foi produzida uma versão própria da mesma pelo próprio IBTI (i.e. "arduino-lmic-master_AU_mod")
* Problema com Downlink - Ao se fazer uplinks para o TTN , downlinks indesejados também são enviados para o dispositivo.
* Solução Downlink - desabilitar ADR [LMIC_setAdrMode (0)], com o ADR habilitado o Downlink deveria ser enviado após 64 Uplinks, mas por algum motivo o mesmo estava sendo enviado a cada Uplink;
---------------------------------
### Bibliotecas testadas e não utilizadas
---------------------------------
* LoRa.h v0.7.2 - Biblioteca LoRa para Arduino
  * Só faz P2P

* arduinoLoRaWAN v1.3 - Biblioteca LoRaWAN extendida a partir da LoRa nativa
  * Requer ArduinoAPI: Wire.h, ArduinoUtils.h e ArduinoUART.h
  * Aparenta não ser compatível com o SX1276
  * Não ficou clara a configuração da pinagem

* LMIC.h - Biblioteca alternativa para LoRaWAN
  * Requer hal.h (já vem junto)
  * Configuração por código fonte e header
  * Ocupa muita memória do Arduino

* LMIC.h atualizada v3.0.2 por "MCCI"
  * Sucesso em testes OTAA e ABP
  * Resolve alguns problemas que as versões anteriores apresentam, mas a taxa de transmissão foi anormalmente lenta

* LoRaWAN por "MCCI"
  * Uma extensão da LMIC MCCI para uma implementação mais alto nível
  * A maior parte de sua configuração é feita pela LMIC.h
  * Descontinuada assim que a LMIC MCCI foi descartada