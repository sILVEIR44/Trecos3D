const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ShadingType,
} = require("docx");
const fs = require("fs");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function titulo(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 500, after: 200 },
  });
}

function categoria(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 160 },
  });
}

function pergunta(text) {
  return new Paragraph({
    children: [new TextRun({ text: `❓ ${text}`, bold: true, size: 23, color: "7C3AED" })],
    spacing: { before: 260, after: 80 },
    shading: { type: ShadingType.CLEAR, fill: "F5F3FF" },
    indent: { left: 200 },
  });
}

function resposta(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    spacing: { after: 120 },
    indent: { left: 360 },
  });
}

function rBold(label, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22 }),
      new TextRun({ text, size: 22 }),
    ],
    spacing: { after: 100 },
    indent: { left: 360 },
  });
}

function codigo(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Courier New", size: 18 })],
    indent: { left: 560 },
    spacing: { after: 60 },
    shading: { type: ShadingType.CLEAR, fill: "F0F0F0" },
  });
}

function bullet(text) {
  return new Paragraph({
    children: [new TextRun({ text: `• ${text}`, size: 22 })],
    indent: { left: 560 },
    spacing: { after: 80 },
  });
}

function separador() {
  return new Paragraph({
    children: [new TextRun({ text: "─────────────────────────────────────────────────────────", size: 16, color: "DDDDDD" })],
    spacing: { before: 160, after: 160 },
  });
}

function espaco() {
  return new Paragraph({ text: "", spacing: { after: 100 } });
}

// ─── Conteúdo ────────────────────────────────────────────────────────────────

const sec = [];

// CAPA
sec.push(
  new Paragraph({
    children: [new TextRun({ text: "Trecos3D", bold: true, size: 60, color: "9810FA" })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 1000, after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Perguntas & Respostas — Preparação para Defesa", bold: true, size: 28 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Documento de preparação para apresentação ao professor", size: 22, italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 800 },
  }),
  separador(),
);

// ÍNDICE
sec.push(
  titulo("Categorias de Perguntas"),
  resposta("1. Perguntas Gerais sobre o Projeto"),
  resposta("2. Perguntas sobre o Frontend (React Native / Expo)"),
  resposta("3. Perguntas sobre o Backend (Node.js / Express)"),
  resposta("4. Perguntas sobre o Banco de Dados"),
  resposta("5. Perguntas sobre Segurança e Autenticação"),
  resposta("6. Perguntas sobre Bibliotecas e Justificativas"),
  resposta("7. Perguntas sobre Funcionalidades Específicas"),
  resposta("8. Perguntas sobre Erros e Tratamento de Exceções"),
  resposta("9. Perguntas Técnicas Avançadas"),
  resposta("10. Perguntas sobre Boas Práticas e Decisões de Projeto"),
  separador(),
);

// ══════════════════════════════════════════════
// 1. PERGUNTAS GERAIS
// ══════════════════════════════════════════════
sec.push(
  titulo("1. Perguntas Gerais sobre o Projeto"),

  pergunta("O que é o Trecos3D? Explique o projeto em uma frase."),
  resposta("É um aplicativo mobile para uma loja de impressão 3D onde clientes podem comprar produtos prontos, solicitar orçamentos para peças personalizadas e acompanhar seus pedidos — tudo gerenciado por um painel administrativo."),
  separador(),

  pergunta("Quais são os dois tipos de usuário do sistema?"),
  resposta("Cliente (role 'user') e Administrador (role 'admin' ou 'superadmin'). O cliente navega na loja, compra e solicita orçamentos. O admin gerencia produtos, aprova/rejeita orçamentos e acompanha pedidos."),
  separador(),

  pergunta("Qual a diferença entre 'admin' e 'superadmin'?"),
  resposta("Atualmente, as permissões são as mesmas — ambos têm acesso ao painel completo. A distinção 'superadmin' existe na estrutura para permitir hierarquia futura (ex: o superadmin poderia gerenciar outros admins). A tab de 'Produtos' e 'Orçamentos' no painel usa href: isAdmin ? undefined : null para esconder do superadmin caso necessário no futuro."),
  separador(),

  pergunta("Como o sistema sabe se o usuário é cliente ou admin ao fazer login?"),
  resposta("O servidor retorna o campo 'role' do usuário junto com o token JWT. O app armazena esse role no AuthContext. O _layout.tsx de cada grupo de telas verifica: se role === 'user', redireciona para /(app)/home. Se for admin/superadmin, vai para /(admin)/dashboard."),
  separador(),

  pergunta("O projeto funciona em iOS e Android?"),
  resposta("Sim. O React Native gera código nativo para ambas as plataformas a partir do mesmo código TypeScript. Com Expo, é possível testar nos dois sistemas usando o aplicativo 'Expo Go' sem precisar compilar o app."),
  separador(),

  pergunta("Qual é o fluxo completo desde cadastro até finalizar um pedido?"),
  bullet("1. Usuário se cadastra com nome, email, telefone e senha"),
  bullet("2. Faz login — recebe token JWT"),
  bullet("3. Navega pela loja, adiciona produtos ao carrinho"),
  bullet("4. No carrinho, ajusta quantidades e toca em 'Finalizar Pedido'"),
  bullet("5. O app envia os itens para o servidor"),
  bullet("6. Servidor salva o pedido e cada item individualmente"),
  bullet("7. Se 10+ itens, aplica 10% de desconto automaticamente"),
  bullet("8. Pedido fica com status 'preparing' (Em Produção)"),
  bullet("9. Cliente acompanha em Perfil → Meus Pedidos"),
  separador(),
);

