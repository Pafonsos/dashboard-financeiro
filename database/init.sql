-- Database: financial_dashboard
-- Criação das tabelas para o Dashboard Financeiro

-- Criar database se não existir
CREATE DATABASE IF NOT EXISTS financial_dashboard;
USE financial_dashboard;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'manager', 'admin') DEFAULT 'user',
    status ENUM('active', 'inactive', 'suspended', 'deleted') DEFAULT 'active',
    avatar VARCHAR(255),
    phone VARCHAR(20),
    company VARCHAR(100),
    position VARCHAR(100),
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
);

-- Tabela de tokens de refresh
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_token (user_id),
    INDEX idx_token (token(255)),
    INDEX idx_expires_at (expires_at)
);

-- Tabela de reset de senha
CREATE TABLE IF NOT EXISTS password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_reset (user_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    company VARCHAR(100),
    address TEXT,
    tax_id VARCHAR(18), -- CPF ou CNPJ
    status ENUM('active', 'inactive') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_name (name),
    INDEX idx_company (company)
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    client_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    status ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending',
    start_date DATE,
    end_date DATE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_client_id (client_id),
    INDEX idx_status (status),
    INDEX idx_name (name),
    INDEX idx_dates (start_date, end_date)
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    client_id INT,
    service_id INT,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    category VARCHAR(50) NOT NULL,
    status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    due_date DATE,
    paid_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_client_id (client_id),
    INDEX idx_service_id (service_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at),
    INDEX idx_due_date (due_date),
    INDEX idx_amount (amount)
);

-- Tabela de faturas
CREATE TABLE IF NOT EXISTS invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    client_id INT NOT NULL,
    service_id INT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_client_id (client_id),
    INDEX idx_service_id (service_id),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_status (status),
    INDEX idx_issue_date (issue_date),
    INDEX idx_due_date (due_date)
);

-- Tabela de categorias (para organizar transações)
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    type ENUM('income', 'expense', 'both') NOT NULL,
    color VARCHAR(7), -- Hex color
    icon VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_category (user_id, name),
    INDEX idx_user_id (user_id),
    INDEX idx_type (type)
);

-- Tabela de arquivos/documentos
CREATE TABLE IF NOT EXISTS documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    client_id INT,
    service_id INT,
    transaction_id INT,
    invoice_id INT,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    type ENUM('contract', 'receipt', 'invoice', 'report', 'other') DEFAULT 'other',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_setting (user_id, setting_key),
    INDEX idx_user_id (user_id),
    INDEX idx_setting_key (setting_key)
);

-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
);

-- Inserir usuário administrador padrão
INSERT INTO users (name, email, password, role, status) VALUES 
('Administrador', 'admin@empresa.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewboehOKKBNxCN9q', 'admin', 'active')
ON DUPLICATE KEY UPDATE name = name;
-- Senha padrão: Admin123!

-- Inserir categorias padrão
INSERT INTO categories (user_id, name, type, color, icon, description) VALUES 
(1, 'Consultoria', 'income', '#4CAF50', 'briefcase', 'Serviços de consultoria'),
(1, 'Desenvolvimento', 'income', '#2196F3', 'code', 'Desenvolvimento de software'),
(1, 'Suporte', 'income', '#FF9800', 'headphones', 'Suporte técnico'),
(1, 'Treinamento', 'income', '#9C27B0', 'school', 'Treinamentos e capacitação'),
(1, 'Salários', 'expense', '#F44336', 'people', 'Pagamento de salários'),
(1, 'Aluguel', 'expense', '#795548', 'home', 'Aluguel do escritório'),
(1, 'Marketing', 'expense', '#E91E63', 'campaign', 'Despesas com marketing'),
(1, 'Equipamentos', 'expense', '#607D8B', 'computer', 'Compra de equipamentos'),
(1, 'Viagem', 'expense', '#FF5722', 'flight', 'Despesas de viagem'),
(1, 'Telefone/Internet', 'expense', '#00BCD4', 'phone', 'Telecomunicações')
ON DUPLICATE KEY UPDATE name = name;

-- Views para facilitar consultas

-- View para resumo financeiro por usuário
CREATE OR REPLACE VIEW user_financial_summary AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email,
    COUNT(DISTINCT c.id) as total_clients,
    COUNT(DISTINCT s.id) as total_services,
    COUNT(t.id) as total_transactions,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount END), 0) - 
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount END), 0) as net_profit
FROM users u
LEFT JOIN clients c ON u.id = c.user_id AND c.status = 'active'
LEFT JOIN services s ON u.id = s.user_id
LEFT JOIN transactions t ON u.id = t.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.name, u.email;

-- View para transações com detalhes
CREATE OR REPLACE VIEW transaction_details AS
SELECT 
    t.id,
    t.user_id,
    u.name as user_name,
    t.description,
    t.amount,
    t.type,
    t.category,
    t.status,
    t.due_date,
    t.paid_at,
    t.created_at,
    c.name as client_name,
    c.company as client_company,
    s.name as service_name,
    cat.color as category_color,
    cat.icon as category_icon
FROM transactions t
JOIN users u ON t.user_id = u.id
LEFT JOIN clients c ON t.client_id = c.id
LEFT JOIN services s ON t.service_id = s.id
LEFT JOIN categories cat ON t.category = cat.name AND cat.user_id = t.user_id;

