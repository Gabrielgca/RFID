/*
 * Autor: Arley Souto, Luiza Cezario e Majid
 * Data:31/07/2020
 * Projeto: Conexão e validação com RFID
 */

//Bibliotecas
#include "SPI.h"
#include "MFRC522.h"
#include <SoftwareSerial.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

//Pinos
#define SS_PIN 10
#define RST_PIN 9
#define DEBUG true
#define BUZZER 3
#define led_green 4
#define led_red 5

String ssid = "Inst Brasilia de Tec e Inov 2G";
String pass = "#ibti@2019";
String strID = "";
String servidor = "192.168.2.196";
String port = "7000";
String uri = "/WiFiRFID?RFID=";
int passe = 0;

//ID do dispositivo no Banco de dados
String loc = "1";

//Número de tentativas de reconexão
unsigned int N = 7;

String sendData(String command, const int timeout, boolean debug, boolean wait_response = false);
void aproximaCartao(int freq = 1500, int bip = 2);
bool tryagain (String comando, unsigned int N = 7);
bool resposta (String resp, String esperado);
int permitido (String perm);

String tagID = ""; //Variável que armazenará o ID da Tag



MFRC522 RFID (SS_PIN, RST_PIN);    // Cria uma nova instância para o leitor e passa os pinos como parâmetro
SoftwareSerial wifi(6, 7);//conexão com wifi

void setup ()
{
	Serial.begin (9600);             // Inicializa a comunicação Serial
	SPI.begin ();                    // Inicializa comunicacao SPI 
	RFID.PCD_Init ();          			 // Inicializa o leitor RFID
	pinMode (BUZZER, OUTPUT);        // Declara o pino do buzzer como saída
	RFID.PCD_SetAntennaGain(RFID.RxGain_max);
  randomSeed(analogRead(0));

 
  wifi.begin(9600);//monitora o wifi pelo monitor serial
  
  //Lista as oonexoes disponiveis
  sendData("AT+CWLAP\r\n", 2000, DEBUG);//2000

  // Configura o mode de operacao
  // ? -Lista modos validos, 1- Modo Cliente, 2- Modo Host, 3-Cliente e Host
  sendData("AT+CWMODE=1\r\n",2000,DEBUG);//2000

  // Reseta a ESP-01
 //sendData("AT+RST\r\n", 2000, DEBUG); // rst 

 // conecta a rede escolhida
  sendData("AT+CWJAP=\""+ssid+"\",\""+pass+"\"\r\n",10000,DEBUG);//10000 

  // Lista o ip adquirido pela ESP-01
  sendData("AT+CIFSR\r\n", 2000, DEBUG);//2000
  
  // Configura para multiplas conexoes
  sendData("AT+CIPMUX=1\r\n", 2000, DEBUG);//2000       

  //server.begin();
  Serial.println("Aproxime o cartão...");//Apenas mostra no monitor quando for a hora de aproximar o RFID card
}

void loop ()
{  
	//Inicialmente tagID deve estar vazia.
	tagID = "";
  String success;
  String recebido;

  bool okay,tried;
	
	// Verifica se existe uma Tag presente
	if (!RFID.PICC_IsNewCardPresent () || !RFID.PICC_ReadCardSerial ())
	{
		delay (100);
		return;
	}
  
  aproximaCartao(1500);

	
	// Pega o ID da Tag através da função RFID.uid e Armazena o ID na variável tagID        
	for (byte i = 0; i < RFID.uid.size; i++)
	{
		tagID.concat (String (RFID.uid.uidByte [i], HEX));
	}


  String dado = "";
  dado = tagID;

  
  
  //String dado = tagID;//variavel que recebe o HEX em String
  Serial.println("\n"+ dado );//mostrao HEX que do RFID
  dado.toUpperCase();//passa de letra minuscula para mauscula antes de enviar

  
  //Dados que serão enviados
  String get = "GET " + uri + dado +"&&LOC="+ loc +" HTTP/1.1\r\n" + "Host:" + servidor +"\r\n\r\n";

    //"Connection: close\r\n\r\n
  
  //Envia Dados
  String cipSend = "AT+CIPSEND=";

  cipSend += 2;
  cipSend += ",";
  cipSend += get.length();
  cipSend += "\r\n";

  // Escolhe entre conexão TCP ou UDP com o servidor.
  // Id identificador, endereço do servidos e porta 
   success = sendData("AT+CIPSTART=2,\"TCP\",\"" + servidor + "\","+ port + "\r\n",1000,DEBUG);//5000

  okay = resposta(success,"OK");

  if(!okay){
  Serial.println("Passou por dentro deste IF!!");
  tried = tryagain("AT+CIPSTART=2,\"TCP\",\"" + servidor + "\",7000\r\n");
  if(!tried){
    return;
    }
  }
  
  //envia primeiro o tamanho dos dados, e depois os dados
  sendData(cipSend, 1000, DEBUG);//3000
  

  
  recebido =  sendData(get, 10000, DEBUG, true);//3000

  tagID="";
  
  
  //Encerra o comando
  String closeCommand = "AT+CIPCLOSE=";
  closeCommand+=2;
  closeCommand+="\r\n";
  //envia os comandos de encerramento
  sendData(closeCommand, 1000,DEBUG);//foi alterado aqui para forma padrão que seria o DEBUG, aqui estava false 2000


  passe = resposta(recebido,"true");

  Serial.println("Resultado");
  Serial.println(passe);

  if(passe==0)
  {
    accessDenied();
  }else
  {
    accessGranted();
  }
}