// ══════════════════════════════════════════════
// 2. FRONTEND
// ══════════════════════════════════════════════
sec.push(
  titulo("2. Perguntas sobre o Frontend"),

  pergunta("O que é React Native e por que foi escolhido?"),
  resposta("React Native é um framework do Meta que permite criar apps mobile para Android e iOS usando JavaScript/TypeScript. Foi escolhido porque: (1) um único código funciona nos dois sistemas, (2) a equipe já conhecia React, (3) tem grande comunidade e suporte, (4) o Expo simplifica muito o desenvolvimento e os testes."),
  separador(),

  pergunta("O que é o Expo e qual a diferença dele para o React Native puro?"),
  resposta("Expo é uma plataforma em cima do React Native que facilita o desenvolvimento. Sem Expo, seria necessário configurar Android Studio, Xcode, e lidar com código nativo (Java/Kotlin/Swift). Com Expo, basta instalar as dependências e rodar 'npx expo start' — o app aparece no celular via Expo Go. O Expo também oferece bibliotecas prontas como expo-image-picker e expo-linear-gradient."),
  separador(),

  pergunta("O que é TypeScript e por que usá-lo em vez de JavaScript?"),
  resposta("TypeScript é JavaScript com tipagem estática. Com TypeScript, você declara o tipo de cada variável e o compilador avisa erros antes de rodar o código — por exemplo, se você tentar acessar .toFixed() em algo que pode ser string. No projeto, isso é essencial: tipos como 'User', 'Pedido' e 'ProdutoCarrinho' deixam claro o formato dos dados e previnem bugs."),
  separador(),

  pergunta("O que é o Expo Router e como ele funciona?"),
  resposta("Expo Router é um sistema de navegação baseado em arquivos. Cada arquivo .tsx dentro de src/app/ vira uma rota automaticamente. A pasta (app) com parênteses cria um grupo — as telas dentro compartilham um layout mas o nome da pasta não aparece na URL. O arquivo _layout.tsx define como as telas desse grupo se organizam (tab bar, proteção de acesso, etc.)."),
  separador(),

  pergunta("O que é Context API? Por que usamos em vez de passar props?"),
  resposta("Context API é o sistema do React para compartilhar estado global entre componentes sem precisar passar props de pai para filho para neto. No projeto, temos 3 contextos: AuthContext (usuário logado), CartContext (carrinho de compras) e ThemeContext (tema claro/escuro). Sem Context, o carrinho teria que ser passado como prop por todas as telas intermediárias até chegar onde é usado — isso se chama 'prop drilling' e deixa o código confuso."),
  separador(),

  pergunta("O que são Hooks do React? Cite os usados no projeto."),
  resposta("Hooks são funções especiais do React que permitem usar estado e outras funcionalidades em componentes funcionais. Os principais usados:"),
  bullet("useState: guarda e atualiza valores (ex: lista de produtos, formulários)"),
  bullet("useEffect: executa código em momentos específicos (ex: buscar dados ao abrir a tela)"),
  bullet("useContext: acessa um contexto (ex: AuthContext, CartContext)"),
  bullet("useTheme: hook customizado que chama useContext(ThemeContext)"),
  bullet("useFonts: carrega fontes do Google"),
  bullet("useLocalSearchParams: lê parâmetros da rota (ex: o ID do pedido)"),
  separador(),

  pergunta("Como funciona o useEffect com array vazio []?"),
  resposta("O segundo argumento do useEffect é a lista de dependências. Quando é [] (array vazio), o efeito roda uma única vez quando o componente é montado (tela abre). Quando a lista tem variáveis, o efeito roda novamente sempre que aquelas variáveis mudam. Sem o array, o efeito roda em toda re-renderização — o que causaria um loop infinito se ele atualizar o estado."),
  separador(),

  pergunta("O que é o StyleSheet.create() do React Native?"),
  resposta("É a forma do React Native de definir estilos, parecida com CSS mas em JavaScript. StyleSheet.create() não é obrigatório — você pode passar um objeto inline — mas ele otimiza performance ao processar os estilos uma vez, e o TypeScript consegue validar os valores. Os estilos usam camelCase (backgroundColor em vez de background-color) e valores numéricos para medidas (não px)."),
  separador(),

  pergunta("Como funciona o modo claro/escuro (tema)?"),
  resposta("O ThemeContext define dois objetos de cores: lightColors e darkColors. O estado isDark determina qual usar. Quando o usuário ativa o Switch no Perfil, toggleTheme() inverte isDark. Todas as telas que chamam useTheme() recebem o objeto 'colors' atualizado automaticamente — por isso todos os estilos usam colors.background em vez de '#F5F5F5' diretamente."),
  separador(),

  pergunta("O que é o FlatList e qual a vantagem sobre map()?"),
  resposta("FlatList é um componente do React Native otimizado para listas longas. A diferença chave: FlatList usa 'virtualização' — renderiza apenas os itens visíveis na tela e destrói os que saem de vista. Com map(), todos os itens são renderizados de uma vez, o que pode deixar o app lento com listas grandes. No projeto, a tela de Meus Pedidos usa FlatList, enquanto a Home usa map() (quantidade de produtos tende a ser pequena e controlada)."),
  separador(),

  pergunta("O que é o Modal usado na tela Home?"),
  resposta("Modal é um componente do React Native que exibe uma sobreposição na frente de todo o resto da tela. Quando o usuário toca no produto, setProdutoSelecionado(item) define o produto e o Modal torna-se visível (visible={produtoSelecionado !== null}). Isso evita criar uma tela separada só para exibir os detalhes do produto. O animationType='slide' faz ele subir de baixo, simulando uma sheet drawer."),
  separador(),
);

