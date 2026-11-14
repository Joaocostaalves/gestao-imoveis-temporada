
// =============================================================
// 04_queries.js — Consultas para validar a modelagem
// Executar: mongosh --file mongodb/04_queries.js
// =============================================================

use("gestao_imoveis_temporada");

const oid = (prefixo, n) => ObjectId(prefixo + String(n).padStart(22, "0"));

// ---------- A) 3 CONSULTAS SIMPLES ----------
print("\n[1] Imóveis ativos");
printjson(db.imoveis.find({ status: "ativo" }).toArray());

print("\n[2] Usuário pelo e-mail");
printjson(db.usuarios.findOne({ email: "maria.souza@email.com" }));

print("\n[3] Reservas confirmadas");
printjson(db.reservas.find({ statusReserva: "confirmada" }).toArray());

// ---------- B) 2 CONSULTAS COM MÚLTIPLAS CONDIÇÕES ----------
print("\n[4] Imóveis ativos em Salvador, para 4+ hóspedes e diária até R$ 500");
printjson(db.imoveis.find({
  status: "ativo",
  "endereco.cidade": "Salvador",
  quantidadeHospedes: { $gte: 4 },
  valorDiaria: { $lte: NumberDecimal("500.00") }
}).toArray());

print("\n[5] Reservas futuras (a partir de 01/12/2026) pendentes OU confirmadas");
printjson(db.reservas.find({
  dataEntrada: { $gte: ISODate("2026-12-01") },
  statusReserva: { $in: ["pendente", "confirmada"] }
}).toArray());

// ---------- C) 3 CONSULTAS COM PROJEÇÃO (uma por tela) ----------
print("\n[6] Tela inicial: título, diária, cidade e foto de capa");
printjson(db.imoveis.find(
  { status: "ativo" },
  { _id: 0, titulo: 1, valorDiaria: 1, "endereco.cidade": 1, fotos: { $slice: 1 } }
).toArray());

print("\n[7] Tela de detalhes: título, descrição, diária, categoria, endereço e comodidades");
printjson(db.imoveis.find(
  { _id: oid("a3", 1) },
  { titulo: 1, descricao: 1, valorDiaria: 1, categoria: 1, endereco: 1, comodidadeIds: 1 }
).toArray());

print("\n[8] Lista de reservas: datas, valor e status");
printjson(db.reservas.find(
  {},
  { _id: 0, "imovelSnapshot.titulo": 1, dataEntrada: 1, dataSaida: 1, valorTotal: 1, statusReserva: 1 }
).toArray());

// ---------- D) 1 CONSULTA UTILIZANDO UMA REFERÊNCIA ----------
// Em duas etapas: busca o usuário e usa o _id dele para achar as reservas
print("\n[9] Reservas da Maria (via referência usuarioId)");
const maria = db.usuarios.findOne({ email: "maria.souza@email.com" });
printjson(db.reservas.find({ usuarioId: maria._id }, { imovelId: 1, dataEntrada: 1, statusReserva: 1 }).toArray());

// ---------- E) 1 CONSULTA COM EMBEDDED DOCUMENT ----------
print("\n[10] Imóveis na Bahia, na cidade de Lençóis (campos do endereço embutido)");
printjson(db.imoveis.find(
  { "endereco.estado": "BA", "endereco.cidade": "Lençóis" },
  { titulo: 1, endereco: 1 }
).toArray());

// ---------- F) 1 CONSULTA UTILIZANDO ARRAY ----------
print("\n[11] Imóveis que têm Wi-Fi E piscina ($all no array de comodidades)");
printjson(db.imoveis.find(
  { comodidadeIds: { $all: ["wifi", "piscina"] } },
  { _id: 0, titulo: 1, comodidadeIds: 1 }
).toArray());

print("\n[11b] Imóveis com foto principal cadastrada ($elemMatch no array de fotos)");
printjson(db.imoveis.find(
  { fotos: { $elemMatch: { principal: true } } },
  { _id: 0, titulo: 1 }
).toArray());

// ---------- G) 1 CONSULTA UTILIZANDO ORDENAÇÃO ----------
print("\n[12] Imóveis ativos do mais barato ao mais caro");
printjson(db.imoveis.find(
  { status: "ativo" },
  { _id: 0, titulo: 1, valorDiaria: 1 }
).sort({ valorDiaria: 1 }).toArray());

print("\n[12b] Avaliações da mais bem avaliada para a menor, desempate pela data mais recente");
printjson(db.avaliacoes.find({}, { _id: 0, nota: 1, comentario: 1, dataAvaliacao: 1 })
  .sort({ nota: -1, dataAvaliacao: -1 }).toArray());

// ---------- H) SCHEMA FLEXÍVEL ----------
print("\n[13] Imóveis com estrutura diferente: taxaLimpeza (imóvel 1) e desconto (imóvel 3)");
printjson(db.imoveis.find(
  { $or: [{ taxaLimpeza: { $exists: true } }, { desconto: { $exists: true } }] },
  { _id: 0, titulo: 1, taxaLimpeza: 1, desconto: 1 }
).toArray());
