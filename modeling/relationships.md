
# Relacionamentos e Estratégia de Modelagem — MongoDB

---

## 1. Entidades envolvidas

São 10 entidades. Nem toda entidade vira collection: duas foram incorporadas (embedded) ao documento do imóvel.

| # | Entidade | Representação no MongoDB | Principais atributos |
|---|----------|--------------------------|----------------------|
| 1 | Usuário | collection `usuarios` | nome, email, telefone, senhaHash, dataNascimento, tipoUsuario, dataCadastro |
| 2 | Proprietário | collection `proprietarios` | nome, email, telefone, documento, dataCadastro |
| 3 | Imóvel | collection `imoveis` | titulo, descricao, valorDiaria, quantidadeHospedes, categoria, status, proprietarioId, endereco, comodidadeIds, fotos |
| 4 | Reserva | collection `reservas` | usuarioId, imovelId, dataEntrada, dataSaida, noites, valorTotal, statusReserva, imovelSnapshot |
| 5 | Pagamento | collection `pagamentos` | reservaId, valor, metodoPagamento, parcelas, statusPagamento, dataPagamento, historicoStatus |
| 6 | Avaliação | collection `avaliacoes` | usuarioId, imovelId, reservaId, nota, comentario, detalhes, dataAvaliacao |
| 7 | Endereço | **embedded** em `imoveis.endereco` | rua, numero, bairro, cidade, estado, pais, cep, latitude, longitude |
| 8 | Comodidade | collection `comodidades` (catálogo) | _id (slug), nome, descricao |
| 9 | Disponibilidade | collection `disponibilidades` | imovelId, dataInicio, dataFim, status |
| 10 | Foto do Imóvel | **embedded** em `imoveis.fotos[]` | urlImagem, descricao, principal |

---

## 2. Relacionamentos e cardinalidades

| Entidade A | Relação | Entidade B | Cardinalidade |
|-----------|---------|------------|---------------|
| Proprietário | cadastra | Imóvel | 1:N |
| Usuário | realiza | Reserva | 1:N |
| Imóvel | recebe | Reserva | 1:N |
| Reserva | possui | Pagamento | 1:1 |
| Imóvel | recebe | Avaliação | 1:N |
| Usuário | escreve | Avaliação | 1:N |
| Reserva | gera | Avaliação | 1:0..1 |
| Imóvel | possui | Comodidade | N:N |
| Imóvel | tem | Disponibilidade | 1:N |
| Imóvel | localiza-se em | Endereço | 1:1 |
| Imóvel | exibe | Foto | 1:N (poucas) |

---

## 3. Embedded Documents e References

### Embedded Documents (5)

| Onde | Estratégia | Justificativa |
|------|-----------|---------------|
| `imoveis.endereco` | Embedded | É lido sempre junto com o imóvel (listagem e detalhes). Não é compartilhado com outros imóveis e não tem vida própria. Tamanho fixo e pequeno. Alterar o endereço é raro e atinge um único documento. Permite filtrar por cidade sem join (`endereco.cidade`). |
| `imoveis.fotos[]` | Embedded (array) | Fotos só fazem sentido dentro do imóvel e aparecem em toda tela de detalhes. O número por imóvel é pequeno e limitado (galeria de ~5 a 20 fotos); guardamos só a URL, não o arquivo. Se um dia houver centenas de fotos por imóvel, vira reference. |
| `reservas.imovelSnapshot` | Embedded (cópia) | Guarda título e diária **no momento da reserva**. Se o proprietário mudar o preço depois, o histórico da reserva continua correto. Também evita join para listar "minhas reservas". Duplicação proposital e pequena. |
| `pagamentos.historicoStatus[]` | Embedded (array) | O histórico (pendente → pago → estornado) é consultado sempre com o pagamento e só cresce em poucas entradas por pagamento. |
| `avaliacoes.detalhes` | Embedded | Notas por critério (limpeza, localização, custo-benefício) pertencem a uma única avaliação e são lidas junto com ela. |

### References (8)

