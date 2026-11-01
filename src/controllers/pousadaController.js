const pool = require('../config/database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hospd_secret_key_2026';

// 1. Método de Login
exports.login = async (req, res) => {
  const { usuario, senha } = req.body;
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

// 2. Método de Listar Quartos
exports.getQuartos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM quarto ORDER BY numero ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar quartos' });
  }
};

// 3. Método de Atualizar Status do Quarto (O que estava a faltar)
exports.atualizarStatusQuarto = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE quarto SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status do quarto' });
  }
};

// 4. Método de Listar Reservas
exports.getReservas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        r.id,
        h.nome AS hospede_nome,
        h.documento AS hospede_documento,
        q.numero AS quarto_numero,
        q.tipo AS quarto_tipo,
        r.data_checkin,
        r.data_checkout,
        r.valor_diarias,
        r.status
      FROM reserva r
      INNER JOIN hospede h ON r.hospede_id = h.id
      INNER JOIN quarto q ON r.quarto_id = q.id
      ORDER BY r.id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar reservas' });
  }
};

// 5. Método de Criar Reserva
exports.criarReserva = async (req, res) => {
  const { quarto_id, hospede_nome, hospede_documento, data_checkin, data_checkout } = req.body;
  try {
    let [hospedes] = await pool.query('SELECT id FROM hospede WHERE documento = ?', [hospede_documento]);
    let hospede_id;
    
    if (hospedes.length > 0) {
      hospede_id = hospedes[0].id;
    } else {
      const [novoHospede] = await pool.query(
        'INSERT INTO hospede (nome, documento) VALUES (?, ?)',
        [hospede_nome, hospede_documento]
      );
      hospede_id = novoHospede.insertId;
    }

    const [quartos] = await pool.query('SELECT preco_diaria FROM quarto WHERE id = ?', [quarto_id]);
    if (quartos.length === 0) return res.status(404).json({ error: 'Quarto não encontrado' });

    const precoDiaria = quartos[0].preco_diaria;
    const diffDays = Math.max(1, Math.ceil((new Date(data_checkout) - new Date(data_checkin)) / (1000 * 60 * 60 * 24)));
    const valorTotal = precoDiaria * diffDays;

    const [novaReserva] = await pool.query(
      'INSERT INTO reserva (quarto_id, hospede_id, data_checkin, data_checkout, valor_diarias, status) VALUES (?, ?, ?, ?, ?, ?)',
      [quarto_id, hospede_id, data_checkin, data_checkout, valorTotal, 'confirmada']
    );

    await pool.query('UPDATE quarto SET status = ? WHERE id = ?', ['reservado', quarto_id]);

    res.status(201).json({ id: novaReserva.insertId, message: 'Reserva criada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar reserva' });
  }
};

// 6. Método de Listar Produtos
exports.getProdutos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produto ORDER BY nome ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
};
