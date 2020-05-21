/*
CONTROLE DE ACESSO VIA RFID
	Autor: IBTI - Brasília
	
	Lembrete: ESTA VERSÃO NÃO ESTÁ PRONTA PARA USO!
	Não use-a em Arduino por enquanto. Vàrias funções serão mudadas e / ou removidas na versão funcional
	[x] - Importar biblioteca
	[x] - Inicializar módulo propriamente
	[ ] - Função de envio de pacote
	[ ] - Teste?
	
	[x] - Registro na TTN
	[x] - ID do dispositivo?
	[ ] - Aguardando banco de dados MySql...
	[ ] - Refazer pacote de dados de acordo
	[ ] - Função de recebimento de pacote
	[ ] - ??
*/

//Bibliotecas
#include "SPI.h"
#include "MFRC522.h"
#include "arduinoLoRaWAN.h"

//Pinos
#define LED_GREEN 6
#define LED_RED 7
#define BUZZER 8
#define SS_PIN 10
#define RST_PIN 9

struct Tag																						//Pacote de saída de dados atual; será descontinuado quando a implementação LoRa for concluída
{
	String id;
	String name;
};

struct Tag registeredTag = {"c73bc34d", "Renato"};		//Entrada de teste para reconhecer o cartão sem precisar do banco de dados
String tagID = ""; 																		//Variável que armazenará o ID da Tag em formato String
char packet [] =  "";																	//Variável que armazenará o ID da Tag em formato char*
bool isRegistered = false;														//Variável que verifica a permissão 
MFRC522 RFID (SS_PIN, RST_PIN);    										//Cria uma instância para o leitor RFID e passa os pinos como parâmetro

uint8_t socket = SOCKET1;															//??
uint8_t PORT = 0;																			//Porta para o envio de pacote
char deviceEui [] = "00156C12BB980F6A";								//EUI do dispositivo							
char appEui [] = "70B3D57ED002F449";									//EUI da application
char appKey [] = "92204EF94112C0C30450A8CFAEE580CD";	//Chave da aplicação

void setup ()
{
	Serial.begin (9600);        							    			//Inicializa a comunicação Serial
	SPI.begin ();                  								 			//Inicializa a comunicação SPI
	RFID.PCD_Init ();          													//Inicializa o leitor RFID
	pinMode (LED_GREEN, OUTPUT);    										//Declara o pino do led verde como saída
	pinMode (LED_RED, OUTPUT);  												//Declara o pino do led vermelho como saída
	pinMode (BUZZER, OUTPUT);      								 			//Declara o pino do buzzer como saída
	RFID.PCD_SetAntennaGain (RFID.RxGain_max);					//Aumenta o alcance do módulo RFID para o máximo
	
	LoRaWAN.setDeviceEUI (deviceEui);										//Inicializando configurações Lora...
	LoRaWAN.setAppEUI (appEui);													//...
	LoRaWAN.setAppKey (appKey);													//...
	LoRaWAN.setDataRate (5);														//...
	LoRaWAN.saveConfig ();															//Salvando as configurações no firmware
}

void loop ()
{
	//Inicialmente tagID deve estar vazia
	tagID = "";
	
	//Verifica se existe uma Tag presente a cada "delay" milissegundos
	if (!RFID.PICC_IsNewCardPresent () || !RFID.PICC_ReadCardSerial ())
	{
		delay (100);
		return;
	}
	
	//Pega o ID da Tag através de uma função nativa do sensor RFID e armazena o ID na variável tagID
	for (byte i = 0; i < RFID.uid.size; i++)
		tagID.concat (String (RFID.uid.uidByte [i], HEX));
	
	//FUNÇÃO DE TESTE; será removida mais tarde
	//Compara o valor do ID lido com o ID armazenado em registeredTag
	for (int i = 0; i < (sizeof (registeredTag.id) / sizeof (String)); i++)
		if (tagID.equalsIgnoreCase (registeredTag.id))
			isRegistered = true; 																//Variável isRegistered assume valor verdadeiro caso o ID Lido esteja cadastrado
	
	if (isRegistered == true)																//Se a variável isRegistered for verdadeira será chamada a função accessGranted
		accessGranted ();
	else																							//Se não será chamada a função accessDenied
		accessDenied ();
	
	delay (1000);																			//aguarda 1 segundo para efetuar uma nova leitura
}

//FUNÇÃO DE TESTE; será removida mais tarde
//Tag cadastrada: acende o led VERDE e aciona o buzzer
void accessGranted ()
{
  Serial.println ("Tag cadastrada: " + registeredTag.name);	//Exibe a mensagem de tag cadastrada e o NOME referente à entrada da mesma
  
	int count = 1;																		//quantidade de beeps
  for (int j = 0; j < count; j++)
	{
    //Liga o buzzer em Si e liga o led verde
    tone (BUZZER, 987);
    digitalWrite (LED_GREEN, HIGH);
    delay (100);   
    
		//Desliga o buzzer e o led verde
    noTone (BUZZER);
    digitalWrite (LED_GREEN, LOW);
    delay (100);
  }
	isRegistered = false;  																	//Seta a variável isRegistered como false novamente
}

//FUNÇÃO DE TESTE; será removida mais tarde
//Tag cadastrada: acende o led VERMELHO e aciona o buzzer
void accessDenied ()
{
  Serial.println ("Tag NAO cadastrada: " + tagID);	//Exibe a mensagem de tag não cadastrada e o ID da tag
  
	int count = 2;  																	//quantidade de beeps
  for (int j = 0; j < count; j++)
	{
    //Liga o buzzer em Sol sustenido e liga o led vermelho
    tone (BUZZER, 415);
    digitalWrite (LED_RED, HIGH);
    delay (150); 
    
    //Desliga o buzzer e o led vermelho
    noTone (BUZZER);
    digitalWrite (LED_RED, LOW);
    delay (150);
  }
}

/*DEPRECATED
	Função feita para outra biblioteca LoRa que não está mais sendo utilizada

void sendMessage (String output) 
{
  LoRa.beginPacket();                   						//Inicia o pacote da mensagem
  LoRa.write(destination);             							//Adiciona o endereço de destino
  LoRa.write(localAddress);             						//Adiciona o endereço do remetente
  LoRa.write(output.length());        							//Tamanho da mensagem em bytes
  LoRa.print(output);                								//Vetor da mensagem 
  LoRa.endPacket();                    							//Finaliza o pacote e envia
}
*/
