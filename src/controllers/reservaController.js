const pool = require('../config/database');

// Executar Check-in (Muda reserva para 'checkin' e quarto para 'ocupado')
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

    // Atualiza a reserva e o quarto
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

// Executar Check-out (Muda reserva para 'checkout' e quarto para 'limpeza')
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

    // Libera a reserva e coloca o quarto em higienização
    await connection.query("UPDATE reserva SET status = 'checkout' WHERE id = ?", [id]);
    await connection.query("UPDATE quarto SET status = 'limpeza' WHERE id = ?", [quartoId]);

    await connection.commit();
    res.json({ message: 'Check-out realizado com sucesso! Quarto enviado para limpeza.' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Erro ao realizar check-out.' });
  } finally {
    connection.release();
  }
};
