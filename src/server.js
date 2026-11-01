const express = require('express');
const cors = require('cors');

const allowedOrigins = [
  'https://sistemahospd-front.t4kpnp.easypanel.host',
  'http://localhost:5173' // Apenas para testes locais
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Acesso não permitido por política de CORS'));
    }
  },
  credentials: true
}));

require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 80;

app.use(express.json());

// Rotas da API
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Sistema de Gestão de Pousada API está rodando!' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
