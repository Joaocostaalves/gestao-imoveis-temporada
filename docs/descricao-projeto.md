## Estrutura do Projeto
O projeto foi estruturado seguindo o padrão MVC para Spring Boot:
- `models`: Mapeamento das 10 entidades e dos documentos incorporados.
- `repositories`: Interfaces estendendo `MongoRepository`.
- `services`: Camada de regras de negócio e validações de integridade referencial.
- `controllers`: API REST expondo os endpoints CRUD com status HTTP adequados.

## Decisões de Modelagem e Persistência
- **Embedded Documents:** `Endereco`, `FotoImovel`, `ImovelSnapshot`, `HistoricoStatus` e `DetalhesAvaliacao`.
- **References:** `Imovel.proprietario`, `Imovel.comodidades`, `Reserva.usuario`, `Reserva.imovel`, `Pagamento.reserva`, `Avaliacao.usuario`, `Avaliacao.imovel`, `Avaliacao.reserva`, `Disponibilidade.imovel`.

## Regras de Negócio Implementadas
1. **Validação de E-mail Único:** `UsuarioService` verifica duplicidade e retorna HTTP 409 Conflict.
2. **Integridade Referencial do Proprietário:** `ImovelService` valida a existência prévia do proprietário.
3. **Prevenção de Sobreposição de Reservas:** `ReservaService` impede reservas conflitantes no mesmo imóvel.

