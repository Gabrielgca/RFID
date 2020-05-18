/*
-------- CONTROLE DE ACESSO VIA RFID ------------
=================================================
==   BLOG DA ROBOTICA - www.blogdarobotica.com ==
=================================================
Autor: Kleber Bastos
E-mail: contato@blogdarobotica.com
Fanpage: facebook.com/blogdarobotica
YouTube: youtube.com/user/blogdarobotica
*/

//Bibliotecas
#include "SPI.h"
#include "MFRC522.h"

//Pinos
#define LED_GREEN 6
#define LED_RED 7
#define BUZZER 8
#define SS_PIN 10
#define RST_PIN 9

String tagID = ""; //Variável que armazenará o ID da Tag
bool access = false; //Variável que verifica a permissão 

//Vetor responsável por armazenar os ID's das Tag's cadastradas
String registeredTags [] = {"4bd8851b",
														 "id 2",
														 "id 3"};
/*class IDname
{
  String ident;
  String nome;
  };
  */

MFRC522 RFID (SS_PIN, RST_PIN);    // Cria uma nova instância para o leitor e passa os pinos como parâmetro


void setup ()
{
        Serial.begin (9600);             // Inicializa a comunicação Serial
        SPI.begin ();                    // Inicializa comunicacao SPI 
        RFID.PCD_Init ();          			 // Inicializa o leitor RFID
        pinMode (LED_GREEN, OUTPUT);     // Declara o pino do led verde como saída
        pinMode (LED_RED, OUTPUT);  // Declara o pino do led vermelho como saída
        pinMode (BUZZER, OUTPUT);        // Declara o pino do buzzer como saída
				RFID.PCD_SetAntennaGain(RFID.RxGain_max);
}

void loop ()
{  
	//Inicialmente tagID deve estar vazia.
	tagID = "";
	
	// Verifica se existe uma Tag presente
	if (!RFID.PICC_IsNewCardPresent () || !RFID.PICC_ReadCardSerial ())
	{
			delay(50);
			return;
	}
	
	// Pega o ID da Tag através da função RFID.uid e Armazena o ID na variável tagID        
	for (byte i = 0; i < RFID.uid.size; i++)
	{        
			tagID.concat (String (RFID.uid.uidByte [i], HEX));
	}        
	
	//Compara o valor do ID lido com os IDs armazenados no vetor registeredTags []
	for (int i = 0; i < (sizeof (registeredTags) / sizeof (String)); i++)
	{
		if (tagID.equalsIgnoreCase (registeredTags [i]))
		{
				access = true; //Variável access assume valor verdadeiro caso o ID Lido esteja cadastrado
		}
	}       

	if (access == true)	//Se a variável access for verdadeira será chamada a função accessGranted() 
		accessGranted ();       
	else										//Se não será chamada a função accessDenied()
		accessDenied ();

	delay (1000);						//aguarda 2 segundos para efetuar uma nova leitura
}

void accessGranted ()
{
  if(tagID == "4bd8851b")
  Serial.println ("Olá, João!!"); //Exibe a mensagem "Tag Cadastrada" e o ID da tag não cadastrada
  else
  Serial.println ("Tag Cadastrada: " + tagID);
	int count = 2; //definindo a quantidade de bips
  for (int j = 0; j < count; j++)
	{
    //Ligando o buzzer com uma frequência de 1500 hz e ligando o led verde.
    tone (BUZZER, 1500);
    digitalWrite (LED_GREEN, HIGH);   
    delay (100);   
    
    //Desligando o buzzer e led verde.      
    noTone (BUZZER);
    digitalWrite (LED_GREEN, LOW);
    delay (100);
  }
	access = false;  //Seta a variável access como false novamente
}

void accessDenied ()
{
  Serial.println ("Tag NAO Cadastrada: " + tagID); //Exibe a mensagem "Tag NAO Cadastrada" e o ID da tag cadastrada
  
	int count = 1;  //definindo a quantidade de bips
  for (int j = 0; j < count; j++)
	{   
    //Ligando o buzzer com uma frequência de 500 hz e ligando o led vermelho.
    tone (BUZZER, 500);
    digitalWrite (LED_RED, HIGH);   
    delay (500); 
      
    //Desligando o buzzer e o led vermelho.
    noTone (BUZZER);
    digitalWrite (LED_RED, LOW);
    delay (500);
  } 
}

void efeitoPermitido ()
{  
  int count = 2; //definindo a quantidade de bips
  for (int j = 0; j < count; j++)
	{
    //Ligando o buzzer com uma frequência de 1500 hz e ligando o led verde.
    tone (BUZZER, 1500);
    digitalWrite (LED_GREEN, HIGH);   
    delay (100);   
    
    //Desligando o buzzer e led verde.      
    noTone (BUZZER);
    digitalWrite (LED_GREEN, LOW);
    delay (100);
  }
}

void efeitoNegado ()
{  
  int count = 1;  //definindo a quantidade de bips
  for (int j = 0; j < count; j++)
	{   
    //Ligando o buzzer com uma frequência de 500 hz e ligando o led vermelho.
    tone (BUZZER, 500);
    digitalWrite (LED_RED, HIGH);   
    delay (500); 
      
    //Desligando o buzzer e o led vermelho.
    noTone (BUZZER);
    digitalWrite (LED_RED, LOW);
    delay (500);
  }  
}
