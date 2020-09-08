# Projeto RFID
----------------------------------------------------------
<p> A motivação do projeto se deu a partir da experiência de um dos integrantes do grupo que trabalhou na Força Aérea, onde por solicitação do seu comandante, queria desenvolver um sistemas para monitoramento dos militares nos ambientes internos do quartel. A ideia inicial era que pudesse ter a localização de todos os militares em casos onde fosse preciso fazer a evacuação do local. Como se trata de uma unidade de controle de tráfego aéreo, que é de extrema importância para o país, em caso de bombardeio estratégico, incêndio ou outros incidentes. Foi pensado em um monitoramento de todos os militares dentro da unidade, onde é possível identificar a localização exata dos mesmos, como andar e sala. Com isso foi chamada uma empresa que trabalhava com Geolocalização, ela tinha uma solução de tecnologia: o reconhecimento facial, porém essa é uma solução muito cara, dessa maneira no IBTI foi verificado que é possível atender essa demanda com o uso de cartões RFID. 

  Em ambientes controlados, faz sentido o uso da tecnologia RFID para este fim, por ser um dispositivo bom, preciso e de custo acessível. Como o RFID é economicamente acessível, além de facilmente encontrado, vimos uma oportunidade de começar um projeto que já se tinha uma demanda no mercado. Além disso, vimos a possibilidade de expandir sua funcionalidade para demais ambientes como o corporativo e de condomínios.</p>

  Tendo em vista o que formou os pilares deste projeto, temos o escopo abaixo:

<ul>
	<li>Usuários cadastrados associados a uma tag/cartão RFID</li>
	<li>Dispositivos leitores de RFID conectados com a rede WiFi local, localizados em cada ambiente a ser monitorado</li>
	<li>Banco de dados para guardar os dados de cada usuário, dispositivo, cartão e ocorrência</li>
	<li>Servidor fazendo as pontes de comunicação entre as partes</li>
  <li>Página Web com as informações devidamente organizadas</li>
	
</ul>

<p> Após recolher todos estes dados, é preciso mostrar para o cliente de forma intuitiva as informações recolhidas. E é aí que entra a página web. Nela, será possível:</p>
 <p  align="center">
 Tabela: Funcionalidades na aplicação Web.
</p>
<p  align="center">
<img src="https://user-images.githubusercontent.com/65353733/92486344-5af24e00-f1c2-11ea-94f1-078afc7fbd9b.png">
</p>

<p>No cadastro do usuário é possível integrar a ele quais salas ele tem permissão de entrar e em quais horários ele tem essa permissão.
	

O sistema apresenta diversas  funcionalidades que se pode ter acesso, porém algumas funcionalidades são restritas a alguns usuários, o que fornece maior segurança para o sistema. Essa diferenciação é feita através do cargo associado a conta do usuário. Ao se cadastrar uma conta, é dado um cargo a mesma, que está atrelado a um nível de permissão no sistema. Tem-se os cargos por padrão do sistema, sendo possível criar novos cargos se necessário, mas por padrão são eles:
</p>

<p  align="center">
<img src="https://user-images.githubusercontent.com/65353733/92486306-4e6df580-f1c2-11ea-9634-2eda6290ec9d.png" >
</p>
 <p  align="center">
 Nível de Permissão por cargo padrão.
</p>

<p>
  Os detalhes de cada cargo podem ser encontrados na documentação da aplicação (Atualizar documentação quando concluído)
  
A partir de todas as ferramentas expostas acima, podemos tirar grande proveito das informações recolhidas, além de garantir uma maior segurança ao local em que for empregado com o mapeamento dos locais onde se deseja ter essa maior gerência do tráfego de usuários.

  Pelo fato de todos os dados serem guardados no banco de dados, é possível se ter um histórico de todos os movimentos dos usuários, mostrando seus horários de entrada e saída, assim como locais acessados. Além disso, tendo isso em mãos, pode-se ter acesso a quais momentos do dia a sala monitorada estava vazia e fazer uma projeção de qual seria a economia de energia caso haja o desligamento das luzes deste local nestes momentos.
  
  O exemplo acima se debruça sob o olhar analítico desses dados coletados. Podendo da mesma forma fazer a relação de comportamentos de seus usuários e entender mais sobre a cultura do local onde foi implementado. No geral, conclui-se que este projeto promove o monitoramento de áreas e acessos baseado nas informações acima, ampliando as possibilidades de gerência da empresa.
  </p>
