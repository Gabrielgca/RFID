## Aplicação

### Responsáveis:

* Arley, Renato e Silvio

---

### Overview:

* Aplicação desenvolvido para propiciar monitoramento de salas e usuários, bem como ferramenta administrativa contendo funções de gerenciamento de salas, usuários cadastrados, dispositivos e usuários do sistema em si.

---

### Recursos Utilizados:

* React JS: uma biblioteca de JavaScript para o desenvolvimento de UI. A escolha do uso desta biblioteca se deu por conta da praticidade da mesma, bem como a familiaridade com a linguagem utilizada e a facilidade de encontrar e desenvolver novas ferramentas para a mesma.
  + Axios: realiza requisições ao servidor; 
  + Material Design: linguagem de design desenvolvida pela Google, auxilia na criação dos layouts, fornecendo elementos já responsivos com uma estilização padrão que pode ser aproveitada ou redefinida; 
  + FuctBase64: realiza a conversão de imagens em Base64 e vice-versa; 
  + React Loader Spinner: componente de carregamento, literalmente. Um loading pronto com várias opções de design; 
  + React Router Dom: utilizada para realizar o controle da navegação do Web App, simulando uma navegação semelhante à dos apps mobile, facilitando assim o controle sobre a navegação e as propriedades de cada rota/tela.
  + Socket.io: para fazer a atualizacão em tempo real dos dados.


  

* Firebase: plataforma Google para criação de apps móveis e da Web; 
  + Auth: realiza a autenticação de usuários no sistema.
  + Permissões: verifica se o usuário tem as permissões estabelecida pelas regras de negocio.

---

### Layout:


<div>
<table>
  <tbody>
