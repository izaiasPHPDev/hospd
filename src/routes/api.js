const express = require('express');
const router = express.Router();
const controller = require('../controllers/pousadaController');
const auth = require('../middleware/auth');

// 1. Rota pública para autenticação
router.post('/login', controller.login);

// 2. Rotas protegidas (Exigem Token JWT ou API Key)
router.get('/quarto', auth, controller.getQuartos);
router.put('/quarto/:id/status', auth, controller.atualizarStatusQuarto);
router.get('/reserva', auth, controller.getReservas);
router.post('/reserva', auth, controller.criarReserva);
router.get('/produto', auth, controller.getProdutos);

module.exports = router;
