# 📊 Financial Dashboard - Sistema Completo

Um sistema completo de dashboard financeiro para empresas de prestação de serviços, desenvolvido com Node.js, Express, MySQL e React.

## 🚀 Características

### Backend (API)
- **Autenticação JWT** com refresh tokens
- **Autorização baseada em roles** (user, manager, admin)
- **Segurança avançada** (rate limiting, XSS protection, SQL injection prevention)
- **Validação robusta** de dados
- **Logs detalhados** com Winston
- **Auditoria completa** de ações
- **API RESTful** bem estruturada

### Frontend (Dashboard)
- **Interface moderna** e responsiva
- **Gráficos interativos** com Recharts
- **Visualização em tempo real** dos dados
- **Filtros avançados** e relatórios
- **Exportação de dados**
- **Temas dark/light**

### Funcionalidades
- ✅ Gestão de clientes
- ✅ Controle de serviços
- ✅ Transações financeiras
- ✅ Emissão de faturas
- ✅ Relatórios detalhados
- ✅ Dashboard analítico
- ✅ Categorização inteligente
- ✅ Auditoria completa
- ✅ Backup automático

## 📁 Estrutura do Projeto

```
financial-dashboard/
├── backend/                    # API Node.js
│   ├── config/                # Configurações
│   │   ├── database.js        # Conexão MySQL
│   │   ├── auth.js           # JWT e criptografia
│   │   └── environment.js     # Variáveis de ambiente
│   ├── controllers/           # Controladores
│   │   ├── authController.js  # Autenticação
│   │   ├── financialController.js # Dados financeiros
│   │   └── reportController.js # Relatórios
│   ├── middleware/            # Middlewares
│   │   ├── auth.js           # Autenticação
│   │   ├── validation.js     # Validação
│   │   └── security.js       # Segurança
│   ├── models/               # Modelos de dados
│   │   ├── User.js          # Modelo de usuário
│   │   ├── Transaction.js   # Modelo de transação
│   │   └── ...
│   ├── routes/              # Rotas da API
│   │   ├── auth.js         # Rotas de autenticação
│   │   ├── financial.js    # Rotas financeiras
│   │   └── reports.js      # Rotas de relatórios
│   ├── utils/              # Utilitários
│   │   ├── logger.js      # Sistema de logs
│   │   └── validators.js  # Validadores
│   ├── app.js             # Configuração do Express
│   └── server.js          # Servidor principal
├── frontend/              # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/        # Páginas
│   │   ├── services/     # Serviços API
│   │   └── utils/        # Utilitários
├── database/             # Scripts do banco
│   ├── init.sql         # Criação das tabelas
│   ├── migrations/      # Migrações
│   └── seeds/          # Dados iniciais
├── docs/               # Documentação
├── tests/             # Testes
├── .env.example       # Exemplo de variáveis
├── docker-compose.yml # Docker setup
└── README.md         # Este arquivo
```

## 🛠 Instalação e Configuração

### Pré-requisitos
- Node.js 16+ 
- MySQL 8.0+
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/financial-dashboard.git
cd financial-dashboard
```

### 2. Configure o Backend

```bash
cd backend
npm install
```

#### Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=financial_dashboard

# JWT (ALTERE EM PRODUÇÃO!)
JWT_SECRET=seu-jwt-secret-super-seguro
JWT_REFRESH_SECRET=seu-refresh-secret-super-seguro

# Email (opcional)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-app
```

#### Configure o banco de dados:
```bash
# Criar database e tabelas
mysql -u root -p < database/init.sql

# Ou execute o SQL diretamente no MySQL
```

#### Inicie o servidor:
```bash
npm run dev  # Desenvolvimento
npm start    # Produção
```

### 3. Configure o Frontend

```bash
cd frontend
npm install
npm start
```

### 4. Acesso ao Sistema

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Usuário padrão**: admin@empresa.com / Admin123!

## 🔐 Segurança

### Implementada
- ✅ Autenticação JWT com refresh tokens
- ✅ Hash de senhas com bcrypt
- ✅ Rate limiting por IP
- ✅ Validação e sanitização de dados
- ✅ Proteção contra XSS
- ✅ Proteção contra SQL Injection
- ✅ Headers de segurança (Helmet)
- ✅ CORS configurado
- ✅ Logs de auditoria
- ✅ Criptografia de dados sensíveis

### Recomendações para Produção
- [ ] Configurar HTTPS/SSL
- [ ] Usar secrets seguros
- [ ] Configurar firewall
- [ ] Monitoramento 24/7
- [ ] Backup automático
- [ ] Certificados de segurança

## 📊 API Endpoints

### Autenticação
```
POST /api/auth/register     # Registrar usuário
POST /api/auth/login        # Login
POST /api/auth/refresh      # Refresh token
POST /api/auth/logout       # Logout
POST /api/auth/forgot-password # Esqueci a senha
POST /api/auth/reset-password  # Reset de senha
GET  /api/auth/profile      # Perfil do usuário
```

### Financeiro
```
GET    /api/financial/dashboard      # Dados do dashboard
GET    /api/financial/transactions   # Listar transações
POST   /api/financial/transactions   # Criar transação
PUT    /api/financial/transactions/:id # Atualizar transação
DELETE /api/financial/transactions/:id # Deletar transação
GET    /api/financial/categories     # Categorias
```

### Relatórios
```
GET /api/reports/financial    # Relatório financeiro
GET /api/reports/cashflow     # Fluxo de caixa
GET /api/reports/clients      # Relatório de clientes
GET /api/reports/services     # Relatório de serviços
GET /api/reports/performance  # Performance mensal
```

## 🧪 Testes

```bash
# Backend
cd backend
npm test              # Executar testes
npm run test:watch    # Executar em modo watch
npm run test:coverage # Cobertura de testes

# Frontend
cd frontend
npm test
```

## 📈 Monitoramento

### Logs
- **Localização**: `backend/logs/`
- **Tipos**: app.log, error.log, security.log
- **Rotação**: Automática (20MB por arquivo)

### Métricas Disponíveis
- Transações por período
- Performance de endpoints
- Tentativas de login falhadas
- Erros do sistema
- Uso de memória e CPU

## 🚀 Deploy

### Docker
```bash
# Construir imagem
docker build -t financial-dashboard .

# Executar com docker-compose
docker-compose up -d
```

### Produção
```bash
# Backend
cd backend
npm install --production
npm start

# Frontend
cd frontend
npm run build
# Servir arquivos estáticos
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Email**: suporte@empresa.com
- **Documentação**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/financial-dashboard/issues)

## 🎯 Roadmap

### Versão 1.1
- [ ] Integração com bancos (Open Banking)
- [ ] App mobile (React Native)
- [ ] Relatórios avançados com IA
- [ ] Integração com contabilidade

### Versão 1.2
- [ ] Multi-tenancy
- [ ] API pública
- [ ] Marketplace de plugins
- [ ] Análise preditiva

---

**Desenvolvido com ❤️ para empresas de prestação de serviços**