<tr>
  <td>
    <h3 align="center">Monitoramento de Salas</h3>
     <p>
     <ul>
      <li>Setores cadastrados</li>
      <li>Número de pessoas em cada setor</li>
     </ul>
     </p>
    <img src="https://user-images.githubusercontent.com/32252053/97478338-8d513980-192f-11eb-8119-335c803a42cb.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Login</h3>
    <p>
    <ul>
      <li>Acesso a Dashboard</li>
      <li>Campos de Login e Senha</li>
    </ul>
    </p>
    <img src="https://user-images.githubusercontent.com/32252053/97478712-0fd9f900-1930-11eb-95d9-39e7678afdf3.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Dashboard sem selecionar nenhuma sala</h3>
    <p>
    <ul>
      <li>Nome do usuário logado no canto superior direito</li>
      <li>Setores cadastrados</li>
      <li>Quantidade de pessoas nos setores</li>
      <li>Imagem da sala</li>
    </ul>
    </p>
    <img src="https://user-images.githubusercontent.com/32252053/97478993-7d862500-1930-11eb-9156-68b0fcee90ee.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Dashboard com a sala selecionada</h3>
    <p>
      <ul>
        <li>Mostra a imagem quando clicado no setor</li>
      </ul>
    </p>
    <img src="https://user-images.githubusercontent.com/32252053/97479000-7f4fe880-1930-11eb-8abc-173867eca167.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Informações do usuário que está na sala</h3>
    <p>
      <ul>
        <li>Informações do usuário que está no setor/sala</li>
      </ul>
    </p>
    <img src="https://user-images.githubusercontent.com/32252053/97479237-cb029200-1930-11eb-8a3a-c7e524e6daad.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Controle de Cargos</h3>
    <p>
    <ul>
      <li>Editar</li>
        <ul>
          <li>Cargo</li>
        </ul>
      <li>Desativa/Reativa cargo</li>
      <li>Pesquisa cargo</li>
      <li>Adiciona novo cargo</li>
    </ul>
    </p>
    <img src="https://user-images.githubusercontent.com/32252053/97479243-cc33bf00-1930-11eb-8d2e-325026c9395f.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Detalhes do Cargo</h3>
    <img src="https://user-images.githubusercontent.com/32252053/97479252-cd64ec00-1930-11eb-97fa-ef3696bc7d2e.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Cadastro de Novo Cargo</h3>
    <ul>
      <li>Nome do novo cargo</li>
      <li>Propriedades do cargo</li>
    </ul>
    <img src="https://user-images.githubusercontent.com/32252053/97479259-cdfd8280-1930-11eb-8458-a8ed6aff0038.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Usuário de Conta</h3>
    <ul>
      <li>Editar</li>
        <ul>
          <li>Nome</li>
          <li>Cargo</li>
        </ul>
      <li>Desativar/Reativar usuário</li>
      <li>Adicionar</li>
      <li>Pesquisar</li>
    </ul>
    <img src="https://user-images.githubusercontent.com/32252053/97479263-cf2eaf80-1930-11eb-886a-828944995b8f.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Editar Informações de Cargo</h3>
    <img src="https://user-images.githubusercontent.com/32252053/97479267-cfc74600-1930-11eb-9af3-bcccfbc61384.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Novo Usuário</h3>
    <ul>
      <li>Nome</li>
      <li>E-mail</li>
      <li>Senha</li>
      <li>Cargo</li>
    </ul>
    <img src="https://user-images.githubusercontent.com/32252053/97479269-cfc74600-1930-11eb-98c4-985c3935da99.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Controle de dispositivo</h3>
    <ul>
      <li>Editar</li>
        <ul>
          <li>Descrição do dispositivo</li>
          <li>Localização</li>
        </ul>
      <li>Desativar e Reativar</li>
      <li>Cadastrar</li>
      <li>Pesquisar</li>
    </ul>
    <img src="https://user-images.githubusercontent.com/32252053/97479271-d05fdc80-1930-11eb-8482-720a3307f88d.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Detalhe do dispositivo</h3>
    <img src="https://user-images.githubusercontent.com/32252053/97479272-d05fdc80-1930-11eb-94f9-5752714bb3ec.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Cadastro de dispositivo RFID</h3>
    <ul>
      <li>Descrição do dispositivo</li>
      <li>Localização</li>
      <li>Status</li>
    </ul>
    <img src="https://user-images.githubusercontent.com/32252053/97479273-d0f87300-1930-11eb-9111-6cad7d962503.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Controle de setores</h3>
    <ul>
      <li>Editar</li>
        <ul>
          <li>Imagem</li>
          <li>Nome da Empresa</li>
          <li>Nome da Sala</li>
          <li>Área</li>
          <li>Andar</li>
        </ul>
      <li>Desativar/Reativar</li>
      <li>Adicionar novo setor</li>
      <li>Pesquisar</li>
    </ul>
    <img src="https://user-images.githubusercontent.com/32252053/97479274-d0f87300-1930-11eb-9109-061f5535d7ed.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Editar Setor</h3>
    <img src="https://user-images.githubusercontent.com/32252053/97479278-d1910980-1930-11eb-8737-2b8712eb6bdf.png" width="500" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Cadastrar novo Setor</h3>
    <ul>
      <li>Imagem do Setor</li>
      <li>Nome da empresa</li>
      <li>Nome ou numero da sala</li>
      <li>Área</li>
      <li>Andar</li>
    </ul>
    <img src="https://user-images.githubusercontent.com/32252053/97479281-d1910980-1930-11eb-951b-129cba5a1d16.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Usuário RFID</h3>
    <ul>
      <li>Editar</li>
        <ul>
          <li>Imagem</li>
          <li>Nome</li>
          <li>Função</li>
          <li>Permissões de entrada</li>
          <li>Adicionar nova permissão</li>
        </ul>
      <li>Desativar/Reativar</li>
      <li>Adicionar</li>
      <li>Pesquisar</li>
    </ul>
    <img src="https://user-images.githubusercontent.com/32252053/97479284-d229a000-1930-11eb-85a5-1820d263038d.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Cadastrar novo usuário</h3>
    <ul>
      <li>Código RFID</li>
      <li>Foto 3x4</li>
      <li>Nome</li>
      <li>Idade</li>
      <li>Função</li>
      <li>Sala</li>
      <li>Horario de entrada e saída</li>
    </ul>
    <img src="https://user-images.githubusercontent.com/32252053/97479287-d229a000-1930-11eb-8caf-7fef00d73f2c.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Cadastrar novo usuário RFID recebido pela aplicação</h3>
    <img src="https://user-images.githubusercontent.com/32252053/97479288-d229a000-1930-11eb-8c10-852e34aed178.png" width="1000" height="500"/>
  </td>
</tr>

<tr>
  <td>
    <h3 align="center">Menu com todas as permissões disponivel</h3>
    <img src="https://user-images.githubusercontent.com/32252053/97479290-d2c23680-1930-11eb-96b8-371c40dfdcbc.png" width="90" height="500"/>
  </td>
</tr> 

<tr>
  <td>
    <h3 align="center">Tabela de permissões por cargo relativa às contas de gerenciamento da aplicação.</h3>
    <img src="Permissões e Cargos.jpg" align="center"/>
  </td>
</tr>
</table>
</div>
