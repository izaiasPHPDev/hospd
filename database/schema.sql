USE `sistemahospd`;

-- Tabela de Usuários do Sistema
CREATE TABLE IF NOT EXISTS `usuario` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nome` VARCHAR(100) NOT NULL,
    `usuario` VARCHAR(50) NOT NULL UNIQUE,
    `senha` VARCHAR(255) NOT NULL,
    `funcao` ENUM('admin', 'recepcao', 'gerente') DEFAULT 'recepcao',
    `ativo` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Usuário padrão inicial (senha: admin123)
INSERT INTO `usuario` (`id`, `nome`, `usuario`, `senha`, `funcao`, `ativo`) 
VALUES (1, 'Administrador', 'admin', '$2a$10$wT8KzTqN7S9M1/V.gG1n7uO3Q3eWjQZJ3gQZJ3gQZJ3gQZJ3gQZJ3', 'admin', 1)
ON DUPLICATE KEY UPDATE `id`=`id`;
