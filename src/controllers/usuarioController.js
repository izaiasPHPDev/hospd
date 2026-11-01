const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Listar todos os usuários
exports.getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nome, usuario, funcao, ativo, created_at FROM usuario ORDER BY nome ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
};

// Criar novo usuário
exports.criarUsuario = async (req, res) => {
  const { nome, usuario, senha, funcao } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const [result] = await pool.query(
      'INSERT INTO usuario (nome, usuario, senha, funcao) VALUES (?, ?, ?, ?)',
      [nome, usuario, senhaHash, funcao || 'recepcao']
    );
    res.status(201).json({ id: result.insertId, message: 'Usuário criado com sucesso.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nome de usuário já existe.' });
    }
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
};

// Alterar status/função do usuário
exports.atualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nome, funcao, ativo } = req.body;
  try {
    await pool.query(
      'UPDATE usuario SET nome = ?, funcao = ?, ativo = ? WHERE id = ?',
      [nome, funcao, ativo, id]
    );
    res.json({ message: 'Usuário atualizado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
};
