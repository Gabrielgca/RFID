## Servidor
---------------------------------
### Responsáveis
* Gabriel, Renato e Saulo

---------------------------------
### Overview
* O servidor recebe dados dos dispositivos RFID e da aplicação, bem como envia dados para os mesmos e provém a comunicação entre estes e o banco de dados. Foi feito de forma que a comunicação com a aplicação seja ininterrupta e atualize assim que ocorrer qualquer disparo de sinal de qualquer dispositivo, transmitindo a informação o mais rápido possível. Além disso, o servidor é capaz de se comunicar com os dispositivos independentemente da conexão com a aplicação.
  
---------------------------------
### Pontes de comunicação
 * Aplicação e Dispositivo WiFi
   * Flask
     * Flask_CORS
     * Flask_SocketIO
   * Protocolo HTTP
 * Banco de dados
   * MySQL
   * SQLAlchemy

<p align="center">
  <img src="ServidorRFIDV2.png" width="500" title="Servidor RFID">
</p>

---------------------------------
### Arquivos desenvolvidos
 * serverRFID_V2_Socket.py
   * Servidor em si com as rotas de comunicação com o dispositivo e aplicação. Utiliza o SQLAlchemy para se comunicar com o banco de dados, contém o mapeamento do banco, faz comunicação via websocket com a aplicação e comunicação com os dispositivos via rotas Flask. Código inclui rotina para lidar com o fechamento de sessões.
 * db_commands_v2.py
   * Biblioteca contendo todos os comandos do SQLAlchemy utilizados para a comunicação com o banco de dados.

---------------------------------
### Problemas encontrados
 * Nos primeiros testes ao se comunicar com a aplicação, o servidor não recebia o método HTTP esperado, ou seja, GET ou POST. Sempre era recebido da aplicação o método OPTIONS. Depois de pesquisar sobre o problema, percebeu-se que se tratava do uso de um mecanismo chamado "Cross-Origin Resource Sharing"(CORS) o qual adiciona um cabeçalho HTTP que diz para os navegadores dar para uma aplicação web rodando em uma origem, acesso para selecionar recursos de diferentes origens. A grosso modo, a aplicação envia para o servidor primeiramente uma requisição solicitando quais os métodos que o servidor suporta naquela rota, para então, depois da aprovação do servidor, envia o requisição de verdade. Desta forma, utilizou-se da biblioteca "flask_cors" que trás este mecanismo para o flask.
 * Ao passar o servidor para a Raspberry, onde seria hospedado por definitivo, erros foram encontrados, podendo ser causados pelo processamento da Raspberry. Um destes erros é a queda do servidor quando recebia muitas requisições ao mesmo tempo. Isto ocorria pelo fato da aplicação estar enviando requisições automáticas a cada segundo, que se chocavam com outras requisições. Isto foi feito com o intuito de sempre estar com os dados atualizados na página web sem a necessidade de atualizar a página. Este problema foi resolvido separando a comunicação do servidor com a aplicação da comunicação do servidor com os dispositivos, implementando comunicação via websocket para o primeiro. Isto não apenas evitou que houvesse o choque de comunicação entre as três partes, mas também possibilitou a atualização em tempo real da aplicação, o que é ideal para a questão da segurança em monitoramento de usuários.
 * Após o estabelecimento da conexão com o banco, através do SQLAlchemy, é necessário criar uma sessão, também do SQLAlchemy, que basicamente é uma persistência em que os comandos são comunicados para o banco. Porém, como criávamos uma sessão só, que teoricamente existia durante todo o ciclo de vida do servidor, esta sessão acabava expirando com o tempo, tornando-se inativa, incapaz de enviar novos comandos para o banco. Como solução, foi implementado uma rotina no código em que, uma nova sessão é instanciada toda vez que um novo comando é executado, e encerrada após execução deste.
 * Com o servidor funcionando corretamente na Raspberry, o mesmo não estava preparado para casos em que houver duas entradas em dois dispositivos distintos, colocando o usuário nas duas salas ao mesmo tempo. Para que isso não ocorra, foi implementado uma saída automática da última sala do usuário antes na nova ocorrência, caso o mesmo estivesse com o status de "Entrada".
---------------------------------
### Links auxiliares
 * Mecanismo CORS
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
 * Download biblioteca flask_cors
   * https://pypi.org/project/Flask-Cors/1.10.3/
