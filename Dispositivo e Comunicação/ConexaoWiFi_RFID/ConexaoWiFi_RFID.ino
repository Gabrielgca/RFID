/*
 * Autor: Arley Souto
 * Data:31/07/2020
 * Projeto: Conexão e validação com RFID
 */

//Bibliotecas utilizadas
#include "SPI.h"
#include "MFRC522.h"
#include "WiFiEsp.h"
#include <SoftwareSerial.h>
#include <ArduinoJson.h>
//-----------------------------------------------------------------//

//Leitura do RFID defines
#define SS_PIN 10
#define RST_PIN 9
#define DEBUG true
#define buzz 3
#define ledGreen 4
//------------------------------------------------------------------//
//variaveis
String ssid = "Inst Brasilia de Tec e Inov 2G";
String pass = "#ibti@2019";
String strID = "";
String servidor = "192.168.2.211";
String uri = "/WiFiRFID?RFID=";
String sendData(String command, const int timeout, boolean debug);

//--------------------------------------------------------------------//
//Acesso a biblioteca do RFID criando duas instancia relacionado aos pins
MFRC522 rfid(SS_PIN, RST_PIN);//conexão RFID 10, 9
SoftwareSerial wifi(6, 7);//conexão com wifi

//-------------------------------------------------------------

 void cadastro(){
  digitalWrite(ledGreen, HIGH);
  delay(200);
  tone(buzz, 500);
  delay(500);
  digitalWrite(ledGreen, LOW);
  delay(200);
  noTone(buzz);
 }



void setup() {
  //Esses dois comando tem que estar a cima de todos os sendData
  Serial.begin(9600);//executa o monitor serial
  wifi.begin(9600);//monitora o wifi pelo monitor serial
  while(!Serial) continue;
  
  
  
  
  //Lista as oonexoes disponiveis
  sendData("AT+CWLAP\r\n", 2000, DEBUG);

  // Configura o mode de operacao
  // ? -Lista modos validos, 1- Modo Cliente, 2- Modo Host, 3-Cliente e Host
  sendData("AT+CWMODE=1\r\n",2000,DEBUG);

  // Reseta a ESP-01
 //sendData("AT+RST\r\n", 2000, DEBUG); // rst 

 // conecta a rede escolhida
  sendData("AT+CWJAP=\""+ssid+"\",\""+pass+"\"\r\n",10000,DEBUG); 

  // Lista o ip adquirido pela ESP-01
  sendData("AT+CIFSR\r\n", 2000, DEBUG);
  
  // Configura para multiplas conexoes
  sendData("AT+CIPMUX=1\r\n", 2000, DEBUG);                 

 
  

  //LED_BUILTIN está localizado na porta 13 do arduino UNO
  pinMode(ledGreen, OUTPUT);
  pinMode(buzz, OUTPUT);
  SPI.begin();
  rfid.PCD_Init();//inicia o RFID
  rfid.PCD_SetAntennaGain(rfid.RxGain_max);
  //server.begin();
  Serial.println("Aproxime o cartão...");//Apenas mostra no monitor quando for a hora de aproximar o RFID card
}
  

void loop() {
  //Condição fica observando se tem algum cartão e se já é cadastrado
  if(!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()){
    delay(100);
    return;//caso algumas destas condição seja falsa ele vai continuar fazendo a leitura
  }
   

  for(byte i = 0; i<rfid.uid.size; i++){//faz com seja gerado o HEXADECIMAL
    //Serial.print(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    //Serial.print(rfid.uid.uidByte[i], HEX);
    //strID.concat(String(rfid.uid.uidByte[i] < 0x10 ? "0" : ""));
    strID.concat(String(rfid.uid.uidByte[i], HEX));
  }
  
 
  String dado = strID;//variavel que recebe o HEX em String
  Serial.println("\n"+dado);//mostrao HEX que do RFID
  dado.toUpperCase();//passa de letra minuscula para mauscula antes de enviar
  //rfid.PICC_HaltA();
  //rfid.PCD_StopCrypto1();

  //testa para ver se tem alguma coisa na variavel dados, apenas para o led o buzzer
  if(dado != "" ){
    cadastro();
  }

  
  
  //Dados que serão enviados
  String get = "GET " + uri + dado + " HTTP/1.0\r\n" + "Host:" + servidor +"\r\n" + "Connection: close\r\n\r\n"; 

 


  
  //Envia Dados
  String cipSend = "AT+CIPSEND=";

  cipSend += 2;
  cipSend += ",";
  cipSend += get.length();
  cipSend += "\r\n";

  // Escolhe entre conexão TCP ou UDP com o servidor.
  // Id identificador, endereço do servidos e porta 
  sendData("AT+CIPSTART=2,\"TCP\",\"" + servidor + "\",4002\r\n",5000,DEBUG);

  //envia primeiro o tamanho dos dados, e depois os dados
  sendData(cipSend, 3000, DEBUG);
  sendData(get, 3000, DEBUG);
  
  StaticJsonDocument<200> doc;//inicializa a biblioteca
  char json[] = "{\"resposta\":\"teste""\"}";
  DeserializationError error = deserializeJson(doc, json);
  if(error){
    Serial.print(F("Deserialization() failed(): "));
    Serial.println(error.c_str());
    return;
  }

  bool resposta = doc[DEBUG];
  Serial.print(resposta);
  
  strID="";
  
  //Encerra o comando
  String closeCommand = "AT+CIPCLOSE=";
  closeCommand+=2;
  closeCommand+="\r\n";
  //envia os comandos de encerramento
  sendData(closeCommand, 2000, false);//esta linha está como false porem é certo é o DEBUG
  

  
}
 String sendData(String command, const int timeout, boolean debug){
    String response = "";
    wifi.print(command);
    long int time = millis();

    while((time + timeout) > millis()){
      while(wifi.available()){
        char c = wifi.read();
        response += c;
      }
    }
    if(debug){
      Serial.print(response);
    }
    return response;
  }
