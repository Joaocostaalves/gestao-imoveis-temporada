
// =============================================================
// 03_insert_data.js — Inserção dos dados de exemplo
// Executar: mongosh --file mongodb/03_insert_data.js
//
// Os _id são fixos (ObjectId com prefixo por collection) para que os
// relacionamentos sejam reproduzíveis e os scripts 04/05 funcionem
// de forma independente. Em produção, o MongoDB geraria os ObjectId.
// Todos os dados são fictícios.
// =============================================================

use("gestao_imoveis_temporada");

// Helper: prefixo hexadecimal (2 chars) + número com zeros à esquerda (22 chars)
const oid = (prefixo, n) => ObjectId(prefixo + String(n).padStart(22, "0"));

// IDs por collection
const U = (n) => oid("a1", n); // usuarios
const P = (n) => oid("a2", n); // proprietarios
const I = (n) => oid("a3", n); // imoveis
const R = (n) => oid("a4", n); // reservas

// Limpa para permitir reexecução do script
["usuarios", "proprietarios", "comodidades", "imoveis",
 "reservas", "pagamentos", "avaliacoes", "disponibilidades"]
  .forEach((c) => db.getCollection(c).deleteMany({}));

// ---------- USUÁRIOS (hóspedes) ----------
db.usuarios.insertMany([
  { _id: U(1), nome: "Maria Souza", email: "maria.souza@email.com", telefone: "75991110001",
    senhaHash: "$2b$10$hashficticio1", dataNascimento: ISODate("1992-03-14"),
    tipoUsuario: "hospede", ativo: true, dataCadastro: ISODate("2026-05-02") },
  { _id: U(2), nome: "João Pereira", email: "joao.pereira@email.com", telefone: "75991110002",
    senhaHash: "$2b$10$hashficticio2", dataNascimento: ISODate("1988-11-30"),
    tipoUsuario: "hospede", ativo: true, dataCadastro: ISODate("2026-05-20") },
  { _id: U(3), nome: "Ana Lima", email: "ana.lima@email.com", telefone: "71991110003",
    senhaHash: "$2b$10$hashficticio3", dataNascimento: ISODate("1995-07-08"),
    tipoUsuario: "hospede", ativo: true, dataCadastro: ISODate("2026-06-11") },
  { _id: U(4), nome: "Carlos Mendes", email: "carlos.mendes@email.com", telefone: "71991110004",
    senhaHash: "$2b$10$hashficticio4", dataNascimento: ISODate("1980-01-25"),
    tipoUsuario: "hospede", ativo: true, dataCadastro: ISODate("2026-08-03") }
]);

// ---------- PROPRIETÁRIOS ----------
db.proprietarios.insertMany([
  { _id: P(1), nome: "Roberto Alves", email: "roberto.alves@email.com", telefone: "71988880001",
    documento: "111.444.777-35", dataCadastro: ISODate("2026-04-10") },
  { _id: P(2), nome: "Fernanda Costa", email: "fernanda.costa@email.com", telefone: "75988880002",
    documento: "529.982.247-25", dataCadastro: ISODate("2026-04-18") },
  { _id: P(3), nome: "Paulo Nascimento", email: "paulo.nascimento@email.com", telefone: "75988880003",
    documento: "390.533.447-05", dataCadastro: ISODate("2026-05-05") }
]);

// ---------- COMODIDADES (catálogo, _id personalizado) ----------
db.comodidades.insertMany([
  { _id: "wifi", nome: "Wi-Fi", descricao: "Internet sem fio de alta velocidade" },
  { _id: "piscina", nome: "Piscina", descricao: "Piscina privativa ou do condomínio" },
  { _id: "ar-condicionado", nome: "Ar-condicionado", descricao: "Ar-condicionado nos quartos" },
  { _id: "estacionamento", nome: "Estacionamento", descricao: "Vaga de garagem" },
  { _id: "churrasqueira", nome: "Churrasqueira", descricao: "Área gourmet com churrasqueira" },
  { _id: "cozinha-completa", nome: "Cozinha completa", descricao: "Utensílios e eletrodomésticos" }
]);

