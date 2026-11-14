// =============================================================
// 01_database.js — Criação/seleção do banco de dados
// Executar: mongosh --file mongodb/01_database.js
// =============================================================

use("gestao_imoveis_temporada");

print("Banco em uso: " + db.getName());

// Para recomeçar do zero (CUIDADO: apaga tudo), descomente:
// db.dropDatabase();