// ══════════════════════════════════════════════
// 3. BACKEND
// ══════════════════════════════════════════════
sec.push(
  titulo("3. Perguntas sobre o Backend"),

  pergunta("O que é Node.js e por que usar no backend?"),
  resposta("Node.js é um ambiente de execução JavaScript no servidor. Antes dele, JavaScript só rodava no navegador. Escolhemos Node.js porque: (1) mesma linguagem no frontend e backend, (2) muito rápido para operações de I/O (leitura/escrita, chamadas ao banco), (3) npm tem milhares de bibliotecas prontas, (4) é amplamente usado no mercado."),
  separador(),

  pergunta("O que é Express e o que ele faz?"),
  resposta("Express é um framework minimalista para criar servidores HTTP com Node.js. Ele fornece: roteamento (definir o que acontece em cada URL), middlewares (funções que processam requisições), e manipulação de JSON. Sem Express, seria necessário usar o módulo 'http' nativo do Node.js, que é muito mais trabalhoso."),
  separador(),

  pergunta("O que é uma rota (endpoint) REST?"),
  resposta("Uma rota é uma combinação de método HTTP + caminho URL que o servidor responde. Os métodos usados no projeto:"),
  bullet("GET: buscar dados (ex: GET /products = listar produtos)"),
  bullet("POST: criar dados (ex: POST /orders = criar pedido)"),
  bullet("PUT: atualizar dados (ex: PUT /quotes/:id/status = aprovar orçamento)"),
  bullet("DELETE: excluir dados (ex: DELETE /quotes/:id = cancelar orçamento)"),
  separador(),

  pergunta("O que é um middleware no Express?"),
  resposta("Middleware é uma função que fica no meio entre a requisição e a resposta. Tem acesso aos objetos req (requisição), res (resposta) e next (função para continuar). No projeto:"),
  bullet("express.json() — middleware que converte o corpo da requisição de JSON para objeto JavaScript"),
  bullet("cors() — middleware que adiciona os headers CORS"),
  bullet("verificarToken — middleware customizado que valida o JWT antes de executar a rota"),
  bullet("upload.single('file') — middleware do Multer que processa o arquivo enviado"),
  separador(),

  pergunta("O que é uma query parametrizada e por que é importante?"),
  resposta("É uma consulta SQL onde os valores são passados separados do texto SQL, usando placeholders ($1, $2...). Por exemplo:"),
  codigo("db.query('SELECT * FROM users WHERE email = $1', [email])"),
  resposta("A alternativa insegura seria concatenar diretamente:"),
  codigo("db.query('SELECT * FROM users WHERE email = \\'' + email + '\\'') // PERIGOSO"),
  resposta("Com concatenação, um usuário malicioso poderia digitar ' OR 1=1 -- no campo de email e acessar todos os dados (SQL Injection). A query parametrizada trata o valor como dado puro, nunca como parte do SQL."),
  separador(),

  pergunta("O que é async/await e por que é usado nas rotas?"),
  resposta("Operações como consultas ao banco e uploads de arquivos são assíncronas — levam tempo para completar. Sem async/await, seria necessário usar callbacks ou Promises encadeadas (.then()). O async/await deixa o código assíncrono legível como se fosse síncrono: 'await db.query(...)' pausa a execução até o resultado chegar, sem bloquear o servidor."),
  separador(),

  pergunta("O que acontece se houver um erro no servidor? Como é tratado?"),
  resposta("As rotas são envoltas em blocos try/catch. Se qualquer operação lançar um erro (ex: banco offline, dados inválidos), o catch captura e retorna um status HTTP de erro com mensagem JSON. Por exemplo, status 400 para erro do cliente (dados faltando), 401 para não autenticado, 403 para sem permissão, 404 para não encontrado, 500 para erro interno do servidor."),
  separador(),

  pergunta("O que é Promise.all() e onde é usado?"),
  resposta("Promise.all() recebe um array de Promises e as executa em paralelo, aguardando todas terminarem. Usado no dashboard para fazer 3 consultas ao banco ao mesmo tempo:"),
  codigo("const [revenue, quotes, products] = await Promise.all(["),
  codigo("  db.query('SELECT COUNT(*), SUM(total_value) FROM orders'),"),
  codigo("  db.query(\"SELECT COUNT(*) FROM quotes WHERE status = 'pending'\"),"),
  codigo("  db.query('SELECT COUNT(*) FROM products'),"),
  codigo("]);"),
  resposta("Sem Promise.all(), as 3 queries rodariam em sequência, somando os tempos. Com ele, o tempo total é o da query mais lenta."),
  separador(),

  pergunta("O que é o arquivo .env e por que não commitamos ele no Git?"),
  resposta("O .env é um arquivo que guarda variáveis de ambiente sensíveis: JWT_SECRET, SUPABASE_URL, SUPABASE_KEY, DATABASE_URL. Se esse arquivo fosse para o GitHub (público), qualquer pessoa poderia acessar o banco de dados do projeto. Por isso está no .gitignore. Ao clonar o projeto, o desenvolvedor precisa criar seu próprio .env com as credenciais corretas."),
  separador(),
);

