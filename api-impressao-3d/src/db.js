const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Exigência do Supabase para nuvem
  }
});

pool.connect()
  .then(() => console.log(' Conexão com o Supabase (PostgreSQL) estabelecida com sucesso!'))
  .catch(err => console.error(' Erro ao conectar com o banco de dados:', err.stack));

module.exports = pool;