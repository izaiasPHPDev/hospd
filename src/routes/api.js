const express = require('express');
const router = express.Router();
const controller = require('../controllers/pousadaController');

router.get('/status', controller.getStatus);
router.get('/quarto', controller.getQuartos);
router.get('/reserva', controller.getReservas);
router.post('/reserva', controller.criarReserva);

// Retorno temporário para produto caso a tabela esteja vazia ou controller sem rota
router.get('/produto', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produto');
    res.json(rows);
  } catch (err) {
    res.json([]); // Retorna array vazio em caso de erro para não quebrar o front
  }
});

module.exports = router;