// ══════════════════════════════════════════════
// 4. BANCO DE DADOS
// ══════════════════════════════════════════════
sec.push(
  titulo("4. Perguntas sobre o Banco de Dados"),

  pergunta("O que é PostgreSQL e por que foi escolhido?"),
  resposta("PostgreSQL é um banco de dados relacional open source, considerado o mais avançado do mercado. Escolhido por: (1) suporte completo a SQL com funções avançadas (ROW_NUMBER, LEFT JOIN), (2) tipagem forte (NUMERIC, VARCHAR), (3) integridade referencial, (4) gratuito e muito confiável, (5) o Supabase oferece PostgreSQL gerenciado na nuvem com plano gratuito."),
  separador(),

  pergunta("O que é o Supabase?"),
  resposta("Supabase é uma plataforma BaaS (Backend as a Service) que oferece: (1) banco PostgreSQL gerenciado na nuvem, (2) Storage para arquivos (usamos para as fotos dos orçamentos), (3) autenticação pronta (não usamos — implementamos nossa própria com JWT). O plano gratuito foi suficiente para o projeto."),
  separador(),

  pergunta("Por que existe a tabela order_items separada de orders?"),
  resposta("Um pedido pode ter vários produtos. Se colocássemos os itens dentro da tabela orders (como uma coluna JSON, por exemplo), perderia a normalização e ficaria difícil consultar. Com order_items separada: (1) cada produto do pedido tem sua linha, (2) é possível somar, filtrar e agregar os itens com SQL, (3) o histórico do nome e preço do produto fica preservado mesmo que o produto seja editado depois."),
  separador(),

  pergunta("Por que os itens do pedido guardam o título e preço em vez de uma referência ao produto?"),
  resposta("Porque produtos podem ser editados ou deletados depois da compra. Se armazenássemos apenas product_id, e o admin alterasse o preço ou deletasse o produto, o histórico do pedido ficaria errado ou quebraria. Ao guardar product_title e unit_price no momento da compra, o histórico é imutável e sempre reflete o que o cliente realmente pagou — é uma prática padrão em sistemas de e-commerce."),
  separador(),

  pergunta("O que é um PRIMARY KEY e o SERIAL?"),
  resposta("PRIMARY KEY é a coluna que identifica unicamente cada registro na tabela — não pode ser nula nem repetir. SERIAL é um tipo especial do PostgreSQL que auto-incrementa: o banco gera automaticamente 1, 2, 3... a cada inserção, sem precisar passar o valor manualmente."),
  separador(),

  pergunta("O que é um LEFT JOIN? Por que usamos em vez de INNER JOIN?"),
  resposta("JOIN combina linhas de duas tabelas. INNER JOIN retorna apenas os registros que têm correspondência nas duas tabelas. LEFT JOIN retorna todos os registros da tabela esquerda, mesmo que não haja correspondência na direita (nesse caso, os campos da direita ficam NULL). Usamos LEFT JOIN em orders/quotes → users para que pedidos e orçamentos apareçam mesmo que o usuário tenha sido deletado do banco."),
  separador(),

  pergunta("O que é ROW_NUMBER() OVER (PARTITION BY)?"),
  resposta("É uma função de janela (window function) do PostgreSQL. ROW_NUMBER() numera os registros. PARTITION BY divide os registros em grupos antes de numerar. Com PARTITION BY user_id, cada usuário tem sua própria numeração independente: o primeiro pedido do usuário A é #1, o segundo é #2 — mesmo que existam pedidos de outros usuários entre eles no banco. Assim cada cliente vê seus pedidos numerados a partir de 1."),
  separador(),

  pergunta("O que é COALESCE e onde é usado?"),
  resposta("COALESCE retorna o primeiro valor não-nulo de uma lista. Usado no dashboard:"),
  codigo("COALESCE(SUM(total_value), 0)"),
  resposta("Se não houver nenhum pedido, SUM retorna NULL. COALESCE converte esse NULL para 0, evitando que o app receba null e quebre ao tentar fazer cálculos."),
  separador(),
);

// ══════════════════════════════════════════════
// 5. SEGURANÇA
// ══════════════════════════════════════════════
sec.push(
  titulo("5. Perguntas sobre Segurança e Autenticação"),

  pergunta("Como a senha do usuário é protegida?"),
  resposta("Com bcrypt. Ao cadastrar, a senha passa por bcrypt.hash(password, 10) — o número 10 é o 'salt rounds', quanto mais alto mais seguro (e mais lento). O resultado é uma string embaralhada irreversível. No login, bcrypt.compare(senhaDigitada, hashSalvo) compara sem revelar a original. Mesmo que alguém acesse o banco diretamente, não consegue descobrir as senhas."),
  separador(),

  pergunta("O que é JWT e como funciona no projeto?"),
  resposta("JWT (JSON Web Token) é um padrão para criar tokens de autenticação. Tem 3 partes separadas por ponto: Header (algoritmo), Payload (dados: userId e role), Signature (assinatura com a chave secreta). O fluxo:"),
  bullet("1. Usuário faz login → servidor gera jwt.sign({userId, role}, JWT_SECRET, {expiresIn: '7d'})"),
  bullet("2. App recebe o token e salva no AsyncStorage"),
  bullet("3. Em toda requisição, o token vai no header: Authorization: Bearer TOKEN"),
  bullet("4. Servidor verifica com jwt.verify(token, JWT_SECRET)"),
  bullet("5. Se válido, extrai userId e role do payload e adiciona em req.userId/req.userRole"),
  separador(),

  pergunta("O token JWT é criptografado? Qualquer um pode ler?"),
  resposta("O JWT é codificado em Base64, não criptografado. Qualquer pessoa pode decodificar o payload e ver o userId e role. Porém, não pode alterar o conteúdo sem invalidar a assinatura — pois a assinatura usa o JWT_SECRET que só o servidor conhece. Por isso não guardamos informações sensíveis (como senhas) no token."),
  separador(),

  pergunta("O que acontece se o token expirar (7 dias)?"),
  resposta("jwt.verify() retorna erro 'TokenExpiredError'. O middleware verificarToken captura isso e retorna status 403 (Forbidden). O app recebe o erro e deve redirecionar para a tela de login. No projeto atual, o Axios retorna o erro para o catch da chamada — o usuário veria uma mensagem de erro e precisaria fazer login novamente."),
  separador(),

  pergunta("Como garantimos que um usuário não exclua o orçamento de outro?"),
  resposta("A query de DELETE tem duas condições:"),
  codigo("DELETE FROM quotes WHERE id = $1 AND user_id = $2 AND status = 'pending'"),
  resposta("O $2 é req.userId, preenchido pelo middleware a partir do JWT — o usuário não controla esse valor. Mesmo que alguém envie o ID de um orçamento alheio, a condição user_id falhará e rowCount será 0, retornando 404. Isso é controle de acesso a nível de objeto (OABC)."),
  separador(),

  pergunta("O que é CORS e por que precisamos dele?"),
  resposta("CORS (Cross-Origin Resource Sharing) é um mecanismo de segurança do navegador que bloqueia requisições entre origens diferentes. Como o app mobile roda em um endereço/porta diferente do servidor, sem o middleware cors() as chamadas seriam bloqueadas. app.use(cors()) libera todas as origens — em produção seria mais restritivo, especificando apenas o domínio do app."),
  separador(),

  pergunta("Por que o JWT_SECRET deve ser uma string longa e aleatória?"),
  resposta("A segurança do JWT depende de que ninguém adivinhe o JWT_SECRET. Se for 'senha123', um atacante poderia testar senhas comuns e, ao descobrir, forjar tokens para qualquer usuário com qualquer role. O ideal é uma string longa, aleatória e única por ambiente (desenvolvimento, produção). No projeto está no .env e não é commitado no Git."),
  separador(),
);

