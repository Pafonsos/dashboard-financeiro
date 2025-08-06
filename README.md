# Dashboard Financeiro PROTEQ

Um dashboard completo para gestão financeira de empresas de prestação de serviços, desenvolvido em React com design responsivo e interface moderna.

## 🚀 Características

- **Dashboard Completo**: Visão geral com KPIs principais
- **Gestão de Receitas**: Análise detalhada do faturamento
- **Controle de Despesas**: Monitoramento de gastos por categoria
- **Fluxo de Caixa**: Projeções e controle de entradas/saídas
- **Gestão de Clientes**: Base de clientes com métricas de satisfação
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Cores da Marca**: Design personalizado com as cores da PROTEQ

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework principal
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones modernos
- **JavaScript ES6+** - Linguagem de programação

## 📁 Estrutura do Projeto

```
proteq-dashboard/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── common/          # Componentes compartilhados
│   │   │   ├── Header.js
│   │   │   ├── Logo.js
│   │   │   └── Navigation.js
│   │   ├── charts/          # Componentes de gráficos
│   │   │   ├── LineChart.js
│   │   │   ├── BarChart.js
│   │   │   └── PieChart.js
│   │   ├── cards/           # Cards e componentes de UI
│   │   │   ├── KPICard.js
│   │   │   └── AlertCard.js
│   │   └── tabs/            # Páginas/abas do dashboard
│   │       ├── OverviewTab.js
│   │       ├── RevenueTab.js
│   │       ├── ExpensesTab.js
│   │       ├── CashFlowTab.js
│   │       └── ClientsTab.js
│   ├── data/
│   │   └── mockData.js      # Dados simulados
│   ├── utils/
│   │   └── formatters.js    # Funções auxiliares
│   ├── styles/
│   │   └── index.css        # Estilos globais
│   ├── App.js               # Componente principal
│   └── index.js             # Ponto de entrada
├── package.json
└── README.md
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação

1. **Clone o repositório ou crie os arquivos:**
   ```bash
   mkdir proteq-dashboard
   cd proteq-dashboard
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Execute o projeto:**
   ```bash
   npm start
   ```

4. **Abra o navegador:**
   ```
   http://localhost:3000
   ```

## 📊 Funcionalidades Principais

### Visão Geral
- KPIs principais (Receita, Lucro, Clientes, Projetos)
- Gráfico de receita vs despesas
- Distribuição por tipo de serviço
- Alertas e lembretes importantes

### Receitas
- Evolução da receita mensal
- Análise por tipo de serviço
- Top 5 clientes por receita
- Métricas de crescimento

### Despesas
- Controle de gastos por categoria
- Contas a pagar
- Análise de tendências
- Recomendações de otimização

### Fluxo de Caixa
- Saldo atual e projeções
- Entradas vs saídas
- Contas com vencimento próximo
- Alertas de fluxo de caixa

### Clientes
- Lista completa de clientes
- Métricas de satisfação
- Filtros e ordenação
- Distribuição por faixa de receita

## 🎨 Personalização

### Cores da Marca
As cores da PROTEQ estão definidas em `src/styles/index.css`:

```css
:root {
  --proteq-blue: #1e5091;
  --proteq-green: #8bc34a;
}
```

### Dados
Para usar dados reais, substitua as funções em `src/data/mockData.js` por chamadas à sua API.

### Componentes
Todos os componentes são modulares e podem ser facilmente customizados ou reutilizados.

## 📱 Responsividade

O dashboard foi desenvolvido com design responsivo:
- **Desktop**: Layout completo com todas as funcionalidades
- **Tablet**: Grid adaptado para telas médias
- **Mobile**: Interface simplificada com navegação por select

## 🔧 Scripts Disponíveis

```bash
npm start          # Inicia o servidor de desenvolvimento
npm build          # Cria build de produção
npm test           # Executa testes
npm eject          # Ejeta a configuração (não recomendado)
```

## 📈 Dados Simulados

O projeto inclui dados simulados realistas para demonstração:
- 12 meses de dados financeiros
- 145 clientes ativos
- 23 projetos em andamento
- Múltiplas categorias de serviços e despesas

## 🤝 Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto foi desenvolvido especificamente para a PROTEQ.

## 📞 Suporte

Para dúvidas ou suporte:
- Email: suporte@proteq.com.br
- Telefone: (11) 3456-7890

---

**Desenvolvido com ❤️ para PROTEQ**
