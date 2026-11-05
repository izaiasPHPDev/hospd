const pool = require('../config/database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hospd_secret_key_2026';

// 1. Rota de Login
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

// 2. Quartos
exports.getQuartos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM quarto ORDER BY numero ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar quartos' });
  }
};

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

// 3. Reservas
exports.getReservas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        r.id,
        h.nome AS hospede_nome,
        h.documento AS hospede_documento,
        q.numero AS quarto_numero,
        q.tipo AS quarto_tipo,
        r.quarto_id,
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

exports.criarReserva = async (req, res) => {
  const { quarto_id, hospede_nome, hospede_documento, data_checkin, data_checkout } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let [hospedes] = await connection.query('SELECT id FROM hospede WHERE documento = ?', [hospede_documento]);
    let hospede_id;
    
    if (hospedes.length > 0) {
      hospede_id = hospedes[0].id;
    } else {
      const [novoHospede] = await connection.query(
        'INSERT INTO hospede (nome, documento) VALUES (?, ?)',
        [hospede_nome, hospede_documento]
      );
      hospede_id = novoHospede.insertId;
    }

    const [quartos] = await connection.query('SELECT preco_diaria FROM quarto WHERE id = ?', [quarto_id]);
    if (quartos.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Quarto não encontrado' });
    }

    const precoDiaria = quartos[0].preco_diaria;
    const diffDays = Math.max(1, Math.ceil((new Date(data_checkout) - new Date(data_checkin)) / (1000 * 60 * 60 * 24)));
    const valorTotal = precoDiaria * diffDays;

    const [novaReserva] = await connection.query(
      'INSERT INTO reserva (quarto_id, hospede_id, data_checkin, data_checkout, valor_diarias, status) VALUES (?, ?, ?, ?, ?, ?)',
      [quarto_id, hospede_id, data_checkin, data_checkout, valorTotal, 'confirmada']
    );

    // Atualiza o quarto para 'reservado'
    await connection.query("UPDATE quarto SET status = 'reservado' WHERE id = ?", [quarto_id]);

    await connection.commit();
    res.status(201).json({ id: novaReserva.insertId, message: 'Reserva criada com sucesso' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Erro ao criar reserva' });
  } finally {
    connection.release();
  }
};

// 4. Check-in & Check-out
exports.fazerCheckin = async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [reserva] = await connection.query('SELECT quarto_id FROM reserva WHERE id = ?', [id]);
    if (reserva.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }

    const quartoId = reserva[0].quarto_id;

    await connection.query("UPDATE reserva SET status = 'checkin' WHERE id = ?", [id]);
    await connection.query("UPDATE quarto SET status = 'ocupado' WHERE id = ?", [quartoId]);

    await connection.commit();
    res.json({ message: 'Check-in realizado com sucesso!' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Erro ao realizar check-in.' });
  } finally {
    connection.release();
  }
};

exports.fazerCheckout = async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [reserva] = await connection.query('SELECT quarto_id FROM reserva WHERE id = ?', [id]);
    if (reserva.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }

    const quartoId = reserva[0].quarto_id;

    await connection.query("UPDATE reserva SET status = 'checkout' WHERE id = ?", [id]);
    await connection.query("UPDATE quarto SET status = 'limpeza' WHERE id = ?", [quartoId]);

    await connection.commit();
    res.json({ message: 'Check-out realizado com sucesso!' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Erro ao realizar check-out.' });
  } finally {
    connection.release();
  }
};

// 5. Consumo de Produtos
exports.lancarConsumo = async (req, res) => {
  const { id } = req.params; // ID enviado (da reserva ou do quarto)
  const { produto_id, quantidade } = req.body;

  try {
    // 1. Obter valor unitário do produto
    const [produtos] = await pool.query('SELECT preco FROM produto WHERE id = ?', [produto_id]);
    if (produtos.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    const valorUnitario = produtos[0].preco;

    // 2. Localizar reserva ativa associada (por id ou pelo quarto)
    const [reservas] = await pool.query(
      "SELECT id FROM reserva WHERE id = ? OR (quarto_id = ? AND status = 'checkin') ORDER BY id DESC LIMIT 1",
      [id, id]
    );

    const reservaId = reservas.length > 0 ? reservas[0].id : null;

    // 3. Inserção resiliente com fallback caso a coluna quarto_id ainda não exista
    try {
      await pool.query(
        'INSERT INTO consumo (reserva_id, quarto_id, produto_id, quantidade, valor_unitario) VALUES (?, ?, ?, ?, ?)',
        [reservaId, id, produto_id, quantidade || 1, valorUnitario]
      );
    } catch (dbErr) {
      if (reservaId) {
        await pool.query(
          'INSERT INTO consumo (reserva_id, produto_id, quantidade, valor_unitario) VALUES (?, ?, ?, ?)',
          [reservaId, produto_id, quantidade || 1, valorUnitario]
        );
      } else {
        throw dbErr;
      }
    }

    return res.status(201).json({ message: 'Consumo lançado com sucesso!' });
  } catch (error) {
    console.error('Erro ao lançar consumo:', error.message);
    return res.status(500).json({ error: `Erro ao lançar consumo: ${error.message}` });
  }
};

// 6. Produtos
exports.getProdutos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produto ORDER BY nome ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
};
