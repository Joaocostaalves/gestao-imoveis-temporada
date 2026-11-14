# Levantamento das Entidades do Projeto

# Sistema de Gerenciamento de Imóveis por Temporada

## 1. Lista das Entidades

As principais entidades identificadas para o sistema são:

1. Usuário
2. Proprietário
3. Imóvel
4. Reserva
5. Pagamento
6. Avaliação
7. Endereço
8. Comodidade
9. Disponibilidade
10. Foto do Imóvel


# 2. Descrição das Entidades


## 2.1 Usuário

### Descrição

Pessoa que utiliza a plataforma para realizar reservas de imóveis por temporada.

### Responsabilidade no sistema

Permitir que clientes realizem cadastro, login, consulta de imóveis, reservas e avaliações.

### Principais atributos

- _id
- nome
- email
- telefone
- senha
- dataNascimento
- tipoUsuario
- dataCadastro


---

## 2.2 Proprietário

### Descrição

Pessoa responsável por disponibilizar imóveis para aluguel na plataforma.

### Responsabilidade no sistema

Cadastrar imóveis, gerenciar anúncios, controlar disponibilidade e acompanhar reservas.

### Principais atributos

- _id
- nome
- email
- telefone
- documento
- dataCadastro


---

## 2.3 Imóvel

### Descrição

Propriedade cadastrada na plataforma para aluguel por temporada.

### Responsabilidade no sistema

Disponibilizar informações do imóvel para que usuários possam pesquisar e realizar reservas.

### Principais atributos

- _id
- titulo
- descricao
- valorDiaria
- quantidadeHospedes
- categoria
- status
- proprietarioId
- endereco
- comodidades
- fotos


---

## 2.4 Reserva

### Descrição

Registro de uma hospedagem realizada por um usuário em determinado imóvel.

### Responsabilidade no sistema

Controlar datas de hospedagem, usuário, imóvel e situação da reserva.

### Principais atributos

- _id
- usuarioId
- imovelId
- dataEntrada
- dataSaida
- quantidadeHospedes
- statusReserva
- dataCriacao


---

## 2.5 Pagamento

### Descrição

Registro financeiro relacionado a uma reserva.

### Responsabilidade no sistema

Controlar valores, formas de pagamento e confirmação financeira das reservas.

### Principais atributos

- _id
- reservaId
- valor
- metodoPagamento
- statusPagamento
- dataPagamento


---

## 2.6 Avaliação

### Descrição

Opinião realizada pelo usuário após uma hospedagem.

### Responsabilidade no sistema

Permitir que clientes avaliem imóveis e compartilhem suas experiências.

### Principais atributos

- _id
- usuarioId
- imovelId
- nota
- comentario
- dataAvaliacao


---

## 2.7 Endereço

### Descrição

Informações de localização do imóvel cadastrado.

### Responsabilidade no sistema

Armazenar os dados necessários para localização do imóvel.

### Principais atributos

- rua
- numero
- bairro
- cidade
- estado
- pais
- cep
- latitude
- longitude


---

## 2.8 Comodidade

### Descrição

Características e recursos disponíveis em um imóvel.

Exemplos:

- Wi-Fi
- Piscina
- Ar-condicionado
- Estacionamento

### Responsabilidade no sistema

Informar aos usuários quais recursos o imóvel oferece.

### Principais atributos

- _id
- nome
- descricao


---

## 2.9 Disponibilidade

### Descrição

Controle das datas disponíveis para reserva de um imóvel.

### Responsabilidade no sistema

Evitar conflitos de reservas e controlar períodos disponíveis.

### Principais atributos

- _id
- imovelId
- dataInicio
- dataFim
- status


---

## 2.10 Foto do Imóvel

### Descrição

Imagens relacionadas aos imóveis cadastrados na plataforma.

### Responsabilidade no sistema

Apresentar visualmente os imóveis disponíveis para os usuários.

### Principais atributos

- _id
- imovelId
- urlImagem
- descricao


---

# 3. Relacionamentos Identificados


## Usuário e Reserva

Um usuário pode realizar várias reservas.

Relacionamento:

Usuário 1:N Reserva


---

## Proprietário e Imóvel

Um proprietário pode cadastrar vários imóveis.

Relacionamento:

Proprietário 1:N Imóvel


---

## Imóvel e Reserva

Um imóvel pode possuir várias reservas ao longo do tempo.

Relacionamento:

Imóvel 1:N Reserva


---

## Reserva e Pagamento

Cada reserva possui um pagamento associado.

Relacionamento:

Reserva 1:1 Pagamento


---

## Imóvel e Avaliação

Um imóvel pode receber várias avaliações.

Relacionamento:

Imóvel 1:N Avaliação


---

## Imóvel e Comodidade

Um imóvel pode possuir diversas comodidades e uma comodidade pode estar presente em vários imóveis.

Relacionamento:

Imóvel N:N Comodidade


---

# 4. Modelagem Pensando em MongoDB


## Documentos Incorporados (Embedded Documents)


Algumas informações serão armazenadas dentro do próprio documento principal.

Exemplo:

O endereço pode ser incorporado ao documento do imóvel.


```json
{
  "titulo": "Casa de Praia",
  "valorDiaria": 350,
  "endereco": {
    "cidade": "Salvador",
    "estado": "BA",
    "pais": "Brasil"
  }
}
```


### Justificativa

O endereço possui forte relação com o imóvel e normalmente será consultado junto com ele.

Por isso, não é necessário criar uma collection separada somente para endereço.


---

## Comodidades como documento incorporado


Exemplo:

```json
{
  "titulo": "Apartamento Centro",
  "comodidades": [
    "Wi-Fi",
    "Piscina",
    "Garagem"
  ]
}
```


### Justificativa

As comodidades possuem poucos dados e são utilizadas principalmente para exibição das informações do imóvel.


---

# 5. Collections Separadas


Algumas entidades devem possuir collections próprias no MongoDB.


## Usuário

Será uma collection separada porque possui dados próprios de autenticação e informações pessoais.


## Imóvel

Será uma collection separada porque representa o principal recurso do sistema e terá grande quantidade de registros.


## Reserva

Será uma collection separada porque possui informações próprias, consultas por datas e histórico de hospedagens.


## Pagamento

Será uma collection separada devido à necessidade de controle financeiro e histórico de transações.


## Avaliação

Será uma collection separada porque terá crescimento contínuo conforme usuários avaliam imóveis.


---

# 6. Justificativa das Decisões de Modelagem


A modelagem foi definida considerando a forma como a aplicação irá utilizar os dados.

No MongoDB, uma entidade não precisa obrigatoriamente representar uma collection separada.

Informações pequenas e diretamente relacionadas ao documento principal foram definidas como documentos incorporados.

Informações independentes, com grande volume de dados ou que possuem consultas próprias, foram definidas como collections separadas.

Essa abordagem permite uma estrutura mais flexível, melhora o desempenho das consultas e aproveita as características de bancos de dados NoSQL.


---
