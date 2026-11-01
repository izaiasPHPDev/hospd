# 🏨 Pousada Management System (Backend API)

API RESTful em Node.js + Express + MySQL pronta para deploy no **Easypanel** via GitHub.

## 🚀 Como subir no Easypanel

1. **Suba este projeto para um repositório no GitHub**.
2. **Crie a Base de Dados MySQL no Easypanel**:
   - Vá no Easypanel -> Add Service -> **MySQL**.
   - Defina o nome do banco como `pousada_db` e anote a senha.
   - Execute o script `database/schema.sql` na sua instância MySQL para criar as tabelas e dados iniciais.
3. **Crie a Aplicação Node.js no Easypanel**:
   - Add Service -> **App**.
   - Conecte ao seu repositório GitHub.
   - Defina as Variáveis de Ambiente em **Environment**:
     - `PORT=3000`
     - `DB_HOST=<nome_do_servico_mysql_no_easypanel>`
     - `DB_USER=root`
     - `DB_PASSWORD=<sua_senha>`
     - `DB_NAME=pousada_db`
     - `DB_PORT=3306`
   - O Easypanel detectará automaticamente o `Dockerfile` e fará o build!

## 📡 Endpoints da API

- `GET /api/status` - Healthcheck do servidor
- `GET /api/quarto` - Lista todos os quartos
- `GET /api/reserva` - Lista reservas ativas
- `GET /api/consumo` - Lista itens de consumo por quarto
- `POST /api/reserva` - Criar nova reserva
