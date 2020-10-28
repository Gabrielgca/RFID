## Aplicação

### Responsáveis:

* Arley, Renato e Silvio

---

### Overview:

* Site desenvolvido para propiciar monitoramento de salas, bem como ferramenta administrativa contendo funções de gerenciamento de salas, usuários cadastrados, dispositivos e usuários do sistema em si.

---

### Recursos Utilizados:

* React: uma biblioteca de JavaScript para o desenvolvimento de UI. A escolha do uso desta biblioteca se deu por conta da praticidade da mesma, bem como a familiaridade com a linguagem utilizada e a facilidade de encontrar e desenvolver novas ferramentas para a mesma.
  + Axios: realiza requisições ao servidor; 
  + Material Design: linguagem de design desenvolvida pela Google, auxilia na criação dos layouts, fornecendo elementos já responsivos com uma estilização padrão que pode ser aproveitada ou redefinida; 
  + FuctBase64: realiza a conversão de imagens em Base64 e vice-versa; 
  + React Loader Spinner: componente de carregamento, literalmente. Um loading pronto com várias opções de design; 
  + React Router Dom: utilizada para realizar o controle da navegação do Web App, simulando uma navegação semelhante à dos apps mobile, facilitando assim o controle sobre a navegação e as propriedades de cada rota/tela.

  

* Firebase: plataforma Google para criação de apps móveis e da Web; 
  + Auth: realiza a autenticação de usuários no sistema.

---

### Layout:

* HOME
  + Setores cadastrados
  + Número de pessoas em cada setor
* DASHBOARD (Requer log-in)
  + Setores cadastrados
    - Imagem do setor
  + Número de pessoas em cada setor
    - Informações de cadastro de cada pessoa
  + CADASTRAMENTO
  + Log-out

<div>
<table>
  <tbody>
<tr>
<td>
  <p>Monitoramento de Salas</p>
  <img src="https://user-images.githubusercontent.com/32252053/97478338-8d513980-192f-11eb-8119-335c803a42cb.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Login</p>
 <img src="https://user-images.githubusercontent.com/32252053/97478712-0fd9f900-1930-11eb-95d9-39e7678afdf3.png" width="700" height="400"/>
</td>
<td>
 <p>Dashboard sem selecionar nenhuma sala</p>
 <img src="https://user-images.githubusercontent.com/32252053/97478993-7d862500-1930-11eb-9156-68b0fcee90ee.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Dashboard com a sala selecionada</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479000-7f4fe880-1930-11eb-8abc-173867eca167.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Informações do usuário que está na sala</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479237-cb029200-1930-11eb-8a3a-c7e524e6daad.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Controle de Cargos</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479243-cc33bf00-1930-11eb-8d2e-325026c9395f.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Detlhes do Cargo</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479252-cd64ec00-1930-11eb-97fa-ef3696bc7d2e.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Cadastro de Novo Cargo</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479259-cdfd8280-1930-11eb-8458-a8ed6aff0038.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Cadastro de Cargo</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479263-cf2eaf80-1930-11eb-886a-828944995b8f.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Cadastro de Cargo</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479263-cf2eaf80-1930-11eb-886a-828944995b8f.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Editar Informações de Cargo</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479267-cfc74600-1930-11eb-9af3-bcccfbc61384.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Novo Cargo</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479269-cfc74600-1930-11eb-98c4-985c3935da99.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Controle de dispositivo</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479271-d05fdc80-1930-11eb-8482-720a3307f88d.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Detalhe do dispositivo</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479272-d05fdc80-1930-11eb-94f9-5752714bb3ec.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Controle de dispositivo RFID</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479273-d0f87300-1930-11eb-9111-6cad7d962503.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Controle de setores</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479274-d0f87300-1930-11eb-9109-061f5535d7ed.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Editar Setor</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479278-d1910980-1930-11eb-8737-2b8712eb6bdf.png" width="400" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Cadastrar novo Setor</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479281-d1910980-1930-11eb-951b-129cba5a1d16.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Usuário RFID</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479284-d229a000-1930-11eb-85a5-1820d263038d.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Cadastrar novo usuário</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479287-d229a000-1930-11eb-8caf-7fef00d73f2c.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Cadastrar novo usuário RFID recebido pela aplicação</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479288-d229a000-1930-11eb-8c10-852e34aed178.png" width="700" height="400"/>
</td>
</tr>

<tr>
<td>
 <p>Menu com todas as permissões disponivel</p>
 <img src="https://user-images.githubusercontent.com/32252053/97479290-d2c23680-1930-11eb-96b8-371c40dfdcbc.png" width="90" height="400"/>
</td>
</tr> 
</table>
</div>

*Mais informações no arquivo 'Definições da Aplicação.txt'.*
