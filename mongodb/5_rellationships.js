// =============================================================
// 05_relationships.js — Demonstração dos relacionamentos
// Executar: mongosh --file mongodb/05_relationships.js
//
// REFERENCES são resolvidas com $lookup; EMBEDDED são lidos direto
// do documento (sem join).
// =============================================================

use("gestao_imoveis_temporada");

const oid = (prefixo, n) => ObjectId(prefixo + String(n).padStart(22, "0"));

// ---------- 1) Proprietário 1:N Imóvel (reference) ----------
print("\n[R1] Imóveis com os dados do proprietário");
printjson(db.imoveis.aggregate([
  { $lookup: { from: "proprietarios", localField: "proprietarioId", foreignField: "_id", as: "proprietario" } },
  { $unwind: "$proprietario" },
  { $project: { _id: 0, titulo: 1, "proprietario.nome": 1, "proprietario.email": 1 } }
]).toArray());

// ---------- 2) Imóvel N:N Comodidade (array de referências) ----------
print("\n[R2] Imóvel com os nomes das comodidades");
printjson(db.imoveis.aggregate([
  { $match: { _id: oid("a3", 1) } },
  { $lookup: { from: "comodidades", localField: "comodidadeIds", foreignField: "_id", as: "comodidades" } },
  { $project: { _id: 0, titulo: 1, "comodidades.nome": 1 } }
]).toArray());

// ---------- 3) Reserva → Usuário, Imóvel e Pagamento ----------
print("\n[R3] Reserva completa: hóspede, imóvel e pagamento");
printjson(db.reservas.aggregate([
  { $lookup: { from: "usuarios", localField: "usuarioId", foreignField: "_id", as: "usuario" } },
  { $lookup: { from: "imoveis", localField: "imovelId", foreignField: "_id", as: "imovel" } },
  { $lookup: { from: "pagamentos", localField: "_id", foreignField: "reservaId", as: "pagamento" } },
  { $unwind: "$usuario" }, { $unwind: "$imovel" }, { $unwind: "$pagamento" },
  { $project: {
      _id: 0, dataEntrada: 1, dataSaida: 1, statusReserva: 1,
      hospede: "$usuario.nome", imovel: "$imovel.titulo",
      valorPago: "$pagamento.valor", statusPagamento: "$pagamento.statusPagamento" } }
]).toArray());

// ---------- 4) Imóvel 1:N Avaliação — média das notas ----------
print("\n[R4] Média de notas por imóvel");
printjson(db.avaliacoes.aggregate([
  { $group: { _id: "$imovelId", mediaNota: { $avg: "$nota" }, totalAvaliacoes: { $sum: 1 } } },
  { $lookup: { from: "imoveis", localField: "_id", foreignField: "_id", as: "imovel" } },
  { $unwind: "$imovel" },
  { $project: { _id: 0, imovel: "$imovel.titulo", mediaNota: 1, totalAvaliacoes: 1 } },
  { $sort: { mediaNota: -1 } }
]).toArray());

// ---------- 5) Imóvel 1:N Disponibilidade ----------
print("\n[R5] Períodos de disponibilidade do imóvel 1");
printjson(db.disponibilidades.find(
  { imovelId: oid("a3", 1) },
  { _id: 0, dataInicio: 1, dataFim: 1, status: 1 }
).sort({ dataInicio: 1 }).toArray());

// ---------- 6) Embedded: dados lidos SEM join ----------
print("\n[R6] Endereço e fotos do imóvel (embedded, uma única leitura)");
printjson(db.imoveis.findOne({ _id: oid("a3", 3) }, { _id: 0, titulo: 1, endereco: 1, fotos: 1 }));

print("\n[R7] Histórico de status de um pagamento (embedded)");
printjson(db.pagamentos.findOne({ reservaId: oid("a4", 6) }, { _id: 0, statusPagamento: 1, historicoStatus: 1 }));

// ---------- 7) Regra de negócio: conflito de datas ----------
// Há conflito se uma reserva ativa começa antes do fim desejado
// e termina depois do início desejado.
print("\n[R8] Imóvel 1 está livre entre 30/12/2026 e 03/01/2027? (lista conflitos)");
printjson(db.reservas.find({
  imovelId: oid("a3", 1),
  statusReserva: { $in: ["pendente", "confirmada"] },
  dataEntrada: { $lt: ISODate("2027-01-03") },
  dataSaida: { $gt: ISODate("2026-12-30") }
}, { _id: 1, dataEntrada: 1, dataSaida: 1, statusReserva: 1 }).toArray());
