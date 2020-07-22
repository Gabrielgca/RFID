
/* 
 *  Este Código utiliza a comunicação WiFi para enviar o número RFID para um banco de dados 
 *  exibi-lo em uma página web. Ele possibilita o cadastramento de novos usuários pela página web.
 *  o Link para o vídeo do projeto pode ser encontrado abaixo:
 *  https://www.youtube.com/watch?v=dXZiFx6RP6s
 */

// Bibliotecas utilizadas
#include <ESP8266WiFi.h>     //Include Esp library
#include <WiFiClient.h> 
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>        //include RFID library

//Definições utilizadas
#define SS_PIN D2 //RX slave select
#define RST_PIN D1
#define RedLed D8
#define BlueLed D4

//Criando a instância para o leitor RFID a ser utilizado
MFRC522 mfrc522(SS_PIN, RST_PIN); // Create MFRC522 instance.

//Entrando com o nome da rede WiFi a ser utilizada e sua respectiva senha
const char *ssid = "Inst Brasilia de Tec e Inov 2G";  //ENTER YOUR WIFI SETTINGS
const char *password = "#ibti@2019";

//Servidor Web para ler e escrever, normalmente usamos o nosso IP na rede 
const char *host = "192.168.2.47";   //IP address of server wifi

/*Inicializando stings para receber o id do RFID (CardID), criar a URL a ser enviada (getData) 
 *e juntar com o servidor Web em um único endereço (Link) 
 */
String getData ,Link;
String CardID="";

void setup() {
  delay(1000);
  //Inicializando o monitor serial
  Serial.begin(115200);
  
  //Inicializando a comunicação SPI
  SPI.begin();  // Init SPI bus
  //Inicializando o Leitor RFID
  mfrc522.PCD_Init(); // Init MFRC522 card

  // Previne problemas de reconexão (muito tempo para reconectar)
  WiFi.mode(WIFI_OFF);        //Prevents reconnection issue (taking too long to connect)
  delay(1000);
  WiFi.mode(WIFI_STA);        //This line hides the viewing of ESP as wifi hotspot

  //Conecta com o nosso roteador WiFi
  WiFi.begin(ssid, password);     //Connect to your WiFi router
  Serial.println("");

  Serial.print("Connecting to ");
  Serial.print(ssid);
  
  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  // Se a conexão foi bem sucedida, mostra o endereço de IP no Monitor Serial
  Serial.println("");
  Serial.println("Connected");
  Serial.print("IP address: ");
  
  //Mostra o endereço de IP do módulo WiFi na rede
  Serial.println(WiFi.localIP());  //IP address assigned to your ESP

  //Inicializa as saídas definidas para os LED utilizados
  pinMode(RedLed,OUTPUT);
  pinMode(BlueLed,OUTPUT);
  
}

void loop() {
  // Tenta reconexão com a rede WiFi caso venha a cair
  if(WiFi.status() != WL_CONNECTED){
    WiFi.disconnect();
    WiFi.mode(WIFI_STA);
    Serial.print("Reconnecting to ");
    Serial.println(ssid);
    WiFi.begin(ssid, password);

  // Tenta a conexão com a rede WiFi
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
    Serial.println("");
    Serial.println("Connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());  //IP address assigned to your ESP
  }
  
  //Verifica se existe um cartão perto do leitor
   if ( ! mfrc522.PICC_IsNewCardPresent()) {
  return;//got to start of loop if there is no card present
 }
 
 // Se a função abaixo retornar 1, a struct uid, interna da biblioteca, contém o ID do cartão lido
 if ( ! mfrc522.PICC_ReadCardSerial()) {
  return;//if read card serial(0) returns 1, the uid struct contians the ID of the read card.
 }
 
 //Passa a ID contida na struct UID para a variável CardID
 for (byte i = 0; i < mfrc522.uid.size; i++) {
     CardID += mfrc522.uid.uidByte[i];
}


  //Declara um objeto da classe HTTPClient
  HTTPClient http;    //Declare object of class HTTPClient
  
  //Passa o ID lido para a URL a ser enviada
  getData = "?CardID=" + CardID;  //Note "?" added at front
  
  /*postdemo.php é onde está estruturado o site Web em que se vê as informações e que também repassa
  para o arduino o feedback
    */
  Link = "http://192.168.2.47/loginsystem/postdemo.php" + getData;
  
  http.begin(Link);
  
  //Envia a solicitação para o endereço em "Link"
  int httpCode = http.GET();            //Send the request
  delay(10);
  
  //Recebe o pacote de reposta 
  String payload = http.getString();    //Get the response payload
  
 //Printa o retorno do código HTTP, a reposta da solicitação do pacote e também o ID do cartão lido
  Serial.println(httpCode);   //Print HTTP return code
  Serial.println(payload);    //Print request response payload
  Serial.println(CardID);     //Print Card ID
  
  //Possíveis repostas
  // Para quando o usuário entra
  if(payload == "login"){
    digitalWrite(RedLed,HIGH);
    Serial.println("red on");
    delay(500);  //Post Data at every 5 seconds
  }
  
  //Para quando o usuário sai 
  else if(payload == "logout"){
    digitalWrite(BlueLed,HIGH);
    Serial.println("Blue on");
    delay(500);  //Post Data at every 5 seconds
  }
  
  //Para o caso de cadastrar um novo usuário
  else if(payload == "succesful" || payload == "Cardavailable"){
    digitalWrite(BlueLed,HIGH);
    digitalWrite(RedLed,HIGH);
    delay(500);  
  }
  delay(500);
  
  //Zera as variáveis utilizadas
  CardID = "";
  getData = "";
  Link = "";
  
  //Fim da conexão
  http.end();  //Close connection
  
  digitalWrite(RedLed,LOW);
  digitalWrite(BlueLed,LOW);
}
//=======================================================================
