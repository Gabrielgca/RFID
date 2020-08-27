## Dispositivo e Comunicação

### Responsáveis:
  * Arley, Majid e Gabriel (Auxiliar)
----------------------------------------------------------
<h1>Dispositivo RFID</h1>
<p>O dispositivo monitora quem está no ambiente, para ter o controle de quantas pessoas estão no local e em qual setor. Todo este aparato é para garantir a segurança caso venha ocorrer alguma coisa que coloque a vida de qualquer usuário em risco. Todo o sistema foi projetado para garantir a segurança de todos dentro da organização, o monitoramento em tempo real faz com que qualquer providência tomada seja ágil e eficaz.</p>
<p>O dispositivo está conectado à rede para que toda essa informação seja mais eficaz, para que não seja perdida, está armazenando em uma base de dados onde é atualizado constantemente.</p>

<h2>Projeto</h2>
<p>Para o projeto foi usado os seguintes módulos:</p>
<table>
	<thead>
		<th>Nome</th>
		<th>Dispositivo</th>
	</thead>
	<tbody>
		<tr>
			<td>Controlador de acesso RC522</td>
			<td><img src="https://user-images.githubusercontent.com/32252053/90170632-b32a6180-dd76-11ea-93aa-c88b795aa0e8.jpg" width="300" heigth="300"></td>
		</tr>
		<tr>
			<td>Modulo WIFI ESP8266</td>
			<td><img src="https://user-images.githubusercontent.com/32252053/90171095-5b402a80-dd77-11ea-87f7-0c5b4de51277.jpg" width="300" heigth="300"></td>
		</tr>
		<tr>
			<td>Resistor de 10k</td>
			<td><img src="https://user-images.githubusercontent.com/32252053/90171705-44e69e80-dd78-11ea-867b-1126307d7ce7.jpg" width="300" heigth="300"</td>
		</tr>
		<tr>
			<td>Resistor de 200ohms</td>
			<td><img src="https://user-images.githubusercontent.com/32252053/90171813-71021f80-dd78-11ea-9ba9-5083f4988ef4.jpg" width="300" heigth="300"</td>
		</tr>
		<tr>
			<td>Led vermelho</td>
			<td><img src="https://user-images.githubusercontent.com/32252053/90171889-942ccf00-dd78-11ea-8aa0-27cf469df3d2.jpg" width="300" heigth="300"</td>
		</tr>
		<tr>
			<td>Led verde</td>
			<td><img src="https://user-images.githubusercontent.com/32252053/90172006-bfafb980-dd78-11ea-9766-f13e41f79529.png" width="300" heigth="300"</td>
		</tr>
		<tr>
			<td>Arduino Uno</td>
			<td><img src="https://user-images.githubusercontent.com/32252053/90172088-df46e200-dd78-11ea-8721-4dc703af73be.jpeg" width="300" heigth="300"</td>
		</tr>
		<tr>
			<td>Protoboard</td>
			<td><img src="https://user-images.githubusercontent.com/32252053/90172195-056c8200-dd79-11ea-8386-983121283269.jpg" width="300" heigth="300"</td>
		</tr>
		<tr>
			<td>Buzzer</td>
			<td><img src="https://user-images.githubusercontent.com/32252053/90172322-377de400-dd79-11ea-9f51-4688108a5e81.jpg" width="300" heigth="300"> </td>
		</tr>
</table>
<p>Todos este componentes em junção fazem o dispositivo ser eficaz, além de usar uma linguagem de programação poderosa. A IDE utilizada para desenvolver toda parte logica foi o Arduino, utilizando a linguagem de programação Sketch.</p>

<h3>Circuito Dispositivo WiFi</h3>

<p align="center">
  <img src="DispWiFiRFID.jpg" width="500" title="Disp WiFi">
</p>

<h3>Atividade do dispositivo</h3>
<ul>
	<li>Faz a leitura de um card RFID </li>
	<li>Envia a informação para um servidor</li>
	<li>Aponta se está cadastrado ou não com led vermelho/verde</li>
	<li>Conectado à rede do local</li>
</ul>
<p>O dispositivo está apenas responsável por fazer a leitura do card RFID e repassar para um servidor onde o mesmo vai estar fazendo todo o processo de cadastro e conferencia, enquanto o dispositivo vai apenas passar as tags para que seja feito a comparação no banco de dados, logo o servidor retorna com a resposta se está ou não cadastrado.</p>