| Campo (origem → destino) | Estratégia | Justificativa |
|--------------------------|-----------|---------------|
| `imoveis.proprietarioId` → `proprietarios` | Reference | Um proprietário tem vários imóveis e dados próprios (documento, contato). Embutir duplicaria o proprietário em cada imóvel e dificultaria atualizar o contato. Proprietário tem vida independente. |
| `imoveis.comodidadeIds[]` → `comodidades` | Reference (array de ids) | N:N. Comodidade é um catálogo compartilhado por muitos imóveis. Renomear "Wi-Fi" vira uma única alteração. Permite filtrar imóveis por comodidade. |
| `reservas.usuarioId` → `usuarios` | Reference | O usuário tem vida própria (login, cadastro) e muitas reservas ao longo do tempo. Dados pessoais não devem ser copiados para cada reserva. |
| `reservas.imovelId` → `imoveis` | Reference | Imóvel acumula reservas sem limite; embutir faria o documento crescer indefinidamente (risco do limite de 16 MB) e reservas precisam ser consultadas por data, de forma independente. |
| `pagamentos.reservaId` → `reservas` | Reference (1:1) | Pagamento é dado financeiro com histórico, estorno e auditoria; é atualizado em momentos diferentes da reserva (webhook de pagamento). O índice único em `reservaId` garante o 1:1. |
| `avaliacoes.imovelId` → `imoveis` | Reference | Cresce continuamente e é paginada/ordenada por data ou nota. Embutir inflaria o documento do imóvel. |
| `avaliacoes.usuarioId` e `avaliacoes.reservaId` | Reference | Identificam o autor e a estadia avaliada (só quem se hospedou pode avaliar; índice único evita avaliar a mesma reserva duas vezes). |
| `disponibilidades.imovelId` → `imoveis` | Reference | Quantidade de períodos por imóvel cresce ao longo do ano e é atualizada com muita frequência (bloqueios, reservas); isolar evita reescrever o documento do imóvel. |

### Perguntas-guia aplicadas às decisões principais

| Pergunta | Endereço | Fotos | Reservas (no imóvel) | Comodidades | Pagamento |
|----------|----------|-------|----------------------|-------------|-----------|
| Dados acessados juntos? | Sim | Sim | Não (consultas por data/usuário) | Sim, mas só o nome | Às vezes |
| Compartilhados? | Não | Não | Não | **Sim** | Não |
| Vida independente? | Não | Não | **Sim** | **Sim** | **Sim** |
| Pode crescer demais? | Não | Pouco | **Sim, ilimitado** | Não | Pouco |
| Atualização independente? | Raro | Raro | **Sim, constante** | **Sim (catálogo)** | **Sim** |
| **Decisão** | Embedded | Embedded | Reference | Reference | Reference |

---

## 4. Estratégia de `_id`

- **`ObjectId` (padrão do MongoDB)** em `usuarios`, `proprietarios`, `imoveis`, `reservas`, `pagamentos`, `avaliacoes` e `disponibilidades`. É gerado automaticamente, único sem coordenação central, não expõe e-mail/CPF na URL e carrega a data de criação. Evita escolher um identificador de negócio que possa mudar.
- **`_id` personalizado (string/slug)** em `comodidades` (`"wifi"`, `"piscina"`, ...). É um catálogo pequeno, estável e legível: o `comodidadeIds` do imóvel fica compreensível (`["wifi","piscina"]`) sem precisar de join para saber o que é. Cuidado: o slug não pode ser alterado depois de usado.
- Dados naturalmente únicos (e-mail do usuário, documento do proprietário) **não** são `_id`; usam índice único em `02_collections.js`.
- Nos dados de exemplo (`03_insert_data.js`) os `ObjectId` foram fixados para que os relacionamentos sejam reproduzíveis.

---

## 5. Tipos de dados utilizados

| Tipo BSON | Exemplo no projeto |
|-----------|-------------------|
| String | `titulo`, `email`, `statusReserva` |
| Boolean | `usuarios.ativo`, `fotos[].principal` |
| Int32 | `quantidadeHospedes`, `noites`, `nota`, `parcelas` |
| Double | `endereco.latitude`, `endereco.longitude` |
| Decimal128 | `valorDiaria`, `valorTotal`, `pagamentos.valor` (dinheiro nunca em Double, para evitar erro de arredondamento) |
| Date | `dataEntrada`, `dataSaida`, `dataCadastro` |
| ObjectId | `proprietarioId`, `usuarioId`, `imovelId`, `reservaId` |
| Array | `fotos`, `comodidadeIds`, `historicoStatus` |
| Embedded Document | `endereco`, `imovelSnapshot`, `detalhes`, `desconto` |

