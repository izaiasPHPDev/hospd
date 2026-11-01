const express = require('express');
const router = express.Router();
const controller = require('../controllers/pousadaController');

router.get('/status', controller.getStatus);
router.get('/quarto', controller.getQuartos);
router.get('/reserva', controller.getReservas);
router.post('/reserva', controller.criarReserva);

module.exports = router;