-- View para relatório mensal
CREATE OR REPLACE VIEW monthly_report AS
SELECT 
    user_id,
    YEAR(created_at) as year,
    MONTH(created_at) as month,
    MONTHNAME(created_at) as month_name,
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN type = 'income' THEN 1 END) as income_transactions,
    COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_transactions,
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) as total_income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) - 
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) as net_profit
FROM transactions
GROUP BY user_id, YEAR(created_at), MONTH(created_at)
ORDER BY user_id, year DESC, month DESC;

-- Triggers para auditoria

DELIMITER $

-- Trigger para auditoria de usuários
CREATE TRIGGER user_audit_insert 
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values) 
    VALUES (NEW.id, 'INSERT', 'users', NEW.id, JSON_OBJECT(
        'name', NEW.name, 
        'email', NEW.email, 
        'role', NEW.role, 
        'status', NEW.status
    ));
END$

CREATE TRIGGER user_audit_update 
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values) 
    VALUES (NEW.id, 'UPDATE', 'users', NEW.id, 
        JSON_OBJECT('name', OLD.name, 'email', OLD.email, 'role', OLD.role, 'status', OLD.status),
        JSON_OBJECT('name', NEW.name, 'email', NEW.email, 'role', NEW.role, 'status', NEW.status)
    );
END$

-- Trigger para auditoria de transações
CREATE TRIGGER transaction_audit_insert 
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values) 
    VALUES (NEW.user_id, 'INSERT', 'transactions', NEW.id, JSON_OBJECT(
        'description', NEW.description,
        'amount', NEW.amount,
        'type', NEW.type,
        'category', NEW.category,
        'status', NEW.status
    ));
END$

CREATE TRIGGER transaction_audit_update 
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values) 
    VALUES (NEW.user_id, 'UPDATE', 'transactions', NEW.id,
        JSON_OBJECT('description', OLD.description, 'amount', OLD.amount, 'type', OLD.type, 'status', OLD.status),
        JSON_OBJECT('description', NEW.description, 'amount', NEW.amount, 'type', NEW.type, 'status', NEW.status)
    );
END$

CREATE TRIGGER transaction_audit_delete 
AFTER DELETE ON transactions
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values) 
    VALUES (OLD.user_id, 'DELETE', 'transactions', OLD.id, JSON_OBJECT(
        'description', OLD.description,
        'amount', OLD.amount,
        'type', OLD.type,
        'category', OLD.category
    ));
END$

DELIMITER ;

-- Índices adicionais para performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX idx_transactions_amount_date ON transactions(amount, created_at);

CREATE INDEX idx_services_user_status ON services(user_id, status);
CREATE INDEX idx_services_client_status ON services(client_id, status);

CREATE INDEX idx_clients_user_status ON clients(user_id, status);

-- Procedure para limpeza de dados antigos
DELIMITER $

CREATE PROCEDURE CleanOldData()
BEGIN
    -- Limpar tokens de refresh expirados
    DELETE FROM refresh_tokens WHERE expires_at < NOW();
    
    -- Limpar tokens de reset de senha expirados
    DELETE FROM password_resets WHERE expires_at < NOW();
    
    -- Limpar logs de auditoria mais antigos que 1 ano
    DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
    
    -- Limpar usuários marcados como deletados há mais de 30 dias
    DELETE FROM users WHERE status = 'deleted' AND updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
END$

DELIMITER ;

-- Event para executar limpeza automaticamente (executa diariamente às 2h)
SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS daily_cleanup
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURDATE(), '02:00:00')
DO CALL CleanOldData();

-- Inserir configurações padrão do sistema
INSERT INTO system_settings (user_id, setting_key, setting_value) VALUES 
(1, 'company_name', 'Minha Empresa'),
(1, 'company_email', 'contato@minhaempresa.com'),
(1, 'company_phone', '(11) 99999-9999'),
(1, 'company_address', 'Rua Example, 123 - São Paulo, SP'),
(1, 'default_currency', 'BRL'),
(1, 'tax_rate', '0.10'),
(1, 'invoice_prefix', 'INV'),
(1, 'backup_frequency', 'daily'),
(1, 'notification_email', 'true'),
(1, 'theme', 'light')
ON DUPLICATE KEY UPDATE setting_value = setting_value;

-- Comentários nas tabelas para documentação
ALTER TABLE users COMMENT = 'Tabela de usuários do sistema';
ALTER TABLE clients COMMENT = 'Tabela de clientes dos usuários';
ALTER TABLE services COMMENT = 'Tabela de serviços prestados';
ALTER TABLE transactions COMMENT = 'Tabela de transações financeiras';
ALTER TABLE invoices COMMENT = 'Tabela de faturas emitidas';
ALTER TABLE categories COMMENT = 'Tabela de categorias para organização';
ALTER TABLE documents COMMENT = 'Tabela de documentos e arquivos';
ALTER TABLE system_settings COMMENT = 'Configurações do sistema por usuário';
ALTER TABLE audit_logs COMMENT = 'Logs de auditoria do sistema';
ALTER TABLE refresh_tokens COMMENT = 'Tokens de refresh para autenticação';
ALTER TABLE password_resets COMMENT = 'Tokens para reset de senha';

-- Verificar integridade das tabelas
CHECK TABLE users, clients, services, transactions, invoices, categories, documents, system_settings, audit_logs, refresh_tokens, password_resets;

-- Otimizar tabelas
OPTIMIZE TABLE users, clients, services, transactions, invoices, categories, documents, system_settings, audit_logs, refresh_tokens, password_resets;

SELECT 'Database financial_dashboard criado com sucesso!' as status;
