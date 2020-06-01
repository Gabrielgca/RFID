//Bibliotecas
#include <SPI.h>
#include <MFRC522.h>
#include <lmic.h>
#include <hal/hal.h>
#include <SPI.h>

//network session key de acordo com a TTN
static const PROGMEM u1_t NWKSKEY [16] = {0x64, 0x9B, 0x3D, 0x56, 0x09, 0xD7, 0x81, 0xBA, 0xD2, 0x7B, 0x30, 0x02, 0xF4, 0xAC, 0xED, 0x3D};

//application session key de acordo com a TTN
static const u1_t PROGMEM APPSKEY [16] = {0x2E, 0x78, 0xED, 0x07, 0x2F, 0x9C, 0x83, 0x1A, 0x6A, 0x80, 0x71, 0x8E, 0xBD, 0x9C, 0xDA, 0x97};

//device address de acordo com a TTN; este endereço é único por dispositivo
static const u4_t DEVADDR = 0x2602137F; // <-- Change this address for every node!

//desabilitando modo OTAA; sem estas 3 linhas o código acusa erro
void os_getArtEui (u1_t* buf) { }
void os_getDevEui (u1_t* buf) { }
void os_getDevKey (u1_t* buf) { }

static uint8_t tagID [4] = "";						//variável que armazena o ID das tags lidas pelo RFID
static osjob_t sendjob;										//variável usada pela LMIC para agendar pacotes
bool isUplinkComplete = false;						//confirmação de uplink

//intervalo entre envio de pacotes em segundos
const unsigned TX_INTERVAL = 1;

//pinagem referente ao LoRa
const lmic_pinmap lmic_pins = {
    .nss = 10,
    .rxtx = LMIC_UNUSED_PIN,
    .rst = 5,
    .dio = {2, 3, LMIC_UNUSED_PIN},
};

