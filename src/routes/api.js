const express = require('express');
const router = express.Router();
const pousadaController = require('../controllers/pousadaController');
const usuarioController = require('../controllers/usuarioController');
const reservaController = require('../controllers/reservaController');
const auth = require('../middleware/auth');

// Rota pública
router.post('/login', pousadaController.login);

// Gestão de Usuários
router.get('/usuario', auth, usuarioController.getUsuarios);
router.post('/usuario', auth, usuarioController.criarUsuario);
router.put('/usuario/:id', auth, usuarioController.atualizarUsuario);

// Fluxo Avançado de Reservas
router.get('/reserva', auth, pousadaController.getReservas);
router.post('/reserva', auth, pousadaController.criarReserva);
router.post('/reserva/:id/checkin', auth, reservaController.fazerCheckin);
router.post('/reserva/:id/checkout', auth, reservaController.fazerCheckout);
router.post('/reserva/:id/consumo', authMiddleware, reservaController.lancarConsumo);

// Quartos & Produtos
router.get('/quarto', auth, pousadaController.getQuartos);
router.put('/quarto/:id/status', auth, pousadaController.atualizarStatusQuarto);
router.get('/produto', auth, pousadaController.getProdutos);

module.exports = router;
