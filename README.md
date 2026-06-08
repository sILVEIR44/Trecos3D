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

O projeto usa **Supabase** (PostgreSQL na nuvem). O banco já está configurado — basta criar o arquivo `.env` com as credenciais.

### Criar o arquivo `.env`

Crie o arquivo `api-impressao-3d/.env` com o seguinte conteúdo:

```env
DATABASE_URL=sua_connection_string_do_supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=sua_chave_anon_do_supabase
JWT_SECRET=uma_chave_secreta_qualquer
```

> Peça os valores desse arquivo para o responsável pelo projeto.

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

## Resumo rápido

| O que fazer | Onde |
|---|---|
| Trocar IP do servidor | `src/config/api.ts` |
| Credenciais do banco | `api-impressao-3d/.env` |
| Iniciar servidor | `cd api-impressao-3d && npm run dev` |
| Iniciar app | `npm start` (na raiz) |
