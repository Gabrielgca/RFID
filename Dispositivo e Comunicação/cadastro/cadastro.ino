/*
-------- CADASTRO------------
Autora: Luiza Cezario
*/

//Bibliotecas
#include "SPI.h"
#include "MFRC522.h"
#include "WiFiEsp.h"
#include <SoftwareSerial.h>

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
String servidor = "192.168.2.113";
String uri = "/WiFiRFID?RFID=";
String sendData(String command, const int timeout, boolean debug);


struct Tags
{
  String id;
  String name;
};

struct Tags registeredTags = {"dbd543a", "Renato"};
String tagID = ""; //Variável que armazenará o ID da Tag
bool cadastrado = false; //Variável que verifica o cadastro

//Vetor responsável por armazenar os ID's das Tag's cadastradas
/*
String registeredTags [] = {"4bd8851b",
                            "id 2",
                            "id 3"};
*/

MFRC522 RFID (SS_PIN, RST_PIN);    // Cria uma nova instância para o leitor e passa os pinos como parâmetro
SoftwareSerial wifi(6, 7);//conexão com wifi

void setup ()
{
  Serial.begin (9600);             // Inicializa a comunicação Serial
  SPI.begin ();                    // Inicializa comunicacao SPI 
  RFID.PCD_Init ();                // Inicializa o leitor RFID
  pinMode (led_green, OUTPUT);     // Declara o pino do led verde como saída
  pinMode (led_red, OUTPUT);  // Declara o pino do led vermelho como saída
  pinMode (BUZZER, OUTPUT);        // Declara o pino do buzzer como saída
  RFID.PCD_SetAntennaGain(RFID.RxGain_max);

 Serial.begin(9600);//executa o monitor serial
  wifi.begin(9600);//monitora o wifi pelo monitor serial
  
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
  
  // Pega o ID da Tag através da função RFID.uid e Armazena o ID na variável tagID        
  for (byte i = 0; i < RFID.uid.size; i++)
  {
    tagID.concat (String (RFID.uid.uidByte [i], HEX));
  }
  
  //Compara o valor do ID lido com os IDs armazenados no vetor registeredTags.name
  for (int i = 0; i < (sizeof (registeredTags.id) / sizeof (String)); i++)
  {
    if (tagID.equalsIgnoreCase (registeredTags.id))
    {
        cadastrado = true; //Variável access assume valor verdadeiro caso o ID Lido esteja cadastrado
    }else
    {
      cadastrado = false;
    }
  }       

  String dado = "";
  
  if (cadastrado == true) //Se a variável access for verdadeira será chamada a função accessGranted() 
  {
    accessGranted ();       
    Serial.println("Tag já Cadastrada: " + registeredTags.name);
    dado.concat("TagCadastrada" + registeredTags.name);
  }else{                  //Se não será chamada a função accessDenied()
    accessDenied ();
    Serial.println("Cadastro Realizado");
    dado.concat("TagNaoCadastrada" + tagID);}
  
  delay (1000);           //aguarda 2 segundos para efetuar uma nova leitura

  //String dado = tagID;//variavel que recebe o HEX em String
  Serial.println("\n"+ dado );//mostrao HEX que do RFID
  dado.toUpperCase();//passa de letra minuscula para mauscula antes de enviar
  //rfid.PICC_HaltA();
  //rfid.PCD_StopCrypto1();
  
  
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
  sendData("AT+CIPSTART=2,\"TCP\",\"" + servidor + "\",5000\r\n",5000,DEBUG);

  //envia primeiro o tamanho dos dados, e depois os dados
  sendData(cipSend, 3000, DEBUG);
  sendData(get, 3000, DEBUG);
  tagID="";
  
  
  //Encerra o comando
  String closeCommand = "AT+CIPCLOSE=";
  closeCommand+=2;
  closeCommand+="\r\n";
  //envia os comandos de encerramento
  sendData(closeCommand, 2000, false);//esta linha está como false porem é certo é o DEBUG
  
}

void accessGranted ()
{
  Serial.println ("Tag Cadastrada: " + registeredTags.name); //Exibe a mensagem "Tag Cadastrada" e o ID da tag não cadastrada
  
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
  cadastrado = false;  //Seta a variável access como false novamente
}

void accessDenied ()
{
  Serial.println ("Tag NAO Cadastrada: " + tagID); //Exibe a mensagem "Tag NAO Cadastrada" e o ID da tag cadastrada
  
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

