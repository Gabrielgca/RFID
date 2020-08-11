---------------------------------
### Servidor
---------------------------------
---------------------------------
### Responsáveis:
---------------------------------
  * Saulo, Gabriel e Renato (Auxiliar)

---------------------------------
### Pontes de comunicação
---------------------------------
 * Aplicação e Dispositivo WiFi
   * Flask
     * Flask_cors
     * Flask_ngrok
   * Métodos HTTP
 * Banco de dados
   * MySQL
   * SQLAlchemy
 * Dispositivo LoRa 
   * The Things Network (ttn)
     * Protocolo MTQQ
---------------------------------
### Arquivos desenvolvidos
---------------------------------
 * serverRFID.py
   * Servidor em si com as rotas de comunicação com o dispositivo e aplicação. Utilizando o SQLAlchemy para se comunicar com o banco de dados já mapeado.
 * db_commands.py
   * Não utilizado. Retirar. (?)
 * db_control.py
   * Realizar o controle da comunicação com banco de dados MySql usando o orm SQLAlchemy.
 * db_mapped_objects.py
   * Descrição das tabelas do banco de dados que será trabalhado para usar o orm SQLAlchemy.
 * db_mapped_aux_objects.py
   * Descrição das tabelas auxiliares de nomes que serão utilizados para alimentar o banco com exemplos.
 * behaviors.py
   * Descrição dos tipos de comportamento de cada usuário de teste para alimentação do banco com exemplos.
 * insere_dados_teste.py
   * Organiza de forma aleatória o número determinado de nome de pessoas e seus comportamentos, relaciona a cada uma delas um número de cartão único e gera ocorrência para o número determinado de dias.
 * testedictsetor.py
   * Arquivo de teste para o dicionário de informações do setor a ser enviado para a aplicação.
 * testeimagem.py
   * Arquivo de teste para imagem a ser enviada para a aplicação e armazenada no servidor. 
---------------------------------
### Problemas encontrados
---------------------------------

---------------------------------
### Links auxiliares
---------------------------------