void aproximaCartao(int freq = 1500, int bip = 2){
    for (int j = 0; j < bip; j++){
      //liga o buzzer
      tone(BUZZER, freq);
      delay(100);

      //desliga buzzer
      noTone(BUZZER);
      delay(100);
    }
  }
  
 String sendData(String command, const int timeout, boolean debug, boolean wait_response = false){
    String response = "";

    wifi.print(command);

    long int time = millis();

    if (wait_response == true){
      while(!(resposta(response,"}"))){
      while(wifi.available()){
        char c = wifi.read();
        response += c;
      
      }
      }
    }
    else {
      while((time + timeout) > millis()){
      while(wifi.available()){
        char c = wifi.read();
        response += c;
      }
    }
    }
    if(debug){
      Serial.print(response);
    }
    return response;
  }

  bool tryagain (String comando,  unsigned int N = 7){
    
  bool recebeu;
  String try_answer;

  for (int i = 1;i<= N; i++){
  Serial.print("Esperando "); Serial.print(pow(2,i)); Serial.println(" Segundos para tentar reconexão...");
  delay(1000*pow(2,i));
  Serial.print("Tentando Reconexão pela "); Serial.print(i) ;Serial.println("° Vez");
  try_answer = sendData(comando ,1000,DEBUG);
  recebeu = resposta(try_answer,"OK");
  if(recebeu){
    Serial.println ("Reconectado!!");
    return true;
    }
  else {
    aproximaCartao(493);
    continue;
    }
 }
  Serial.println ("Desconectado");
  aproximaCartao(261,1);
  return false;      
}
  
  bool resposta (String resp, const char* esperado){
  
  char * pch;
  const char * suc;
  int ascii;

  suc = resp.c_str();
  pch = strstr(suc,esperado);
  //Serial.print("Comparando String com ERROR: "); Serial.println(pch);
  ascii = pch;
  if (ascii == 0){
    return false;
    }
  else{
    return true;
    }
   }


 void accessGranted ()
{

 int count = 2; //definindo a quantidade de bips
  for (int j = 0; j < count; j++)
  {
    //Ligando o buzzer com uma frequência de 1500 hz e ligando o led verde.
    tone (BUZZER, 1500);
    digitalWrite (led_green, HIGH);   
    delay (100);   
    
    //Desligando o buzzer e led verde.      
    noTone (BUZZER);
    digitalWrite (led_green, LOW);
    delay (100);
  }
}

void accessDenied ()
{
  
  int count = 1;  //definindo a quantidade de bips
  for (int j = 0; j < count; j++)
  {   
    //Ligando o buzzer com uma frequência de 500 hz e ligando o led vermelho.
    tone (BUZZER, 500);
    digitalWrite (led_red, HIGH);   
    delay (500); 
    
    //Desligando o buzzer e o led vermelho.
    noTone (BUZZER);
    digitalWrite (led_red, LOW);
    delay (500);
  }
}
    
    