// ══════════════════════════════════════════════
// 6. BIBLIOTECAS
// ══════════════════════════════════════════════
sec.push(
  titulo("6. Perguntas sobre Bibliotecas e Justificativas"),

  pergunta("Por que Axios em vez de fetch nativo?"),
  resposta("O fetch nativo do JavaScript funciona, mas tem limitações: (1) não lança erro automaticamente para status 4xx/5xx — é preciso verificar manualmente response.ok, (2) não tem suporte nativo a interceptors, (3) a sintaxe é mais verbosa. O Axios: (1) lança erro para qualquer status >= 400, (2) tem interceptors (usamos para adicionar o token automaticamente), (3) serializa/deserializa JSON automaticamente."),
  separador(),

  pergunta("Por que AsyncStorage em vez de guardar o token em variável?"),
  resposta("Variáveis de estado (useState) são perdidas quando o app é fechado. AsyncStorage persiste os dados mesmo após fechar o app — é o equivalente mobile do localStorage do navegador. Sem isso, o usuário precisaria fazer login toda vez que abrisse o app. Com AsyncStorage, o AuthContext recupera o token ao inicializar e o usuário já começa logado."),
  separador(),

  pergunta("Por que expo-image-picker e não uma câmera customizada?"),
  resposta("Criar uma interface de câmera do zero exigiria código nativo (Java para Android, Swift para iOS) e muito mais tempo. O expo-image-picker oferece acesso à câmera e galeria com uma função simples, tratando automaticamente as permissões, a interface do sistema e as diferenças entre Android e iOS."),
  separador(),

  pergunta("Para que serve o expo-linear-gradient?"),
  resposta("O React Native não suporta gradient nativo no CSS como a web. A biblioteca expo-linear-gradient fornece o componente LinearGradient que renderiza gradientes usando código nativo otimizado. Usamos no header da Home e no banner de orçamento para criar o efeito visual de roxo (#9810FA) passando para rosa (#E60076)."),
  separador(),

  pergunta("Por que multer no servidor e não salvar a imagem em disco?"),
  resposta("Salvar em disco no servidor criaria problemas: (1) o servidor precisaria de storage permanente e grande, (2) a imagem seria perdida se o servidor reiniciar em certos ambientes, (3) seria necessário servir as imagens pelo próprio servidor. Com Supabase Storage, as imagens ficam em um CDN externo com URL pública permanente — o servidor só processa a imagem na memória (memoryStorage) e envia para o Supabase."),
  separador(),

  pergunta("O que é o pacote 'dotenv' e como ele funciona?"),
  resposta("Ao chamar require('dotenv').config(), o pacote lê o arquivo .env e adiciona cada par CHAVE=VALOR em process.env. Assim, process.env.JWT_SECRET funciona no código sem expor o valor. O arquivo .env fica fora do controle de versão (no .gitignore), mantendo segredos fora do repositório."),
  separador(),

  pergunta("Para que serve o 'react-native-safe-area-context'?"),
  resposta("Celulares modernos têm áreas 'inseguras': o notch do iPhone, a câmera frontal, os botões de navegação do Android. Sem tratar isso, o conteúdo pode ficar escondido por baixo dessas áreas. O hook useSafeAreaInsets() retorna o espaçamento necessário para cada lado (top, bottom, left, right). Na tela de Novo Orçamento, usamos insets.top + 12 para que o header não sobreponha o notch."),
  separador(),
);