// ---------- IMÓVEIS ----------
// EMBEDDED: endereco (1:1) e fotos (array limitado)
// REFERENCE: proprietarioId (N:1) e comodidadeIds (N:N)
// Schema flexível: o imóvel 1 tem "taxaLimpeza" e o imóvel 3 tem "desconto"
db.imoveis.insertMany([
  { _id: I(1), titulo: "Casa de Praia em Itapuã",
    descricao: "Casa a 100 m da praia, ideal para famílias.",
    valorDiaria: NumberDecimal("450.00"), quantidadeHospedes: NumberInt(8),
    quartos: NumberInt(4), categoria: "casa", status: "ativo",
    proprietarioId: P(1),
    endereco: { rua: "Rua das Dunas", numero: "120", bairro: "Itapuã", cidade: "Salvador",
                estado: "BA", pais: "Brasil", cep: "41620-000",
                latitude: -12.9526, longitude: -38.3593 },
    comodidadeIds: ["wifi", "piscina", "churrasqueira", "estacionamento"],
    fotos: [
      { urlImagem: "https://exemplo.com/img/casa-praia-1.jpg", descricao: "Fachada", principal: true },
      { urlImagem: "https://exemplo.com/img/casa-praia-2.jpg", descricao: "Sala", principal: false },
      { urlImagem: "https://exemplo.com/img/casa-praia-3.jpg", descricao: "Piscina", principal: false }
    ],
    taxaLimpeza: NumberDecimal("120.00"),
    dataCadastro: ISODate("2026-04-12") },

  { _id: I(2), titulo: "Apartamento Centro",
    descricao: "Apartamento mobiliado no centro de Feira de Santana.",
    valorDiaria: NumberDecimal("220.00"), quantidadeHospedes: NumberInt(4),
    quartos: NumberInt(2), categoria: "apartamento", status: "ativo",
    proprietarioId: P(2),
    endereco: { rua: "Av. Getúlio Vargas", numero: "850", bairro: "Centro", cidade: "Feira de Santana",
                estado: "BA", pais: "Brasil", cep: "44001-000",
                latitude: -12.2664, longitude: -38.9663 },
    comodidadeIds: ["wifi", "ar-condicionado", "estacionamento"],
    fotos: [
      { urlImagem: "https://exemplo.com/img/apto-centro-1.jpg", descricao: "Sala", principal: true },
      { urlImagem: "https://exemplo.com/img/apto-centro-2.jpg", descricao: "Quarto", principal: false }
    ],
    dataCadastro: ISODate("2026-04-20") },

  { _id: I(3), titulo: "Chalé na Chapada",
    descricao: "Chalé aconchegante próximo às cachoeiras.",
    valorDiaria: NumberDecimal("380.00"), quantidadeHospedes: NumberInt(6),
    quartos: NumberInt(3), categoria: "chale", status: "ativo",
    proprietarioId: P(3),
    endereco: { rua: "Estrada da Cachoeira", numero: "S/N", bairro: "Zona Rural", cidade: "Lençóis",
                estado: "BA", pais: "Brasil", cep: "46960-000",
                latitude: -12.5628, longitude: -41.3908 },
    comodidadeIds: ["wifi", "cozinha-completa", "churrasqueira"],
    fotos: [
      { urlImagem: "https://exemplo.com/img/chale-1.jpg", descricao: "Varanda", principal: true },
      { urlImagem: "https://exemplo.com/img/chale-2.jpg", descricao: "Quarto", principal: false },
      { urlImagem: "https://exemplo.com/img/chale-3.jpg", descricao: "Vista", principal: false }
    ],
    desconto: { percentual: NumberInt(10), validoAte: ISODate("2026-12-31"), motivo: "Baixa temporada" },
    dataCadastro: ISODate("2026-05-08") },

  { _id: I(4), titulo: "Flat Beira-Mar em Porto de Galinhas",
    descricao: "Flat com vista para o mar e acesso à piscina do resort.",
    valorDiaria: NumberDecimal("510.00"), quantidadeHospedes: NumberInt(4),
    quartos: NumberInt(1), categoria: "flat", status: "ativo",
    proprietarioId: P(1),
    endereco: { rua: "Av. Beira-Mar", numero: "45", bairro: "Porto de Galinhas", cidade: "Ipojuca",
                estado: "PE", pais: "Brasil", cep: "55590-000",
                latitude: -8.5069, longitude: -35.0017 },
    comodidadeIds: ["wifi", "piscina", "ar-condicionado"],
    fotos: [
      { urlImagem: "https://exemplo.com/img/flat-1.jpg", descricao: "Vista do mar", principal: true }
    ],
    dataCadastro: ISODate("2026-06-01") },

  { _id: I(5), titulo: "Casa em Morro de São Paulo",
    descricao: "Casa simples, atualmente fora de temporada.",
    valorDiaria: NumberDecimal("300.00"), quantidadeHospedes: NumberInt(5),
    quartos: NumberInt(2), categoria: "casa", status: "inativo",
    proprietarioId: P(3),
    endereco: { rua: "Travessa do Farol", numero: "10", bairro: "Centro", cidade: "Cairu",
                estado: "BA", pais: "Brasil", cep: "45420-000",
                latitude: -13.3794, longitude: -38.9156 },
    comodidadeIds: ["wifi"],
    fotos: [],
    dataCadastro: ISODate("2026-06-15") }
]);

