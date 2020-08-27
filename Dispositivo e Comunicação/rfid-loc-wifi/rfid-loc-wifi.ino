/*
 * Autor: Arley Souto, Luiza Cezario e Majid
 * Data:31/07/2020
 * Projeto: Conexão e validação com RFID
 */

//Bibliotecas
#include "SPI.h"
#include "MFRC522.h"
//#include "WiFiEsp.h"
#include <SoftwareSerial.h>

//Pinos
#define SS_PIN 10
#define RST_PIN 9
#define DEBUG true
#define BUZZER 3

String ssid = "Inst Brasilia de Tec e Inov 2G";
String pass = "#ibti@2019";
String strID = "";
String servidor = "192.168.2.211";
String uri = "/WiFiRFID?RFID=";

//ID do dispositivo no Banco de dados
String loc = "3";

String sendData(String command, const int timeout, boolean debug);

String tagID = ""; //Variável que armazenará o ID da Tag
bool access = false; //Variável que verifica a permissão 



MFRC522 RFID (SS_PIN, RST_PIN);    // Cria uma nova instância para o leitor e passa os pinos como parâmetro
SoftwareSerial wifi(6, 7);//conexão com wifi

void setup ()
{
	Serial.begin (9600);             // Inicializa a comunicação Serial
	SPI.begin ();                    // Inicializa comunicacao SPI 
	RFID.PCD_Init ();          			 // Inicializa o leitor RFID
	pinMode (BUZZER, OUTPUT);        // Declara o pino do buzzer como saída
	RFID.PCD_SetAntennaGain(RFID.RxGain_max);

 
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
	
	// Verifica se existe uma Tag presente
	if (!RFID.PICC_IsNewCardPresent () || !RFID.PICC_ReadCardSerial ())
	{
		delay (100);
		return;
	}
  
  aproximaCartao();

	
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
  String get = "GET " + uri + dado +"&&LOC="+ loc +" HTTP/1.0\r\n" + "Host:" + servidor +"\r\n" + "Connection: close\r\n\r\n"; 
  
  //Envia Dados
  String cipSend = "AT+CIPSEND=";

  cipSend += 2;
  cipSend += ",";
  cipSend += get.length();
  cipSend += "\r\n";

  // Escolhe entre conexão TCP ou UDP com o servidor.
  // Id identificador, endereço do servidos e porta 
  sendData("AT+CIPSTART=2,\"TCP\",\"" + servidor + "\",4002\r\n",1000,DEBUG);//5000

  //envia primeiro o tamanho dos dados, e depois os dados
  sendData(cipSend, 1000, DEBUG);//3000
  sendData(get, 1000, DEBUG);//3000
  tagID="";
  
  
  //Encerra o comando
  String closeCommand = "AT+CIPCLOSE=";
  closeCommand+=2;
  closeCommand+="\r\n";
  //envia os comandos de encerramento
  sendData(closeCommand, 1000, false);//foi alterado aqui para forma padrão que seria o DEBUG, aqui estava false 2000
  
}

  void aproximaCartao(){
    int count = 2;//quantidade de bips
    for (int j = 0; j < count; j++){
      //liga o buzzer
      tone(BUZZER, 1500);
      delay(100);

      //desliga buzzer
      noTone(BUZZER);
      delay(100);
    }
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

  
