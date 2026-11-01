const db = require('../config/database');

exports.getStatus = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        res.json({ status: 'API Online', dbConnection: true });
    } catch (err) {
        res.status(500).json({ status: 'Erro ao conectar ao banco', error: err.message });
    }
};

exports.getQuartos = async (req, res) => {
    try {
        const [quartos] = await db.query('SELECT * FROM quarto ORDER BY numero ASC');
        res.json(quartos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getReservas = async (req, res) => {
    try {
        const query = `
            SELECT r.*, q.numero AS quarto_numero, h.nome AS hospede_nome
            FROM reserva r
            JOIN quarto q ON r.quarto_id = q.id
            JOIN hospede h ON r.hospede_id = h.id
            ORDER BY r.id DESC
        `;
        const [reservas] = await db.query(query);
        res.json(reservas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.criarReserva = async (req, res) => {
    const { quarto_id, hospede_id, data_checkin, data_checkout, valor_diarias } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO reserva (quarto_id, hospede_id, data_checkin, data_checkout, valor_diarias, status) VALUES (?, ?, ?, ?, ?, "confirmada")',
            [quarto_id, hospede_id, data_checkin, data_checkout, valor_diarias]
        );
        // Atualiza status do quarto para reservado
        await db.query('UPDATE quarto SET status = "reservado" WHERE id = ?', [quarto_id]);
        res.status(201).json({ id: result.insertId, message: 'Reserva criada com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const pool = require('../config/database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hospd_secret_key_2026';

exports.login = async (req, res) => {
  const { usuario, senha } = req.body;
  
  // Autenticação simples inicial (podes integrar com a tabela de utilizadores no MySQL depois)
  if (usuario === 'admin' && senha === 'admin123') {
    const token = jwt.sign(
      { id: 1, usuario: 'admin', funcao: 'gerente' },
      JWT_SECRET,
      { expiresIn: '12h' }
    );
    return res.json({ token, usuario: { nome: 'Administrador', usuario: 'admin' } });
  }
  return res.status(401).json({ error: 'Utilizador ou palavra-passe incorretos.' });
};

// ... mantém os outros métodos (getQuartos, getReservas, etc.)
