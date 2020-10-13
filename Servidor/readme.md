---------------------------------
### Servidor
---------------------------------

<p align="center">
  <img src="ServidorRFIDV2.png" width="500" title="Servidor RFID">
</p>

---------------------------------
### Responsáveis:
---------------------------------
  * Saulo, Gabriel e Renato (Auxiliar)

---------------------------------
### Pontes de comunicação
---------------------------------
 * Aplicação
   * Flask
     * Flask-cors
     * Flask-ngrok
     * Flask-socketIO

 * Dispositivo WiFi
   * Métodos HTTP
 * Banco de dados
   * Flask-SQLAlchemy

---------------------------------
### Arquivos desenvolvidos
---------------------------------
 * serverRFID_V2_Socket.py
   * Servidor em si com as rotas de comunicação com o dispositivo e aplicação. Utilizando o flask-SQLAlchemy para se comunicar com o banco de dados já mapeado. Código inclui mapeamento do banco de dados e eventos socket utilizados.
 * db_commands_v2.py
   * Comandos recorrentes utilizados para a seleção, inserção e atualização de dados no banco de dados.
 * rfid_v2.sql
   * Código em SQL do banco de dados princpal com as tabelas e suas relações.

---------------------------------
### Problemas encontrados
---------------------------------
 * Nos primeiros testes ao se comunicar com a aplicação, o servidor não recebia o método HTTP esperado, ou seja, GET ou POST. Sempre era recebido da aplicação o método OPTIONS. Depois de pesquisar sobre o problema, percebeu-se que se tratava do uso de um mecanismo chamado "Cross-Origin Resource Sharing"(CORS) o qual adiciona um cabeçalho HTTP que diz para os navegadores dar para uma aplicação web rodando em uma origem, acesso para selecionar recursos de diferentes origens. A grosso modo, a aplicação envia para o servidor primeiramente uma requisição solicitando quais os métodos que o servidor suporta naquela rota, para então, depois da aprovação do servidor, envia o requisição de verdade. Desta forma, utilizou-se da biblioteca "flask_cors" que trás este mecanismo para o flask.
 * Para que a aplicação possa ter acesso ao servidor fora da rede WiFi do edifício, usou-se o ngrok como forma de externalizar o servidor.
 * Com o uso do socket.io, o problema do uso do mecanismo CORS voltou a acontecer. Procurando a documentação, teoricamente a biblioteca "flask-socketIO" já trata internamente do uso desse mecanismo, mas não era o que estava acontecendo no nosso caso. A solução para o problema foi inicializar o parâmetro "cors_allowed_origins" de tal forma que qualquer um possa ter acesso aos eventos socket. Para as rotas do servidor segue a mesma solução com o uso da biblioteca "flask-cors".
 * Com o servidor funcionando corretamente na Raspberry, o mesmo não estava preparado para casos em que houver duas entradas em dois dispositivos distintos, colocando o usuário nas duas salas ao mesmo tempo. Para que isso não ocorra, foi implementado uma saída automática da última sala do usuário antes na nova ocorrência, caso o mesmo estivesse com o status de "Entrada".
---------------------------------
### Links auxiliares
---------------------------------
 * Mecanismo CORS
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
 * Download biblioteca flask_cors
   * https://pypi.org/project/Flask-Cors/1.10.3/