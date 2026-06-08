# Trecos3D

Aplicativo de e-commerce para impressão 3D desenvolvido com React Native (Expo) e Node.js.

---

## Pré-requisitos

Instale antes de começar:

- [Node.js](https://nodejs.org/) — versão 18 ou superior
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- [Expo Go](https://expo.dev/client) — no celular (Android ou iOS) para rodar o app
- Git

---

## Estrutura do Projeto

```
Trecos3D/
├── src/                        # Código do app (React Native / Expo)
│   ├── app/                    # Telas (Expo Router)
│   ├── config/api.ts           # ⚠️ IP do servidor — altere aqui
│   ├── context/                # AuthContext, CartContext, ThemeContext
│   └── services/authService.ts # Axios com interceptor JWT
│
└── api-impressao-3d/           # Servidor (Node.js / Express)
    └── src/
        ├── server.js           # Rotas e lógica principal
        ├── db.js               # Conexão com o banco (Supabase/PostgreSQL)
        └── middlewares/        # Autenticação JWT
```

---

## Configuração do Banco de Dados

O projeto usa **Supabase** (PostgreSQL na nuvem). As credenciais ficam num arquivo `.env` dentro da pasta `api-impressao-3d/`.

### Criar o arquivo `.env`

Crie o arquivo `api-impressao-3d/.env` com o seguinte conteúdo:

```env
DATABASE_URL=sua_connection_string_do_supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=sua_chave_anon_do_supabase
JWT_SECRET=uma_chave_secreta_qualquer
```

> Para obter esses valores: acesse [supabase.com](https://supabase.com) → seu projeto → **Settings → Database** (connection string) e **Settings → API** (URL e chave anon).

### Tabelas necessárias

Execute no **SQL Editor** do Supabase para criar as tabelas:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR(20) DEFAULT '',
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  category VARCHAR(100) DEFAULT 'Utilitários',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  total_value NUMERIC(10,2) NOT NULL,
  item_count INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(30) DEFAULT 'preparing',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_title TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT,
  material VARCHAR(20) DEFAULT 'PLA',
  estimated_grams NUMERIC(8,2),
  estimated_hours NUMERIC(6,2),
  calculated_price NUMERIC(10,2),
  status VARCHAR(20) DEFAULT 'pending',
  phone VARCHAR(20) DEFAULT '',
  tamanho VARCHAR(100) DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);
```

> **Observação:** o servidor já executa migrações automáticas ao iniciar (adiciona colunas que faltam), então as tabelas existentes serão atualizadas automaticamente.

---

## Rodando o Servidor (Backend)

```bash
# Entrar na pasta do servidor
cd api-impressao-3d

# Instalar dependências
npm install

# Iniciar o servidor
npm run dev
```

O servidor vai rodar em `http://localhost:3000`. Você verá no terminal:

```
Conexão com o Supabase (PostgreSQL) estabelecida com sucesso!
```

---

## Configurando o IP (passo obrigatório)

O app no celular precisa saber o endereço IP da máquina que está rodando o servidor.

### Como descobrir o IP

Abra o terminal e digite:

- **Windows:** `ipconfig` → procure **Endereço IPv4** na seção da rede Wi-Fi
- **Mac/Linux:** `ifconfig` → procure `inet` na interface `en0` ou `wlan0`

O IP terá o formato `192.168.x.x`.

### Onde alterar

Abra o arquivo `src/config/api.ts` e troque o IP:

```typescript
export const API_BASE_URL = 'http://192.168.1.33:3000';
//                                   ^^^^^^^^^^^^^ troque pelo seu IP
```

> ⚠️ O celular e o computador precisam estar na **mesma rede Wi-Fi**.

---

## Rodando o App (Frontend)

```bash
# Na pasta raiz do projeto (Trecos3D/)
npm install

# Iniciar o Expo
npm start
```

Vai abrir uma janela no navegador com um QR Code. Escaneie com o app **Expo Go** no celular.

---

## Criando uma conta Admin

Por padrão, todo cadastro cria uma conta de usuário comum. Para criar um admin, registre normalmente e depois execute no SQL Editor do Supabase:

```sql
UPDATE users SET role = 'admin' WHERE email = 'seu@email.com';
```

---

## Resumo rápido

| O que fazer | Onde |
|---|---|
| Trocar IP do servidor | `src/config/api.ts` |
| Credenciais do banco | `api-impressao-3d/.env` |
| Iniciar servidor | `cd api-impressao-3d && npm run dev` |
| Iniciar app | `npm start` (na raiz) |
