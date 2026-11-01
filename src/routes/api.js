const express = require('express');
const router = express.Router();
const controller = require('../controllers/pousadaController');
const auth = require('../middleware/auth');

// Rota pública de login
router.post('/login', controller.login);

// Rotas protegidas com JWT ou API Key
router.get('/quarto', auth, controller.getQuartos);
router.put('/quarto/:id/status', auth, controller.atualizarStatusQuarto);
router.get('/reserva', auth, controller.getReservas);
router.post('/reserva', auth, controller.criarReserva);
router.get('/produto', auth, controller.getProdutos);

module.exports = router;