// ══════════════════════════════════════════════
// 7. FUNCIONALIDADES ESPECÍFICAS
// ══════════════════════════════════════════════
sec.push(
  titulo("7. Perguntas sobre Funcionalidades Específicas"),

  pergunta("Como funciona o cálculo de preço do orçamento?"),
  resposta("O cálculo combina custo de material e custo de máquina:"),
  codigo("preço = gramas × preço_por_grama + horas × custo_por_hora"),
  resposta("Onde:"),
  bullet("PLA: R$ 0,50/g — material mais comum e barato"),
  bullet("ABS: R$ 0,40/g — mais resistente ao calor, menor custo de material"),
  bullet("PETG: R$ 0,60/g — mais flexível e resistente, mais caro"),
  bullet("Custo por hora de máquina: R$ 5,00"),
  resposta("Exemplo: peça Média (150g, 5h) em PLA: 150×0,50 + 5×5,00 = 75 + 25 = R$ 100,00. O cálculo acontece no app em tempo real e é enviado junto com os dados ao servidor."),
  separador(),

  pergunta("Como funciona o desconto de 10%?"),
  resposta("No servidor, ao receber POST /orders, verifica-se item_count >= 10. Se sim, aplica total_value * 0.90 (desconta 10%). A mensagem de retorno informa se o desconto foi aplicado. Na tela de detalhes do pedido, se item_count >= 10 aparece um badge verde informando o desconto. A lógica está apenas no servidor para evitar que alguém manipule o valor no app."),
  separador(),

  pergunta("Por que a lixeira de exclusão só aparece em orçamentos 'pending'?"),
  resposta("Não faz sentido excluir um orçamento já aprovado ou rejeitado pois o admin já tomou uma decisão. Além disso, no servidor, a condição status = 'pending' no DELETE impede exclusão de orçamentos decididos mesmo que alguém tente pela API diretamente. É proteção tanto na interface quanto no backend."),
  separador(),

  pergunta("O que é a numeração de pedidos por usuário? Como funciona?"),
  resposta("Cada usuário vê seus pedidos numerados a partir de #1, não pelos IDs globais do banco (que poderiam ser #47, #83, etc.). O servidor usa ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) para calcular essa numeração. Assim o cliente vê '#1, #2, #3...' em vez de números aleatórios, tornando a experiência mais amigável."),
  separador(),

  pergunta("Como funciona a máscara de telefone campo a campo?"),
  resposta("A função formatarTelefone é chamada a cada caractere digitado (onChangeText). Ela remove tudo que não é número (replace(/\\D/g, '')), limita a 11 dígitos (slice(0,11)) e reformata conforme a quantidade de dígitos: 2 ou menos → (XX, até 7 → (XX) XXXXX, até 10 → (XX) XXXX-XXXX, 11 → (XX) XXXXX-XXXX. O resultado formatado substitui o valor do estado."),
  separador(),

  pergunta("Como o admin vê o nome do cliente no orçamento?"),
  resposta("Através de um LEFT JOIN na query SQL: SELECT q.*, u.name AS user_name FROM quotes q LEFT JOIN users u ON u.id = q.user_id. Isso combina a tabela de orçamentos com a de usuários pelo campo user_id, trazendo o nome do cliente junto com cada orçamento em uma única consulta."),
  separador(),

  pergunta("Como as imagens dos orçamentos chegam ao servidor?"),
  resposta("O app usa FormData (multipart/form-data) para enviar a imagem junto com os dados do orçamento em uma única requisição HTTP. No servidor, o Multer (upload.single('file')) intercepta a requisição e extrai o arquivo, colocando em req.file com os campos: buffer (conteúdo binário), mimetype e originalname. O servidor então faz upload desse buffer para o Supabase Storage."),
  separador(),

  pergunta("Como funciona a timeline de progresso na tela de detalhes do pedido?"),
  resposta("A timeline tem 3 passos: pending → preparing → completed. Para cada passo, verifica-se se o índice dele é menor ou igual ao índice do status atual do pedido. Se sim, o círculo fica roxo (#9810FA) e com ícone branco. A linha conectora entre passos também fica roxa se o passo seguinte já foi atingido. Se o pedido foi cancelado, a timeline é escondida e aparece um card vermelho."),
  separador(),

  pergunta("Como o carrinho mantém os dados entre telas?"),
  resposta("O CartContext envolve toda a área logada do app (dentro do CartProvider no _layout.tsx do grupo (app)). O estado carrinho fica em memória React enquanto o app está aberto. Qualquer tela dentro desse grupo pode acessar via useContext(CartContext). Atenção: o carrinho é perdido se o app for fechado completamente — não é persistido no AsyncStorage porque compras em andamento geralmente não precisam desse nível de persistência."),
  separador(),
);

// ══════════════════════════════════════════════
// 8. ERROS E TRATAMENTO
// ══════════════════════════════════════════════
sec.push(
  titulo("8. Perguntas sobre Erros e Tratamento de Exceções"),

  pergunta("O que acontece se o servidor estiver offline quando o app tentar acessar?"),
  resposta("O Axios lança um erro de rede (Network Error). Esse erro é capturado pelo bloco catch nas funções de busca. Na tela de Meus Pedidos, por exemplo, o estado 'erro' é setado para true e a tela exibe um ícone de nuvem offline com botão 'Tentar novamente'. Na Home, o erro é silenciado (catch vazio) e a lista simplesmente fica vazia."),
  separador(),

  pergunta("O que acontece se o usuário tentar fazer pedido sem estar logado?"),
  resposta("Duas camadas de proteção: (1) no app, o _layout.tsx do grupo (app) redireciona para /login se não houver usuário no AuthContext — o usuário nunca chegaria à tela do carrinho, (2) no servidor, a rota POST /orders tem o middleware verificarToken que retorna 401 se o token estiver ausente ou inválido."),
  separador(),

  pergunta("O que acontece se o banco retornar erro na inserção?"),
  resposta("O bloco try/catch nas rotas do Express captura o erro. Para erros conhecidos do PostgreSQL, há tratamento específico: o código '23505' significa violação de unicidade (email duplicado) e retorna uma mensagem amigável. Para outros erros, retorna status 500 com 'Erro interno no servidor' e registra o erro no console do servidor com console.error()."),
  separador(),

  pergunta("O que é o 'finally' no try/catch/finally?"),
  resposta("O bloco finally sempre executa, independente de erro ou sucesso. Usamos para setar setCarregando(false) e setEnviando(false) — garantindo que os indicadores de carregamento sejam desativados mesmo se houver erro. Sem finally, se o catch não fizer isso, o usuário ficaria com o spinner girando para sempre."),
  separador(),

  pergunta("Como é tratado o erro de email duplicado no cadastro?"),
  resposta("O PostgreSQL retorna o código de erro '23505' quando tenta inserir um valor duplicado em uma coluna UNIQUE. No servidor:"),
  codigo("if (error.code === '23505') {"),
  codigo("  return res.status(400).json({ error: 'Este e-mail já pertence a outro usuário.' });"),
  codigo("}"),
  resposta("Sem esse tratamento, o app receberia apenas 'Erro interno no servidor' — com ele, a mensagem é clara e específica."),
  separador(),
);