// ---------- RESERVAS ----------
// EMBEDDED: imovelSnapshot (preço/título no momento da reserva)
// REFERENCE: usuarioId e imovelId
db.reservas.insertMany([
  { _id: R(1), usuarioId: U(1), imovelId: I(1),
    dataEntrada: ISODate("2026-07-10"), dataSaida: ISODate("2026-07-15"),
    noites: NumberInt(5), quantidadeHospedes: NumberInt(4),
    valorTotal: NumberDecimal("2250.00"), statusReserva: "concluida",
    imovelSnapshot: { titulo: "Casa de Praia em Itapuã", valorDiaria: NumberDecimal("450.00") },
    dataCriacao: ISODate("2026-06-20") },
  { _id: R(2), usuarioId: U(2), imovelId: I(2),
    dataEntrada: ISODate("2026-08-01"), dataSaida: ISODate("2026-08-04"),
    noites: NumberInt(3), quantidadeHospedes: NumberInt(2),
    valorTotal: NumberDecimal("660.00"), statusReserva: "concluida",
    imovelSnapshot: { titulo: "Apartamento Centro", valorDiaria: NumberDecimal("220.00") },
    dataCriacao: ISODate("2026-07-15") },
  { _id: R(3), usuarioId: U(3), imovelId: I(3),
    dataEntrada: ISODate("2026-09-05"), dataSaida: ISODate("2026-09-08"),
    noites: NumberInt(3), quantidadeHospedes: NumberInt(5),
    valorTotal: NumberDecimal("1140.00"), statusReserva: "concluida",
    imovelSnapshot: { titulo: "Chalé na Chapada", valorDiaria: NumberDecimal("380.00") },
    dataCriacao: ISODate("2026-08-10") },
  { _id: R(4), usuarioId: U(1), imovelId: I(4),
    dataEntrada: ISODate("2026-12-20"), dataSaida: ISODate("2026-12-27"),
    noites: NumberInt(7), quantidadeHospedes: NumberInt(3),
    valorTotal: NumberDecimal("3570.00"), statusReserva: "confirmada",
    imovelSnapshot: { titulo: "Flat Beira-Mar em Porto de Galinhas", valorDiaria: NumberDecimal("510.00") },
    dataCriacao: ISODate("2026-10-02") },
  { _id: R(5), usuarioId: U(4), imovelId: I(1),
    dataEntrada: ISODate("2026-12-28"), dataSaida: ISODate("2027-01-02"),
    noites: NumberInt(5), quantidadeHospedes: NumberInt(6),
    valorTotal: NumberDecimal("2250.00"), statusReserva: "pendente",
    imovelSnapshot: { titulo: "Casa de Praia em Itapuã", valorDiaria: NumberDecimal("450.00") },
    dataCriacao: ISODate("2026-11-05") },
  { _id: R(6), usuarioId: U(2), imovelId: I(3),
    dataEntrada: ISODate("2026-10-10"), dataSaida: ISODate("2026-10-12"),
    noites: NumberInt(2), quantidadeHospedes: NumberInt(2),
    valorTotal: NumberDecimal("760.00"), statusReserva: "cancelada",
    imovelSnapshot: { titulo: "Chalé na Chapada", valorDiaria: NumberDecimal("380.00") },
    dataCriacao: ISODate("2026-09-20") }
]);

