const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt'); 
require('dotenv').config();
const db = require('./db');
const jwt = require('jsonwebtoken'); 
const app = express();
const { verificarToken, verificarAdmin } = require('./middlewares/auth');
app.use(express.json());
app.use(cors());

// Rota de Teste 
app.get('/', (req, res) => {
  res.json({ message: 'A API de Impressão 3D está online.' });
});

//   ROTA 1: Criar um Usuário/Admin
app.post('/register', async (req, res) => {
  try {
    // 1. O que esperamos receber do celular ou do teste?
    const { name, email, password, role } = req.body;

    // 2. O porteiro verifica se os dados vieram vazios
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Faltam dados obrigatórios!' });
    }

    // 3. A Criptografia: Embaralha a senha 10 vezes
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Insere ao Banco de Dados
    const query = `
      INSERT INTO users (name, email, password_hash, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, name, email, role;
    `;
    
    // Os valores que vão substituir os $1, $2, $3, $4
    const values = [name, email, passwordHash, role || 'user'];

    const result = await db.query(query, values);

    // 5. Retorna a vitória
    res.status(201).json({ 
      message: 'Usuário forjado com sucesso!', 
      user: result.rows[0] 
    });

  } catch (error) {
    console.error(error);
    // Erro 23505 é o código do PostgreSQL para "Esse email já existe"
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Este e-mail já pertence a outro usuário.' });
    }
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

//   ROTA 2: O Portão de Entrada (Login)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. O usuário mandou os dados?
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios!' });
    }

    // 2. Busca o habitante no banco de dados
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    const user = userResult.rows[0];

    // 3. Verifica se a senha bate com a senha embaralhada do banco
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Senha incorreta!' });
    }

    // 4. A Forja da Pulseira VIP (JWT)
    // Guardamos o ID e a Patente (role) do usuário dentro do token
    const token = jwt.sign(
      { userId: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' } // A pulseira vale por 7 dias
    );

    // 5. Entrega a pulseira e os dados para o aplicativo do celular
    res.json({
      message: 'Bem-vindo de volta!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno no portão de acesso.' });
  }
});
//Rota de teste
app.get('/cofre', verificarToken, verificarAdmin, (req, res) => {
  res.json({
    message: 'Portões abertos! Bem-vindo ao cofre, Superadmin.',
    seuId: req.userId,
    suaPatente: req.userRole
  });
});

//ROTA adicionar produto ao catalogo (apenas admin)
app.post('/products', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { title, description, price, stock, image_url } = req.body;

    //validação básica
    if (!title || !price) {
      return res.status(400).json({ error: 'O título e o preço são obrigatórios!'});
    }
    
    const query = `
      INSERT INTO products (title, description, price, stock, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [title, description, price, stock || 0, image_url || ''];
  
    const result = await db.query(query, values);
  
    res.status(201).json({
      message: 'Novo produto adicionado ao catálogo!',
      product: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno ao adicionar o produto.' });
  }
});

//ROTA Listar produtos (aberta para todos)
app.get('/products', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno ao listar os produtos.' });
  }
});

//ROTA Criar orçamento com cálculo automático 
app.post('/quotes', verificarToken, async (req, res) => {
  try {
    const { file_url, material, estimated_grams, estimated_hours } = req.body;
    if (!file_url || !estimated_grams || !estimated_hours) {
      return res.status(400).json({ error: 'Arquivo, peso e tempo estimado são obrigatórios!' });
    }
    //REGRA DE NEGÓCIO
    let precoPorGrama = 0.50;
    if (material ==='ABS') precoPorGrama = 0.40;
    if (material ==='PETG') precoPorGrama = 0.60;
    //custo fixo por hora
    const custoPorHora = 5.00;
    //calculo orçamento
    const custoMaterial = estimated_grams * precoPorGrama;
    const custoMaquina = estimated_hours * custoPorHora;
    const precoFinalCalculado = custoMaterial + custoMaquina;

    //salvar orçamento no banco
    const query = `
    INSERT INTO quotes (user_id, file_url, material, estimated_grams, estimated_hours, calculated_price, status)
    VALUES ($1, $2, $3, $4, $5, $6, 'pending')
    RETURNING *;
    `;
    const values = [req.userId, file_url, material || 'PLA', estimated_grams, estimated_hours, precoFinalCalculado];
    const result = await db.query(query, values);

    res.status(201).json({
      message: 'Orçamento calculado e enviado para aprovação!',
      quote: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno ao processar o orçamento.' });
  }
});

//ROTA Atualizar status orçamento
app.put('/quotes/:id/status', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const quoteId = req.params.id; //PEGA ID URL
    const { status } = req.body; //approved or rejected

    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ error: 'O status deve ser aprovado ou rejeitado.'});
    }

    const query = `
    UPDATE quotes
    SET status = $1
    WHERE id = $2
    RETURNING *;
    `;
    const result = await db.query(query, [status, quoteId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orçamento não encontrado.' });
    }

    res.json({
      message: `Orçamento atualizado para: ${status}`,
      quote: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno ao atualizar o orçamento.' });
  }
});

//ROTA Criar pedido
app.post('/orders', verificarToken, async (req, res) => {
  try {
    const { quote_id, total_value, item_count } = req.body;
    
    if (!total_value || !item_count) {
      return res.status(400).json({ error: 'O valor total e a quantidade de itens são obrigatórios!' });
    }
    //A REGRA DE NEGÓCIO 
    let valorFinalCalculado = total_value;
    let descontoAplicado = false;

    //se pedir 10 ou mais ganha 10% desconto
    if (item_count >= 10) {
      valorFinalCalculado = total_value * 0.90;
      descontoAplicado = true;
    }

    const query = `
    INSERT INTO orders (user_id, quote_id, total_value, item_count, status)
    VALUES ($1, $2, $3, $4, 'preparing')
    RETURNING *;
    `;

    const values = [req.userId, quote_id || null, valorFinalCalculado, item_count];
    const result = await db.query(query, values);

    res.status(201).json({
      message: descontoAplicado
      ? 'Pedido criado! Você ganhou 10% de desconto por comprar 10 ou mais itens!'
      : 'Pedido criado com sucesso!',
      desconto_aplicado: descontoAplicado,
      order: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno ao processar o pedido.' });
  }
});

//ROTA Dashboard
app.get('/dashboard', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const [revenueResult, quotesResult, productsResult] = await Promise.all([
      //Conta total pedido e soma todo dinheiro
      db.query('SELECT COUNT(id) AS total_pedidos, COALESCE(SUM(total_value), 0) AS faturamento_total FROM orders'),
      //Conta qnts orçamento aguardam aprovação
      db.query("SELECT COUNT(id) AS orcamentos_pendentes FROM quotes WHERE status = 'pending'"),
      //Conta qnts produtos tem na vitrine
      db.query('SELECT COUNT(id) AS total_produtos_vitrine FROM products')
    ]);

    const relatorio = {
      faturamento_total: parseFloat(revenueResult.rows[0].faturamento_total),
      total_pedidos: parseInt(revenueResult.rows[0].total_pedidos),
      orcamentos_pendentes: parseInt(quotesResult.rows[0].orcamentos_pendentes),
      total_produtos_vitrine: parseInt(productsResult.rows[0].total_produtos_vitrine)
    };
    res.json({
      message: 'Relatório gerado com sucesso!',
      dashboard: relatorio
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno ao gerar o relatório.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Projeto operando na porta ${PORT}`);
});