# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

erDiagram
CLIENTE {
string id PK "Documento limpo ou UUID"
string nome "Sanitizado / Lowercase"
string tipoDoc "CPF ou CNPJ"
string documento "Apenas números"
string documentoFormatado "Com máscara"
string contato1
string contato2
string contato3
string email "Strictly lowercase"
string logradouro
string numero "Padrão S/N se vazio"
string cep
string bairro
string complemento
}

    PRODUTO {
        string id PK "UUID ou Código"
        string nome "Nome do material/serviço"
        float precoUnitario "Preço base"
        string unidade "m² ou Unidade"
    }

    ORCAMENTO {
        string id PK "UUID do Orçamento"
        string clienteId FK "id do Cliente"
        date dataEmissao
        date dataVencimento "Controlado via calendário"
        string formaPagamento
        string parcelamento
        float valorTotal
    }

    ITEM_ORCAMENTO {
        string id PK "UUID da Linha"
        string orcamentoId FK
        string produtoId FK
        int quantidade
        float largura "Opcional para cálculo de m²"
        float altura "Opcional para cálculo de m²"
        float areaCalculada "largura * altura"
        float precoAplicado
        float totalItem "Qtd * Preço (ou Qtd * Área * Preço)"
    }

    CLIENTE ||--o{ ORCAMENTO : "possui"
    ORCAMENTO ||--|{ ITEM_ORCAMENTO : "contém"
    PRODUTO ||--o{ ITEM_ORCAMENTO : "vende"