// ---------- PAGAMENTOS ----------
// REFERENCE: reservaId (1:1, garantido por índice único)
// EMBEDDED: historicoStatus (array de mudanças de status)
db.pagamentos.insertMany([
  { reservaId: R(1), valor: NumberDecimal("2250.00"), metodoPagamento: "cartao_credito",
    parcelas: NumberInt(3), statusPagamento: "pago", dataPagamento: ISODate("2026-06-20"),
    historicoStatus: [
      { status: "pendente", data: ISODate("2026-06-20T10:00:00Z") },
      { status: "pago", data: ISODate("2026-06-20T10:02:00Z") } ] },
  { reservaId: R(2), valor: NumberDecimal("660.00"), metodoPagamento: "pix",
    parcelas: NumberInt(1), statusPagamento: "pago", dataPagamento: ISODate("2026-07-15"),
    historicoStatus: [
      { status: "pendente", data: ISODate("2026-07-15T09:00:00Z") },
      { status: "pago", data: ISODate("2026-07-15T09:01:00Z") } ] },
  { reservaId: R(3), valor: NumberDecimal("1140.00"), metodoPagamento: "pix",
    parcelas: NumberInt(1), statusPagamento: "pago", dataPagamento: ISODate("2026-08-10"),
    historicoStatus: [
      { status: "pendente", data: ISODate("2026-08-10T14:00:00Z") },
      { status: "pago", data: ISODate("2026-08-10T14:01:00Z") } ] },
  { reservaId: R(4), valor: NumberDecimal("3570.00"), metodoPagamento: "cartao_credito",
    parcelas: NumberInt(6), statusPagamento: "pago", dataPagamento: ISODate("2026-10-02"),
    historicoStatus: [
      { status: "pendente", data: ISODate("2026-10-02T16:00:00Z") },
      { status: "pago", data: ISODate("2026-10-02T16:03:00Z") } ] },
  { reservaId: R(5), valor: NumberDecimal("2250.00"), metodoPagamento: "boleto",
    parcelas: NumberInt(1), statusPagamento: "pendente", dataPagamento: null,
    historicoStatus: [
      { status: "pendente", data: ISODate("2026-11-05T11:00:00Z") } ] },
  { reservaId: R(6), valor: NumberDecimal("760.00"), metodoPagamento: "pix",
    parcelas: NumberInt(1), statusPagamento: "estornado", dataPagamento: ISODate("2026-09-20"),
    historicoStatus: [
      { status: "pendente", data: ISODate("2026-09-20T08:00:00Z") },
      { status: "pago", data: ISODate("2026-09-20T08:01:00Z") },
      { status: "estornado", data: ISODate("2026-09-25T12:00:00Z") } ] }
]);

// ---------- AVALIAÇÕES (apenas reservas concluídas) ----------
// REFERENCE: usuarioId, imovelId, reservaId — EMBEDDED: detalhes (notas por critério)
db.avaliacoes.insertMany([
  { usuarioId: U(1), imovelId: I(1), reservaId: R(1), nota: NumberInt(5),
    comentario: "Casa perfeita, perto da praia e muito limpa.",
    detalhes: { limpeza: NumberInt(5), localizacao: NumberInt(5), custoBeneficio: NumberInt(4) },
    dataAvaliacao: ISODate("2026-07-17") },
  { usuarioId: U(2), imovelId: I(2), reservaId: R(2), nota: NumberInt(4),
    comentario: "Bem localizado, mas o ar-condicionado era barulhento.",
    detalhes: { limpeza: NumberInt(4), localizacao: NumberInt(5), custoBeneficio: NumberInt(4) },
    dataAvaliacao: ISODate("2026-08-06") },
  { usuarioId: U(3), imovelId: I(3), reservaId: R(3), nota: NumberInt(5),
    comentario: "Lugar incrível, anfitrião atencioso.",
    detalhes: { limpeza: NumberInt(5), localizacao: NumberInt(4), custoBeneficio: NumberInt(5) },
    dataAvaliacao: ISODate("2026-09-10") }
]);

// ---------- DISPONIBILIDADES ----------
db.disponibilidades.insertMany([
  { imovelId: I(1), dataInicio: ISODate("2026-07-10"), dataFim: ISODate("2026-07-15"), status: "reservado" },
  { imovelId: I(1), dataInicio: ISODate("2026-12-28"), dataFim: ISODate("2027-01-02"), status: "reservado" },
  { imovelId: I(1), dataInicio: ISODate("2026-11-15"), dataFim: ISODate("2026-12-27"), status: "disponivel" },
  { imovelId: I(2), dataInicio: ISODate("2026-11-01"), dataFim: ISODate("2026-12-31"), status: "disponivel" },
  { imovelId: I(3), dataInicio: ISODate("2026-11-01"), dataFim: ISODate("2026-11-30"), status: "bloqueado" },
  { imovelId: I(4), dataInicio: ISODate("2026-12-20"), dataFim: ISODate("2026-12-27"), status: "reservado" }
]);

// Conferência
["usuarios", "proprietarios", "comodidades", "imoveis", "reservas", "pagamentos", "avaliacoes", "disponibilidades"]
  .forEach((c) => print(c + ": " + db.getCollection(c).countDocuments()));