// ══════════════════════════════════════════════
// 9. PERGUNTAS TÉCNICAS AVANÇADAS
// ══════════════════════════════════════════════
sec.push(
  titulo("9. Perguntas Técnicas Avançadas"),

  pergunta("Qual a diferença entre req.body, req.params e req.query?"),
  rBold("req.body", "dados enviados no corpo da requisição (JSON ou FormData). Usado em POST/PUT."),
  rBold("req.params", "parâmetros dinâmicos da URL. Em /quotes/:id, req.params.id = o ID na URL."),
  rBold("req.query", "parâmetros na query string. Em /products?category=Brinquedos, req.query.category = 'Brinquedos'."),
  separador(),

  pergunta("O que é o operador spread (...) usado no carrinho?"),
  resposta("O spread copia todas as propriedades de um objeto ou elementos de um array. Exemplos do projeto:"),
  codigo("// adicionar produto ao carrinho preservando o array existente:"),
  codigo("[...carrinho, { ...produto, quantidade: 1 }]"),
  resposta("O primeiro ... copia todos os itens do carrinho existente. O segundo ... copia todas as propriedades do produto e adiciona a propriedade quantidade. Isso cria um novo array/objeto sem modificar o original — importante no React, que exige imutabilidade para detectar mudanças de estado."),
  separador(),

  pergunta("O que é o operador ?? (nullish coalescing)?"),
  resposta("Retorna o valor da direita apenas se o da esquerda for null ou undefined. Diferente do || (OR), que também retorna o da direita para valores 'falsy' como 0 ou ''. Exemplo do projeto:"),
  codigo("item.user_order_number ?? item.id"),
  resposta("Se user_order_number for null ou undefined, usa item.id como fallback. Se fosse ||, um user_order_number = 0 também usaria o fallback — o que seria incorreto."),
  separador(),

  pergunta("O que é o optional chaining (?.) usado em user?.name?"),
  resposta("O ?. acessa uma propriedade sem lançar erro se o objeto antes for null ou undefined. user?.name retorna undefined se user for null, em vez de lançar 'Cannot read property name of null'. Muito usado com o user do AuthContext, pois pode ser null enquanto o app verifica o login."),
  separador(),

  pergunta("Por que o logout usa router.replace em vez de router.push?"),
  resposta("router.push adiciona a rota de login na pilha de navegação — o usuário poderia pressionar 'voltar' e retornar para uma tela autenticada. router.replace substitui a tela atual sem adicionar à pilha, garantindo que não haja como 'voltar' para o app após o logout."),
  separador(),

  pergunta("Por que o logout tem um setTimeout() antes de chamar signOut()?"),
  resposta("Ao chamar signOut(), o estado user vira null imediatamente — isso re-renderiza os layouts, que detectam null e redirecionam para login. Se router.replace('/login') e signOut() chamassem ao mesmo tempo, poderia haver um 'flash' visual breve. A ordem 'navega primeiro, limpa estado depois com delay de 300ms' garante uma transição suave."),
  separador(),

  pergunta("O que é 'as any' no TypeScript e quando usar?"),
  resposta("'as any' desativa a verificação de tipos do TypeScript para aquele valor. É um 'escape hatch' — o TypeScript passa a confiar cegamente no desenvolvedor. No projeto é usado em:"),
  bullet("router.push('/(screens)/meus-orcamentos' as any) — o TypeScript não conhece rotas dinâmicas"),
  bullet("{ uri: imagem, name: nome, type: 'image/jpg' } as any — FormData aceita este objeto no mobile mas o tipo oficial não prevê"),
  resposta("Deve ser usado com cuidado. Quando usado em excesso, perde-se os benefícios do TypeScript."),
  separador(),

  pergunta("O que é o interceptor do Axios e como funciona?"),
  resposta("Interceptors são funções que rodam antes de cada requisição (request interceptor) ou antes de cada resposta (response interceptor). O projeto usa um request interceptor em authService.ts que:"),
  codigo("api.interceptors.request.use(async (config) => {"),
  codigo("  const token = await AsyncStorage.getItem('@Trecos3D:token');"),
  codigo("  if (token) config.headers.Authorization = `Bearer ${token}`;"),
  codigo("  return config;  // retorna a config modificada"),
  codigo("});"),
  resposta("Assim, todas as chamadas via a instância 'api' incluem automaticamente o JWT sem precisar passar manualmente."),
  separador(),

  pergunta("Qual a diferença entre useState e useRef?"),
  resposta("useState causa re-renderização do componente quando o valor muda. useRef guarda um valor sem causar re-renderização. No projeto, todos os estados usam useState porque queremos que a tela atualize quando os dados chegam. useRef seria usado para referências a elementos DOM ou valores que precisam ser lidos mas não devem causar re-render (como um timer ID)."),
  separador(),

  pergunta("Por que usamos Platform.OS na tela de orçamento?"),
  resposta("O tratamento de imagem difere entre celular e web. No celular (iOS/Android), o arquivo é representado por uma URI local do sistema de arquivos: { uri: '...', name: '...', type: '...' }. Na web, URIs locais não existem — é preciso converter para Blob via fetch. Platform.OS === 'web' detecta a plataforma e usa o código correto para cada uma."),
  separador(),
);

