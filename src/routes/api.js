const express = require('express');
const router = express.Router();
const controller = require('../controllers/pousadaController');
const auth = require('../middleware/auth');

// Rota pública de login
router.post('/login', controller.login);

// Proteção global para as rotas abaixo
router.use(auth);

// Quartos
router.get('/quarto', controller.getQuartos);
router.put('/quarto/:id/status', controller.atualizarStatusQuarto);

// Reservas, Check-in, Check-out e Consumo
router.get('/reserva', controller.getReservas);
router.post('/reserva', controller.criarReserva);
router.post('/reserva/:id/checkin', controller.fazerCheckin);
router.post('/reserva/:id/checkout', controller.fazerCheckout);
router.post('/reserva/:id/consumo', controller.lancarConsumo);

// Produtos
router.get('/produto', controller.getProdutos);

module.exports = router;