`02_collections.js` aplica validação `$jsonSchema` nesses tipos.

---

## 6. Exemplos de documentos

### imoveis (embedded + references)

```json
{
  "_id": ObjectId("a30000000000000000000001"),
  "titulo": "Casa de Praia em Itapuã",
  "valorDiaria": NumberDecimal("450.00"),
  "quantidadeHospedes": 8,
  "status": "ativo",
  "proprietarioId": ObjectId("a20000000000000000000001"),
  "endereco": { "rua": "Rua das Dunas", "numero": "120", "cidade": "Salvador", "estado": "BA", "latitude": -12.9526, "longitude": -38.3593 },
  "comodidadeIds": ["wifi", "piscina", "churrasqueira", "estacionamento"],
  "fotos": [ { "urlImagem": "https://exemplo.com/img/casa-praia-1.jpg", "descricao": "Fachada", "principal": true } ],
  "taxaLimpeza": NumberDecimal("120.00")
}
```

### reservas

```json
{
  "_id": ObjectId("a40000000000000000000001"),
  "usuarioId": ObjectId("a10000000000000000000001"),
  "imovelId": ObjectId("a30000000000000000000001"),
  "dataEntrada": ISODate("2026-07-10"),
  "dataSaida": ISODate("2026-07-15"),
  "noites": 5,
  "valorTotal": NumberDecimal("2250.00"),
  "statusReserva": "concluida",
  "imovelSnapshot": { "titulo": "Casa de Praia em Itapuã", "valorDiaria": NumberDecimal("450.00") }
}
```

### pagamentos

```json
{
  "reservaId": ObjectId("a40000000000000000000001"),
  "valor": NumberDecimal("2250.00"),
  "metodoPagamento": "cartao_credito",
  "statusPagamento": "pago",
  "historicoStatus": [
    { "status": "pendente", "data": ISODate("2026-06-20T10:00:00Z") },
    { "status": "pago", "data": ISODate("2026-06-20T10:02:00Z") }
  ]
}
```

### comodidades (`_id` personalizado)

```json
{ "_id": "wifi", "nome": "Wi-Fi", "descricao": "Internet sem fio de alta velocidade" }
```

Os demais exemplos estão em `mongodb/03_insert_data.js`.

---

## 7. Schema flexível

Na collection `imoveis`, o imóvel "Casa de Praia em Itapuã" tem o campo `taxaLimpeza` e o "Chalé na Chapada" tem o objeto `desconto`; os demais não têm nenhum dos dois (consulta [13] em `04_queries.js`).

**Essa diferença é necessária?** Sim, porque nem todo anúncio cobra taxa de limpeza ou tem promoção ativa. Criar o campo vazio em todos os documentos só gastaria espaço.

**A flexibilidade ajuda ou prejudica?** Ajuda enquanto os campos opcionais são poucos e bem definidos: novos recursos (promoção, taxa extra) entram sem migração. Prejudica se cada imóvel ganhar campos diferentes sem controle, pois as consultas e a aplicação teriam que tratar muitas variações.

**Seria melhor uma estrutura mais consistente?** O núcleo (título, diária, hóspedes, status, proprietário, endereço) precisa ser consistente, e por isso é obrigatório no `$jsonSchema`. Só o que é realmente opcional (`taxaLimpeza`, `desconto`) fica livre. Se esses campos virarem regra para todos, passam a ser obrigatórios.

---

## 8. Resposta à pergunta principal

**Por que os dados foram modelados dessa forma?**

Incorporamos o que é lido sempre junto, é pequeno, não é compartilhado e não cresce sem limite (endereço, fotos, histórico de status, snapshot do imóvel na reserva), para resolver as telas de listagem e detalhes com uma única leitura. Usamos referências onde há vida independente, compartilhamento ou crescimento contínuo: proprietário, usuário, comodidades (catálogo compartilhado), e principalmente reservas, pagamentos, avaliações e disponibilidades, que crescem sem limite com o tempo, são consultados por data, status e usuário, e são atualizados em momentos diferentes. O custo assumido é um `$lookup` em consultas que cruzam collections (arquivo `05_relationships.js`) e a duplicação controlada do `imovelSnapshot` na reserva, em troca de histórico correto e leituras mais rápidas.
