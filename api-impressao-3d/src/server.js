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

const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

// config do Multer (guarda o arquivo na memoria temporariamente para envio rapido)
const upload = multer({ storage: multer.memoryStorage() });

// Config do Supabase JS (so para guardar a imagem no storage)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
// Rota de Teste 
app.get('/', (req, res) => {
  res.json({ message: 'A API de Impressão 3D está online.' });
});

//   rota: Criar um User/Admin
app.post('/register', async (req, res) => {
  try {
    // o que esperamos receber do celular ou do teste?
    const { name, email, password, role } = req.body;

    //  verifica se os dados vieram vazios
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Faltam dados obrigatórios!' });
    }

    //  Criptografia: Embaralha a senha 10 vezes
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insere ao Banco de Dados
    const query = `
      INSERT INTO users (name, email, password_hash, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, name, email, role;
    `;
    
    // Os valores que vao substituir os $1, $2, $3, $4
    const values = [name, email, passwordHash, role || 'user'];

    const result = await db.query(query, values);

    // 5. Retorna sucesso
    res.status(201).json({ 
      message: 'Usuário criado com sucesso!', 
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

app.post('/orcamentos', upload.single('file'), async (req, res) => {
    try {
        // 1. O guarda abre o pacote
        const { material, estimated_grams, calculated_price, user_id } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'A imagem da peça é obrigatória!' }); //pegou mal essa frase ai...
        }

        console.log(`Recebendo orçamento do aldeão ${user_id}...`);

        // 2. Criar um nome único para a imagem
        const nomeArquivo = `${user_id}_${Date.now()}_${file.originalname}`;

        // 3. Enviar para o cofre do Supabase (Storage)
        const { error: erroUpload } = await supabase.storage
            .from('orcamentos')
            .upload(nomeArquivo, file.buffer, {
                contentType: file.mimetype,
            });

        if (erroUpload) {
            console.error("Erro no cofre:", erroUpload);
            return res.status(500).json({ error: 'Falha ao guardar a imagem no cofre.' });
        }

        // pega o url público da imagem que foi guardado
        const { data: urlData } = supabase.storage
            .from('orcamentos')
            .getPublicUrl(nomeArquivo);
        
        const publicUrl = urlData.publicUrl;

        // escreve na tabela os negocio
        const query = `
            INSERT INTO quotes (user_id, file_url, material, estimated_grams, calculated_price, status)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;
        const values = [user_id, publicUrl, material, estimated_grams, calculated_price, 'pendente'];

        const result = await db.query(query, values);

        //  msg deu certo
        res.status(201).json({ 
            message: 'Orçamento criado com sucesso!', 
            orcamento: result.rows[0] 
        });

    } catch (error) {
        console.error('Erro ao criar orçamento:', error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

// rota login (Login)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios!' });
    }

    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    const user = userResult.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Senha incorreta!' });
    }

    // faz pulseira VIP (JWT)
    // guardamos o ID e a patente (role) do user dentro do token
    const token = jwt.sign(
      { userId: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' } //  pulseira vale por 7 dias
    );

    // entrega a pulseira e os dados para o aplicativo do celular
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
    res.status(500).json({ error: 'Erro interno no login.' });
  }
});
//rota de teste
app.get('/cofre', verificarToken, verificarAdmin, (req, res) => {
  res.json({
    message: 'Acesso concedido! Bem-vindo ao sistema, Superadmin.',
    seuId: req.userId,
    suaPatente: req.userRole
  });
});

//rota adicionar produto ao catalogo (apenas admin)
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

//rota Listar produtos (aberta para todos)
app.get('/products', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno ao listar os produtos.' });
  }
});

//rota Criar orçamento com cálculo automático 
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

//rota Atualizar status orçamento
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

//rota Criar pedido
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

//rota Dashboard
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