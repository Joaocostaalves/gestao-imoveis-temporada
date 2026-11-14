# Gestão de Imóveis por Temporada

Sistema de gerenciamento de imóveis para aluguel por temporada.

## Objetivo

Desenvolver uma solução utilizando banco de dados NoSQL MongoDB,
permitindo gerenciamento de usuários, imóveis, reservas,
pagamentos e avaliações.

## Tecnologias

- MongoDB
- GitHub
- Markdown

## Estrutura do repositório

```
/
├── docs/
│   └── descricao-projeto.md
├── modeling/
│   ├── entities.md         # entidades do projeto
│   └── relationships.md    # relacionamentos, embedded x reference, _id e justificativas
├── mongodb/
│   ├── 01_database.js      # cria/seleciona o banco
│   ├── 02_collections.js   # collections, validações e índices
│   ├── 03_insert_data.js   # dados de exemplo (insertOne/insertMany)
│   ├── 04_queries.js       # consultas (simples, múltiplas condições, projeção, array, ordenação)
│   └── 05_relationships.js # consultas que demonstram os relacionamentos ($lookup)
└── README.md
```

## Como executar

Requer MongoDB e o `mongosh`. Execute os scripts na ordem, a partir da raiz do repositório:

```bash
mongosh --file mongodb/01_database.js
mongosh --file mongodb/02_collections.js
mongosh --file mongodb/03_insert_data.js
mongosh --file mongodb/04_queries.js
mongosh --file mongodb/05_relationships.js
```

O script 03 apaga e recria os dados de exemplo, então pode ser executado várias vezes.

## Resumo da modelagem

- **Embedded**: endereço e fotos (dentro do imóvel), snapshot do imóvel (na reserva), histórico de status (no pagamento) e notas por critério (na avaliação).
- **Reference**: proprietário, comodidades, usuário, imóvel, reserva, pagamento, avaliação e disponibilidade se relacionam por `_id`.
- Justificativas completas em [`modeling/relationships.md`](modeling/relationships.md).
