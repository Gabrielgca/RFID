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
#include <MFRC522.h>
#include <SPI.h>
#include <lmic.h>
#include <hal/hal.h>

//Pinos
#define LED_GREEN 6
#define LED_RED 7
#define BUZZER 8
#define SS_PIN 10
#define RST_PIN 9

// LoRaWAN NwkSKey, network session key
// This is the default Semtech key, which is used by the early prototype TTN
// network.
static const PROGMEM u1_t NWKSKEY[16] = { 0x2B, 0x7E, 0x15, 0x16, 0x28, 0xAE, 0xD2, 0xA6, 0xAB, 0xF7, 0x15, 0x88, 0x09, 0xCF, 0x4F, 0x3C };

// LoRaWAN AppSKey, application session key
// This is the default Semtech key, which is used by the early prototype TTN
// network.
static const u1_t PROGMEM APPSKEY[16] = { 0x2B, 0x7E, 0x15, 0x16, 0x28, 0xAE, 0xD2, 0xA6, 0xAB, 0xF7, 0x15, 0x88, 0x09, 0xCF, 0x4F, 0x3C };

// LoRaWAN end-device address (DevAddr)
static const u4_t DEVADDR = 0x03FF0001 ; // <-- Change this address for every node!

bool isRegistered = false;														//Variável que verifica a permissão 
MFRC522 RFID (SS_PIN, RST_PIN);    										//Cria uma instância para o leitor RFID e passa os pinos como parâmetro

// These callbacks are only used in over-the-air activation, so they are
// left empty here (we cannot leave them out completely unless
// DISABLE_JOIN is set in config.h, otherwise the linker will complain).
void os_getArtEui (u1_t* buf) { }
void os_getDevEui (u1_t* buf) { }
void os_getDevKey (u1_t* buf) { }

static uint8_t tagID [RFID.uid.size] = "";
static osjob_t sendjob;

// Schedule TX every this many seconds (might become longer due to duty
// cycle limitations).
const unsigned TX_INTERVAL = 1;												//Intervalo entre o envio de cada pacote; vai ser o mesmo do DELAY no final do LOOP dividido por 1000

// Pin mapping do SX1276
const lmic_pinmap lmic_pins = {
    .nss = 10,
    .rxtx = LMIC_UNUSED_PIN,
    .rst = 5,
    .dio = {2, 3, LMIC_UNUSED_PIN},
};

void onEvent (ev_t ev)
{
	Serial.print (os_getTime ());
	Serial.print (": ");
	switch(ev)
	{
		case EV_SCAN_TIMEOUT:
			Serial.println (F ("EV_SCAN_TIMEOUT"));
			break;
		case EV_BEACON_FOUND:
			Serial.println (F ("EV_BEACON_FOUND"));
			break;
		case EV_BEACON_MISSED:
			Serial.println (F ("EV_BEACON_MISSED"));
			break;
		case EV_BEACON_TRACKED:
			Serial.println (F ("EV_BEACON_TRACKED"));
			break;
		case EV_JOINING:
			Serial.println (F ("EV_JOINING"));
			break;
		case EV_JOINED:
			Serial.println (F ("EV_JOINED"));
			break;
		case EV_RFU1:
			Serial.println (F ("EV_RFU1"));
			break;
		case EV_JOIN_FAILED:
			Serial.println (F ("EV_JOIN_FAILED"));
			break;
		case EV_REJOIN_FAILED:
			Serial.println (F ("EV_REJOIN_FAILED"));
			break;
		case EV_TXCOMPLETE:
			Serial.println (F ("EV_TXCOMPLETE (includes waiting for RX windows)"));
			if (LMIC.txrxFlags & TXRX_ACK)
				Serial.println (F ("Received ack"));
			if (LMIC.dataLen) {
				Serial.println (F ("Received "));
				Serial.println (LMIC.dataLen);
				Serial.println (F (" bytes of payload"));
			}
			// Schedule next transmission
			os_setTimedCallback (&sendjob, os_getTime () + sec2osticks (TX_INTERVAL), do_send);
			break;
		case EV_LOST_TSYNC:
			Serial.println (F ("EV_LOST_TSYNC"));
			break;
		case EV_RESET:
			Serial.println (F ("EV_RESET"));
			break;
		case EV_RXCOMPLETE:
			// data received in ping slot
			Serial.println (F ("EV_RXCOMPLETE"));
			break;
		case EV_LINK_DEAD:
			Serial.println (F ("EV_LINK_DEAD"));
			break;
		case EV_LINK_ALIVE:
			Serial.println (F ("EV_LINK_ALIVE"));
			break;
		default:
			Serial.println (F ("Unknown event"));
			break;
	}
}

void do_send (osjob_t* j)
{
	// Check if there is not a current TX/RX job running
	if (LMIC.opmode & OP_TXRXPEND)
		Serial.println (F ("OP_TXRXPEND, not sending"));
	else
	{
		// Prepare upstream data transmission at the next possible time.
		LMIC_setTxData2 (1, tagID, sizeof (tagID) - 1, 0);
		Serial.println (F ("Packet queued"));
	}
	// Next TX is scheduled after TX_COMPLETE event.
}

void setup ()
{
	Serial.begin (115200);        							    		//Inicializa a comunicação Serial
	Serial.print ("Initializing...");
	
	pinMode (10, OUTPUT);
	digitalWrite (10, HIGH);
	pinMode (4, OUTPUT);
	digitalWrite (4, HIGH);
	
	SPI.begin ();                  								 			//Inicializa a comunicação SPI
	RFID.PCD_Init ();          													//Inicializa o leitor RFID
	RFID.PCD_SetAntennaGain (RFID.RxGain_max);					//Aumenta o alcance do módulo RFID para o máximo
	pinMode (LED_GREEN, OUTPUT);    										//Declara o pino do led verde como saída
	pinMode (LED_RED, OUTPUT);  												//Declara o pino do led vermelho como saída
	pinMode (BUZZER, OUTPUT);      								 			//Declara o pino do buzzer como saída
	
	// LMIC init
	os_init ();
	// Reset the MAC state. Session and pending data transfers will be discarded.
	LMIC_reset ();
	
	//
	LMIC_selectSubBand (1);
	
	// Disable link check validation
	LMIC_setLinkCheckMode (0);

	// TTN uses SF9 for its RX2 window.
	LMIC.dn2Dr = DR_SF9;

	// Set data rate and transmit power for uplink (note: txpow seems to be ignored by the library)
	LMIC_setDrTxpow (DR_SF7, 14);

	// Start job
	do_send (&sendjob);
}

void loop ()
{
	//Verifica se existe uma Tag presente a cada "delay" milissegundos
	if (!RFID.PICC_IsNewCardPresent () || !RFID.PICC_ReadCardSerial ())
	{
		delay (100);
		return;
	}
	
	//Lê a tag do cartão
	for (byte i = 0; i < RFID.uid.uidByte.size; i++)
		tagID [i] = RFID.uid.uidByte [i];
	Serial.print (tagID, HEX);//DEBUG
	os_runloop_once();
	
	delay (1000);																				//aguarda 1 segundo para efetuar uma nova leitura
}

//FUNÇÃO DE TESTE; será removida mais tarde
//Tag cadastrada: acende o led VERDE e aciona o buzzer
void accessGranted ()
{
  Serial.println ("Tag cadastrada: " + tagID);				//Exibe a mensagem de tag cadastrada e o NOME referente à entrada da mesma
  
	int count = 1;																			//quantidade de beeps
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