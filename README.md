# HouseKeeper - Sistema de Administração Doméstica

Sistema completo para gerenciar finanças, limpeza e estoque da sua casa.

## Funcionalidades

### 📊 Finanças
- Cadastro de contas mensais (Luz, Água, Condomínio, Internet, Aluguel, etc)
- Upload de PDF de comprovante de pagamento
- Marcação automática de contas pagas ao fazer upload do PDF
- Visualização de totais: Total de Contas, Total Pago e Total Pendente
- Cards coloridos indicando status de pagamento

### 🧹 Agenda de Limpeza
- Calendário interativo para visualizar tarefas de limpeza
- Cadastro de tarefas com: responsável, data, recorrência e local/objeto
- Opções de recorrência: Única, Diária, Semanal, Quinzenal, Mensal
- Visualização de tarefas por data no calendário
- Lista completa de todas as tarefas agendadas

### 🛒 Compras e Estoque
- Cadastro de itens com quantidade atual e estoque mínimo
- Alertas visuais para itens com estoque baixo
- Geração automática de lista de compras em PDF
- Itens pré-cadastrados comuns da casa
- Possibilidade de adicionar itens personalizados
- Atualização rápida de quantidades em estoque

## Tecnologias Utilizadas

- **Next.js 16** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Calendar** - Componente de calendário
- **jsPDF** - Geração de PDFs
- **Lucide React** - Ícones

## Como Executar

1. Instale as dependências:
```bash
npm install
```

2. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

3. Abra [http://localhost:3000](http://localhost:3000) no navegador

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm start` - Inicia servidor de produção
- `npm run lint` - Executa o linter

## Estrutura do Projeto

```
HouseKeeper/
├── app/
│   ├── financas/       # Página de finanças
│   ├── limpeza/        # Página de agenda de limpeza
│   ├── estoque/        # Página de compras e estoque
│   ├── layout.tsx      # Layout principal
│   ├── page.tsx        # Página inicial
│   └── globals.css     # Estilos globais
├── public/             # Arquivos públicos
└── package.json        # Dependências do projeto
```