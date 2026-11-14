// =============================================================
// 02_collections.js — Collections, validações ($jsonSchema) e índices
// Executar: mongosh --file mongodb/02_collections.js
//
// Flexibilidade != ausência de regras: validamos só o essencial
// (campos obrigatórios e tipos). Campos extras continuam permitidos.
// =============================================================

use("gestao_imoveis_temporada");

const validadores = {
  usuarios: {
    bsonType: "object",
    required: ["nome", "email", "tipoUsuario", "dataCadastro"],
    properties: {
      nome: { bsonType: "string" },
      email: { bsonType: "string" },
      telefone: { bsonType: "string" },
      senhaHash: { bsonType: "string" },
      dataNascimento: { bsonType: "date" },
      tipoUsuario: { enum: ["hospede", "admin"] },
      ativo: { bsonType: "bool" },
      dataCadastro: { bsonType: "date" }
    }
  },
  proprietarios: {
    bsonType: "object",
    required: ["nome", "email", "documento", "dataCadastro"],
    properties: {
      nome: { bsonType: "string" },
      email: { bsonType: "string" },
      documento: { bsonType: "string" },
      dataCadastro: { bsonType: "date" }
    }
  },
  comodidades: {
    bsonType: "object",
    required: ["_id", "nome"],
    properties: {
      _id: { bsonType: "string" },
      nome: { bsonType: "string" },
      descricao: { bsonType: "string" }
    }
  },
  imoveis: {
    bsonType: "object",
    required: ["titulo", "valorDiaria", "quantidadeHospedes", "status", "proprietarioId", "endereco"],
    properties: {
      titulo: { bsonType: "string" },
      valorDiaria: { bsonType: "decimal" },
      quantidadeHospedes: { bsonType: "int", minimum: 1 },
      status: { enum: ["ativo", "inativo", "manutencao"] },
      proprietarioId: { bsonType: "objectId" },
      endereco: {
        bsonType: "object",
        required: ["cidade", "estado"],
        properties: {
          latitude: { bsonType: "double" },
          longitude: { bsonType: "double" }
        }
      },
      comodidadeIds: { bsonType: "array", items: { bsonType: "string" } },
      fotos: { bsonType: "array" }
    }
  },
  reservas: {
    bsonType: "object",
    required: ["usuarioId", "imovelId", "dataEntrada", "dataSaida", "statusReserva", "valorTotal"],
    properties: {
      usuarioId: { bsonType: "objectId" },
      imovelId: { bsonType: "objectId" },
      dataEntrada: { bsonType: "date" },
      dataSaida: { bsonType: "date" },
      quantidadeHospedes: { bsonType: "int" },
      noites: { bsonType: "int" },
      valorTotal: { bsonType: "decimal" },
      statusReserva: { enum: ["pendente", "confirmada", "concluida", "cancelada"] }
    }
  },
  pagamentos: {
    bsonType: "object",
    required: ["reservaId", "valor", "metodoPagamento", "statusPagamento"],
    properties: {
      reservaId: { bsonType: "objectId" },
      valor: { bsonType: "decimal" },
      metodoPagamento: { enum: ["pix", "cartao_credito", "boleto"] },
      statusPagamento: { enum: ["pendente", "pago", "estornado", "falhou"] },
      historicoStatus: { bsonType: "array" }
    }
  },
  avaliacoes: {
    bsonType: "object",
    required: ["usuarioId", "imovelId", "nota", "dataAvaliacao"],
    properties: {
      usuarioId: { bsonType: "objectId" },
      imovelId: { bsonType: "objectId" },
      reservaId: { bsonType: "objectId" },
      nota: { bsonType: "int", minimum: 1, maximum: 5 },
      comentario: { bsonType: "string" },
      dataAvaliacao: { bsonType: "date" }
    }
  },
  disponibilidades: {
    bsonType: "object",
    required: ["imovelId", "dataInicio", "dataFim", "status"],
    properties: {
      imovelId: { bsonType: "objectId" },
      dataInicio: { bsonType: "date" },
      dataFim: { bsonType: "date" },
      status: { enum: ["disponivel", "bloqueado", "reservado"] }
    }
  }
};

const existentes = db.getCollectionNames();
for (const nome of Object.keys(validadores)) {
  if (existentes.includes(nome)) {
    db.runCommand({ collMod: nome, validator: { $jsonSchema: validadores[nome] } });
  } else {
    db.createCollection(nome, { validator: { $jsonSchema: validadores[nome] } });
  }
}

// Índices (apoiam as consultas de 04 e 05)
db.usuarios.createIndex({ email: 1 }, { unique: true });
db.proprietarios.createIndex({ documento: 1 }, { unique: true });
db.imoveis.createIndex({ proprietarioId: 1 });
db.imoveis.createIndex({ "endereco.cidade": 1, status: 1 });
db.imoveis.createIndex({ comodidadeIds: 1 });
db.reservas.createIndex({ usuarioId: 1 });
db.reservas.createIndex({ imovelId: 1, dataEntrada: 1, dataSaida: 1 });
db.pagamentos.createIndex({ reservaId: 1 }, { unique: true }); // garante 1:1
db.avaliacoes.createIndex({ imovelId: 1, dataAvaliacao: -1 });
db.avaliacoes.createIndex({ reservaId: 1 }, { unique: true, sparse: true }); // 1 avaliação por reserva
db.disponibilidades.createIndex({ imovelId: 1, dataInicio: 1 });

print("Collections: " + db.getCollectionNames().join(", "));