// ══════════════════════════════════════════════
// 10. BOAS PRÁTICAS
// ══════════════════════════════════════════════
sec.push(
  titulo("10. Perguntas sobre Boas Práticas e Decisões de Projeto"),

  pergunta("Por que separar frontend e backend em vez de usar um serviço como Firebase?"),
  resposta("Ter um backend próprio permite: (1) controle total sobre a lógica de negócio, (2) regras personalizadas (desconto por quantidade, cálculo de orçamento), (3) aprendizado real de desenvolvimento backend, (4) flexibilidade para mudar o banco ou a infraestrutura. Firebase é conveniente mas cria dependência de fornecedor e tem limitações para lógica customizada."),
  separador(),

  pergunta("Por que usar Context API e não Redux ou Zustand?"),
  resposta("Redux é poderoso mas tem muito boilerplate (muito código para pouca coisa). Zustand é mais simples mas é uma dependência extra. A Context API é nativa do React, sem instalação extra, e para o tamanho do projeto (3 contextos simples) é totalmente suficiente. A regra é: não adicionar complexidade que o projeto não justifica."),
  separador(),

  pergunta("Por que o CartContext fica apenas no _layout.tsx do grupo (app)?"),
  resposta("O carrinho só faz sentido para usuários logados na área do cliente. Admins não precisam de carrinho. Colocando o CartProvider apenas no _layout.tsx de (app), o estado de carrinho é criado quando o usuário entra na área logada e destruído quando sai — sem desperdiçar memória e sem conflito com a área de admin."),
  separador(),

  pergunta("Como poderia ser melhorado o sistema em versões futuras?"),
  bullet("Persistência do carrinho no AsyncStorage (não perde ao fechar o app)"),
  bullet("Notificações push quando o pedido muda de status"),
  bullet("Sistema de avaliações de produtos"),
  bullet("Histórico de preços dos produtos"),
  bullet("Pagamento integrado (Stripe, PagSeguro, Pix)"),
  bullet("Upload de múltiplas fotos por orçamento"),
  bullet("Chat entre cliente e admin para tratar orçamentos"),
  bullet("Internacionalização (i18n) para outros idiomas"),
  bullet("Testes automatizados (Jest + React Native Testing Library)"),
  separador(),

  pergunta("Por que não criar uma conta de admin pelo app?"),
  resposta("Por segurança. Se qualquer usuário pudesse criar conta de admin, o sistema seria comprometido. O campo 'role' na rota POST /register aceita o valor enviado, mas a criação de admins deveria ser feita diretamente pelo banco (via Supabase Studio) ou por uma rota protegida acessível apenas a superadmins. Esta é uma melhoria de segurança para versões futuras."),
  separador(),

  pergunta("O que é normalização de banco de dados? O projeto segue?"),
  resposta("Normalização é o processo de organizar tabelas para reduzir redundância. O projeto segue a 3ª Forma Normal (3NF): (1) cada tabela tem uma chave primária única, (2) campos dependem da chave (não de outros campos), (3) tabelas são separadas por entidade (users, products, orders, quotes, order_items). A exceção intencional é guardar product_title em order_items — desnormalização proposital para preservar histórico."),
  separador(),

  pergunta("Por que o status do pedido começa como 'preparing' e não 'pending'?"),
  resposta("É uma decisão de negócio. Quando o cliente finaliza o pedido na loja virtual, subentende-se que a loja já recebeu e está processando. 'preparing' (Em Produção) informa ao cliente que seu pedido foi aceito e está sendo impresso. O status 'pending' existe para casos de orçamentos vinculados a pedidos, onde a confirmação pode exigir etapas adicionais."),
  separador(),

  pergunta("Por que o código não tem comentários?"),
  resposta("Boa prática de programação: código bem escrito deve ser autoexplicativo pelos nomes de variáveis, funções e estrutura. Comentários ficam desatualizados quando o código muda e podem causar confusão. Os nomes usados no projeto são descritivos: buscarProdutos, finalizarPedido, formatarTelefone, verificarToken. A exceção é o arquivo api.ts que tem instruções para o professor sobre o IP."),
  separador(),

  pergunta("O app tem tratamento para modo offline?"),
  resposta("Não de forma explícita. Quando não há conexão, as chamadas Axios falham e o catch trata mostrando mensagem de erro e botão de 'Tentar novamente'. Uma melhoria seria usar @react-native-community/netinfo para detectar o estado da conexão proativamente e exibir um banner informando que o app está offline, sem esperar a chamada falhar."),
  separador(),
);

// Rodapé
sec.push(
  espaco(),
  espaco(),
  new Paragraph({
    children: [new TextRun({ text: "Trecos3D  —  Perguntas & Respostas para Defesa  —  2025", size: 18, color: "888888" })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 400 },
  }),
);

// Gerar
const doc = new Document({
  styles: {
    default: {
      heading1: {
        run: { bold: true, size: 30, color: "9810FA" },
        paragraph: { spacing: { before: 400, after: 200 } },
      },
      heading2: {
        run: { bold: true, size: 26, color: "1A1A1A" },
        paragraph: { spacing: { before: 300, after: 120 } },
      },
    },
  },
  sections: [{ children: sec }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Trecos3D_Perguntas_Respostas.docx", buffer);
  console.log("✅ Trecos3D_Perguntas_Respostas.docx gerado com sucesso!");
  console.log("📄 Salvo em: C:\\dev\\Trecos3D\\Trecos3D_Perguntas_Respostas.docx");
});
