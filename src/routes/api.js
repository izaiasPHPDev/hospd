const express = require('express');
const router = express.Router();

// Middlewares
const authMiddleware = require('../middleware/auth');

// Controladores
const authController = require('../controllers/authController');
const quartoController = require('../controllers/quartoController');
const reservaController = require('../controllers/reservaController');
const usuarioController = require('../controllers/usuarioController');
const produtoController = require('../controllers/produtoController');

// 1. Rota pública de login
router.post('/login', authController.login);

// 2. Proteção global para todas as rotas abaixo (Exige JWT ou API Key)
router.use(authMiddleware);

// 3. Rotas de Quartos
router.get('/quarto', quartoController.getQuartos);
router.put('/quarto/:id/status', quartoController.atualizarStatusQuarto);

// 4. Rotas de Reservas, Check-in, Check-out e Consumo
router.get('/reserva', reservaController.getReservas);
router.post('/reserva', reservaController.criarReserva);
router.post('/reserva/:id/checkin', reservaController.fazerCheckin);
router.post('/reserva/:id/checkout', reservaController.fazerCheckout);
router.post('/reserva/:id/consumo', reservaController.lancarConsumo);

// 5. Rotas de Usuários
router.get('/usuario', usuarioController.getUsuarios);
router.post('/usuario', usuarioController.criarUsuario);

// 6. Rotas de Produtos
router.get('/produto', produtoController.getProdutos);

module.exports = router;