//tratamento de eventos do LMIC
void onEvent (ev_t ev)
{
	Serial.print (os_getTime ());
	Serial.print (": ");
	switch (ev)
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
			
		//join; apenas OTAA
		case EV_JOINING:
			Serial.println (F ("EV_JOINING"));
			break;
			
		case EV_JOINED:
			Serial.println (F ("EV_JOINED"));
			break;
			
		case EV_RFU1:
			Serial.println (F("EV_RFU1"));
			break;
			
		case EV_JOIN_FAILED:
			Serial.println (F ("EV_JOIN_FAILED"));
			break;
			
		case EV_REJOIN_FAILED:
			Serial.println (F ("EV_REJOIN_FAILED"));
			break;
			
		//uplink:
		case EV_TXCOMPLETE:
			//uplink realizado
			Serial.println(F("EV_TXCOMPLETE (includes waiting for RX windows)"));
			isUplinkComplete = true;
			
			if (LMIC.txrxFlags & TXRX_ACK)
				Serial.println (F ("Received ack"));
			if (LMIC.dataLen)
			{
				Serial.println (F ("Received "));
				Serial.println (LMIC.dataLen);
				Serial.println (F (" bytes of payload"));
			}
			
			//agendar próxima transmissão
			os_setTimedCallback (&sendjob, os_getTime () + sec2osticks (TX_INTERVAL), do_send);
			break;
			
		case EV_LOST_TSYNC:
			Serial.println (F ("EV_LOST_TSYNC"));
			break;
			
		//reset:
		case EV_RESET:
			Serial.println (F ("EV_RESET"));
			break;
			
		//downlink:
		case EV_RXCOMPLETE:
			//pacote recebido no ping slot
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

//função que prepara o payload para envio
void do_send (osjob_t* j)
{
	//checa se a transmissão TX ou RX está em aberto
	if (LMIC.opmode & OP_TXRXPEND)
		Serial.println (F ("OP_TXRXPEND, not sending"));
	else
	{
		//prepara um pacote de uplink para a próxima janela de transmissão disponível sem confirmação
		LMIC_setTxData2 (1, tagID, 4, 0);
		Serial.println (F ("Packet queued"));
	}
	//o próximo TX é agendado depois do evento TX_COMPLETE
}

//definições globais
#define LED_GREEN 6
#define SS_PIN 4
#define RST_PIN 9

//instanciando o leitor RFID com a devida pinagem
MFRC522 RFID (SS_PIN, RST_PIN);

void setup ()
{
	//iniciando a comunicação serial
  Serial.begin (115200);
  Serial.println (F ("Starting..."));
  
	//pullup; inicializando SS do LoRa e RFID e definindo ambos como saída para evitar interferência e vazamento de dados
  pinMode (10,OUTPUT);
  digitalWrite (10,HIGH);
  pinMode (4, OUTPUT);
  digitalWrite (4, HIGH);

  //inicializando o sistema LMIC / LoRa...
  os_init ();
  LMIC_reset ();
	
	//definições da LMIC
  #ifdef PROGMEM
  //on AVR, these values are stored in flash and only copied to RAM
  //once. Copy them to a temporary buffer here, LMIC_setSession will
  //copy them into a buffer of its own again.
  uint8_t appskey [sizeof (APPSKEY)];
  uint8_t nwkskey [sizeof (NWKSKEY)];
  memcpy_P (appskey, APPSKEY, sizeof (APPSKEY));
  memcpy_P (nwkskey, NWKSKEY, sizeof (NWKSKEY));
  LMIC_setSession (0x1, DEVADDR, nwkskey, appskey);
  #else
  //if not running an AVR with PROGMEM, just use the arrays directly
  LMIC_setSession (0x1, DEVADDR, NWKSKEY, APPSKEY);
  #endif
	
	//sub banda do plano de frequências AU915
  #if defined(CFG_us915)
    // NA-US channels 0-71 are configured automatically
    // but only one group of 8 should (a subband) should be active
    // TTN recommends the second sub band, 1 in a zero based count.
    // https://github.com/TheThingsNetwork/gateway-conf/blob/master/US-global_conf.json
    LMIC_selectSubBand (1);
    
    #endif

  // Disable link check validation
  LMIC_setLinkCheckMode (0);

  //configurando downlink para SF9 e uplink para SF7
  LMIC.dn2Dr = DR_SF9;
  LMIC_setDrTxpow (DR_SF7, 14);
	//inicialização LMIC / LoRa concluída--
	
  SPI.begin ();                    									//inicializando comunicação SPI 
  RFID.PCD_Init ();                									//inicializando leitor RFID
  pinMode (LED_GREEN, OUTPUT);     									//inicializando pino verde no modo de saída
  RFID.PCD_SetAntennaGain (RFID.RxGain_max);				//aumenta o alcance da antena do leitor RFID para o máximo
}

void loop ()
{  
	//verifica se tem uma tag no leitor RFID a cada 100 milissegundos
  if (!RFID.PICC_IsNewCardPresent () || !RFID.PICC_ReadCardSerial ())
  {
    delay (100);
    return;
  }
  Serial.print("Nova Tag lida.\n");
	
  //pega o ID da tag e armazena na variável tagID; joga o ID no serial
  for (byte i = 0; i < RFID.uid.size; i++)
  {
    tagID [i] = RFID.uid.uidByte [i];
    Serial.print (tagID [i],HEX);
    Serial.print (" ");
  }
  Serial.print ("\n");
  
	//envia o ID para a TTN
  do_send (&sendjob);
  
	//rotina do módulo LoRa que envia e recebe dados; executa o loop até os dados serem entregues
  while (isUplinkComplete != true)
		os_runloop_once ();
	
  Serial.print ("Terminou loop.\n");
	
  isUplinkComplete = false;
	
	//aciona o led verde para confirmação e aguarda antes de voltar à rotina
	tagIdentified (1, 500);
  delay (500);
}

/*função que ascende o led para confirmação
	count = número de bips
	ledDelay = tempo que fica aceso
*/
void tagIdentified (int count, int ledDelay)
{
  for (int j = 0; j < count; j++)
  {
    digitalWrite (LED_GREEN, HIGH);   
    delay (ledDelay);
		digitalWrite (LED_GREEN, LOW);
  }
}
